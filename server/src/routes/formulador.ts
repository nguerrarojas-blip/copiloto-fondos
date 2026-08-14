/** Panel del formulador (backend). Sin asignación automática: el formulador toma
 * el expediente y queda registrado. Autenticación de piloto por cabecera de correo;
 * endurecer con sesión real antes de abrir a más formuladores. */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../db.ts';
import { sendTransactional } from '../email.ts';
import { issueToken } from '../tokens.ts';
import { env } from '../env.ts';
import type { AppState } from '../rules.ts';
import { computeSections } from '../../../src/state/selectors.ts';
import { analyzeExpediente } from '../../../src/domain/expediente.ts';

declare module 'fastify' {
  interface FastifyRequest {
    formuladorId?: string;
    formuladorNombre?: string;
  }
}

async function requireFormulador(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const email = String(req.headers['x-formulador-email'] || '');
  if (!email) return reply.code(401).send({ error: 'falta_formulador' });
  const rows = await query<{ id: string; nombre: string }>(
    `SELECT id, nombre FROM formulador WHERE lower(email) = lower($1) AND activo = true`,
    [email],
  );
  if (!rows.length) return reply.code(403).send({ error: 'formulador_no_autorizado' });
  req.formuladorId = rows[0].id;
  req.formuladorNombre = rows[0].nombre;
}

interface BandejaRow {
  id: string;
  fondo_id: string;
  piloto_email: string;
  estado_label: string;
  hard_issues: number;
  progress_pct: number;
  lev_stage: string;
  updated_at: string;
}

export async function formuladorRoutes(app: FastifyInstance): Promise<void> {
  // KPIs de la bandeja.
  app.get('/api/formulador/kpis', { preHandler: requireFormulador }, async (req, reply) => {
    const [pend] = await query<{ n: string }>(`SELECT count(*) n FROM postulacion WHERE lev_stage = 'revision' AND formulador_id IS NULL`);
    const [mios] = await query<{ n: string }>(`SELECT count(*) n FROM postulacion WHERE formulador_id = $1 AND lev_stage IN ('revision','devuelto')`, [req.formuladorId]);
    const [entregados] = await query<{ n: string }>(`SELECT count(*) n FROM postulacion WHERE formulador_id = $1 AND lev_stage = 'done'`, [req.formuladorId]);
    return reply.send({
      pendientes: Number(pend.n),
      mios: Number(mios.n),
      entregados: Number(entregados.n),
      nombre: req.formuladorNombre,
    });
  });

  // Bandeja por pestaña, ordenada por el fondo que cierra antes (heurística por fondo).
  app.get('/api/formulador/bandeja', { preHandler: requireFormulador }, async (req, reply) => {
    const tab = z.enum(['pendientes', 'mios', 'entregados']).catch('pendientes').parse((req.query as { tab?: string })?.tab);
    let rows: BandejaRow[] = [];
    if (tab === 'pendientes') {
      rows = await query<BandejaRow>(`SELECT id, fondo_id, piloto_email, estado_label, hard_issues, progress_pct, lev_stage, updated_at
        FROM postulacion WHERE lev_stage = 'revision' AND formulador_id IS NULL ORDER BY updated_at ASC`);
    } else if (tab === 'mios') {
      rows = await query<BandejaRow>(`SELECT id, fondo_id, piloto_email, estado_label, hard_issues, progress_pct, lev_stage, updated_at
        FROM postulacion WHERE formulador_id = $1 AND lev_stage IN ('revision','devuelto') ORDER BY updated_at ASC`, [req.formuladorId]);
    } else {
      rows = await query<BandejaRow>(`SELECT id, fondo_id, piloto_email, estado_label, hard_issues, progress_pct, lev_stage, updated_at
        FROM postulacion WHERE formulador_id = $1 AND lev_stage = 'done' ORDER BY updated_at DESC`, [req.formuladorId]);
    }
    return reply.send({ tab, expedientes: rows });
  });

  // Tomar un expediente (queda registrado quién lo tomó).
  app.post('/api/formulador/tomar/:id', { preHandler: requireFormulador }, async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const rows = await query<{ id: string }>(
      `UPDATE postulacion SET formulador_id = $2 WHERE id = $1 AND formulador_id IS NULL RETURNING id`,
      [id, req.formuladorId],
    );
    if (!rows.length) return reply.code(409).send({ error: 'ya_tomado' });
    return reply.send({ ok: true });
  });

  // Aprobar y entregar (dispara el correo "Expediente listo").
  app.post('/api/formulador/aprobar/:id', { preHandler: requireFormulador }, async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const rows = await query<{ piloto_email: string }>(
      `UPDATE postulacion SET lev_stage = 'done' WHERE id = $1 AND formulador_id = $2 RETURNING piloto_email`,
      [id, req.formuladorId],
    );
    if (!rows.length) return reply.code(403).send({ error: 'no_es_tuyo' });
    const token = await issueToken(id, rows[0].piloto_email);
    const link = `${env.APP_BASE_URL}/app/?token=${token}`;
    await sendTransactional({ tipo: 'listo', postulacionId: id, to: rows[0].piloto_email, link });
    return reply.send({ ok: true });
  });

  // Expediente completo para la vista de revisión: secciones, hallazgos de los
  // agentes y comentarios ya enviados. Solo el dueño (o nadie aún) puede verlo.
  app.get('/api/formulador/expediente/:id', { preHandler: requireFormulador }, async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const rows = await query<{
      id: string;
      fondo_id: string;
      piloto_email: string;
      formulador_id: string | null;
      lev_stage: string;
      estado_label: string;
      hard_issues: number;
      progress_pct: number;
      state: AppState;
    }>(
      `SELECT id, fondo_id, piloto_email, formulador_id, lev_stage, estado_label, hard_issues, progress_pct, state
       FROM postulacion WHERE id = $1`,
      [id],
    );
    if (!rows.length) return reply.code(404).send({ error: 'no_existe' });
    const row = rows[0];
    if (row.formulador_id && row.formulador_id !== req.formuladorId) {
      return reply.code(403).send({ error: 'tomado_por_otro' });
    }

    const state = row.state;
    const { sections } = computeSections(state);
    const analysis = analyzeExpediente(state);
    const comentarios = await query(
      `SELECT id, seccion, block, texto, respuesta, resuelto, created_at
       FROM comentario WHERE postulacion_id = $1 ORDER BY created_at ASC`,
      [id],
    );

    return reply.send({
      id: row.id,
      fondoId: row.fondo_id,
      pilotoEmail: row.piloto_email,
      mine: row.formulador_id === req.formuladorId,
      levStage: row.lev_stage,
      estadoLabel: row.estado_label,
      hardIssues: row.hard_issues,
      progressPct: row.progress_pct,
      identidad: state.identidad,
      sections,
      budget: state.budget,
      team: state.team,
      stats: state.stats,
      agents: analysis.agents,
      estado: analysis.estado,
      comentarios,
    });
  });

  // Comentario al postulante: se guarda, devuelve el expediente y avisa por correo
  // con un enlace de acceso fresco (nunca inventa contenido del proyecto).
  app.post('/api/formulador/comentario', { preHandler: requireFormulador }, async (req, reply) => {
    const Body = z.object({
      postulacionId: z.string().uuid(),
      seccion: z.string().min(1),
      block: z.enum(['identidad', 'narrativa', 'presupuesto', 'datos', 'verificacion']),
      texto: z.string().min(5),
    });
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'datos_invalidos' });
    const { postulacionId, seccion, block, texto } = parsed.data;

    const rows = await query<{ piloto_email: string }>(
      `UPDATE postulacion SET lev_stage = 'devuelto'
       WHERE id = $1 AND formulador_id = $2 RETURNING piloto_email`,
      [postulacionId, req.formuladorId],
    );
    if (!rows.length) return reply.code(403).send({ error: 'no_es_tuyo' });

    await query(
      `INSERT INTO comentario (postulacion_id, formulador_id, seccion, block, texto)
       VALUES ($1, $2, $3, $4, $5)`,
      [postulacionId, req.formuladorId, seccion, block, texto],
    );

    const token = await issueToken(postulacionId, rows[0].piloto_email);
    const link = `${env.APP_BASE_URL}/app/?token=${token}`;
    await sendTransactional({ tipo: 'devuelto', postulacionId, to: rows[0].piloto_email, link });

    return reply.send({ ok: true });
  });
}
