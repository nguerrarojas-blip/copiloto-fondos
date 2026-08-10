/** Persistencia real de la postulación en servidor (reemplaza el localStorage del
 * prototipo). El estado se guarda íntegro en jsonb y el servidor recalcula los
 * derivados con el mismo motor de reglas del front. */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db.ts';
import { requirePostulante } from '../auth.ts';
import { normalizeState, deriveFields, validRut, type AppState } from '../rules.ts';

export async function postulacionRoutes(app: FastifyInstance): Promise<void> {
  // Estado actual de la postulación (para retomar la sesión).
  app.get('/api/postulacion', { preHandler: requirePostulante }, async (req, reply) => {
    const rows = await query<{ state: AppState; estado_label: string; hard_issues: number; progress_pct: number }>(
      `SELECT state, estado_label, hard_issues, progress_pct FROM postulacion WHERE id = $1`,
      [req.postulacionId],
    );
    if (!rows.length) return reply.code(404).send({ error: 'no_existe' });
    const row = rows[0];
    return reply.send({
      state: row.state,
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
        req.postulacionId, state, state.screen, state.block, state.levStage,
        d.estadoLabel, d.hardIssues, d.progressPct,
        state.consent, state.reeditado, empresaId,
      ],
    );
    return reply.send({ derived: d });
  });
}
