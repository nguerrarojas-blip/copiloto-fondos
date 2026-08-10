/** Panel del formulador (backend). Sin asignación automática: el formulador toma
 * el expediente y queda registrado. Autenticación de piloto por cabecera de correo;
 * endurecer con sesión real antes de abrir a más formuladores. */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../db.ts';
import { sendTransactional } from '../email.ts';

declare module 'fastify' {
  interface FastifyRequest {
    formuladorId?: string;
  }
}

async function requireFormulador(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const email = String(req.headers['x-formulador-email'] || '');
  if (!email) return reply.code(401).send({ error: 'falta_formulador' });
  const rows = await query<{ id: string }>(
    `SELECT id FROM formulador WHERE lower(email) = lower($1) AND activo = true`,
    [email],
  );
  if (!rows.length) return reply.code(403).send({ error: 'formulador_no_autorizado' });
  req.formuladorId = rows[0].id;
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
    await sendTransactional({ tipo: 'listo', postulacionId: id, to: rows[0].piloto_email });
    return reply.send({ ok: true });
  });
}
