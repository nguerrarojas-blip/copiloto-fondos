/** Persistencia real de la postulación en servidor (reemplaza el localStorage del
 * prototipo). El estado se guarda íntegro en jsonb y el servidor recalcula los
 * derivados con el mismo motor de reglas del front.
 *
 * `lev_stage` y los comentarios del formulador NUNCA se confían del cliente más
 * allá de lo que el propio postulante puede accionar (enviar a revisión). Que un
 * expediente quede "devuelto" o "done" lo decide únicamente el panel del
 * formulador (server/src/routes/formulador.ts) — si no, el postulante podría
 * autoaprobarse mandando ese valor en el PUT. */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db.ts';
import { requirePostulante } from '../auth.ts';
import { normalizeState, deriveFields, validRut, type AppState } from '../rules.ts';
import { sendTransactional } from '../email.ts';
import { issueToken } from '../tokens.ts';
import { env } from '../env.ts';
import type { Comentario } from '../../../src/state/types.ts';

// Estos son los únicos valores de lev_stage que el propio postulante puede fijar.
// 'devuelto' y 'done' quedan reservados al panel del formulador.
const CLIENT_LEV_STAGES = ['work', 'verifying', 'scored', 'revision'];

export async function postulacionRoutes(app: FastifyInstance): Promise<void> {
  // Estado actual de la postulación (para retomar la sesión). lev_stage y
  // comentarios se devuelven desde su fuente de verdad en el servidor, no desde
  // lo último que el cliente guardó.
  app.get('/api/postulacion', { preHandler: requirePostulante }, async (req, reply) => {
    const rows = await query<{
      state: AppState;
      lev_stage: string;
      estado_label: string;
      hard_issues: number;
      progress_pct: number;
    }>(
      `SELECT state, lev_stage, estado_label, hard_issues, progress_pct FROM postulacion WHERE id = $1`,
      [req.postulacionId],
    );
    if (!rows.length) return reply.code(404).send({ error: 'no_existe' });
    const row = rows[0];

    const comentarioRows = await query<Comentario & { created_at: string }>(
      `SELECT id, seccion, block, texto, respuesta, resuelto, created_at
       FROM comentario WHERE postulacion_id = $1 ORDER BY created_at ASC`,
      [req.postulacionId],
    );

    return reply.send({
      state: {
        ...row.state,
        levStage: row.lev_stage,
        comentarios: comentarioRows.length ? comentarioRows : row.state.comentarios,
      },
      derived: { estadoLabel: row.estado_label, hardIssues: row.hard_issues, progressPct: row.progress_pct },
    });
  });

  // Guardado del estado. El cliente manda su snapshot; el servidor lo normaliza,
  // recalcula derivados y actualiza el perfil de empresa cuando el RUT es válido.
  app.put('/api/postulacion', { preHandler: requirePostulante }, async (req, reply) => {
    const Body = z.object({ state: z.record(z.unknown()) });
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'datos_invalidos' });

    const state = normalizeState(parsed.data.state as Partial<AppState>);
    const d = deriveFields(state);

    const current = await query<{ lev_stage: string; piloto_email: string }>(
      `SELECT lev_stage, piloto_email FROM postulacion WHERE id = $1`,
      [req.postulacionId],
    );
    if (!current.length) return reply.code(404).send({ error: 'no_existe' });
    const prevLevStage = current[0].lev_stage;
    const nextLevStage = CLIENT_LEV_STAGES.includes(state.levStage) ? state.levStage : prevLevStage;

    // Upsert del perfil de empresa a partir de la identidad (si el RUT es válido).
    let empresaId: string | null = null;
    const id = state.identidad;
    if (id?.rut && validRut(id.rut)) {
      const rutNorm = id.rut.replace(/[^0-9kK]/g, '').toUpperCase();
      const up = await query<{ id: string }>(
        `INSERT INTO empresa (razon_social, rut, direccion, comuna, telefono, rep_legal)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (rut) DO UPDATE SET
           razon_social = EXCLUDED.razon_social, direccion = EXCLUDED.direccion,
           comuna = EXCLUDED.comuna, telefono = EXCLUDED.telefono, rep_legal = EXCLUDED.rep_legal
         RETURNING id`,
        [id.razonSocial, rutNorm, id.direccion, id.comuna, id.telefono, id.repLegal],
      );
      empresaId = up[0].id;
    }

    await query(
      `UPDATE postulacion SET
         state = $2, screen = $3, block = $4, lev_stage = $5,
         estado_label = $6, hard_issues = $7, progress_pct = $8,
         consent = $9, reeditado = $10,
         empresa_id = COALESCE($11, empresa_id)
       WHERE id = $1`,
      [
        req.postulacionId, state, state.screen, state.block, nextLevStage,
        d.estadoLabel, d.hardIssues, d.progressPct,
        state.consent, state.reeditado, empresaId,
      ],
    );

    // Confirmación de recepción, una sola vez, en el momento exacto en que el
    // expediente entra a revisión.
    if (prevLevStage !== 'revision' && nextLevStage === 'revision') {
      const token = await issueToken(req.postulacionId!, current[0].piloto_email);
      const link = `${env.APP_BASE_URL}/app/?token=${token}`;
      await sendTransactional({ tipo: 'en_revision', postulacionId: req.postulacionId!, to: current[0].piloto_email, link });
    }

    // Las respuestas del postulante a comentarios ya existentes se reflejan en la
    // tabla real (nunca su texto, sección o bloque: esos son del formulador).
    for (const c of state.comentarios as Comentario[]) {
      await query(
        `UPDATE comentario SET respuesta = $1, resuelto = $2 WHERE id = $3 AND postulacion_id = $4`,
        [c.respuesta, c.resuelto, c.id, req.postulacionId],
      );
    }

    return reply.send({ derived: d, levStage: nextLevStage });
  });
}
