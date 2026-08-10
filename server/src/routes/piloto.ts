/** Inicio del piloto: crea la postulación, emite el enlace de acceso de 30 días y
 * envía el correo. Los datos de identidad NO se piden acá (matan la conversión):
 * solo el fondo elegido y el correo. */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db.ts';
import { issueToken } from '../tokens.ts';
import { sendTransactional } from '../email.ts';
import { normalizeState, deriveFields } from '../rules.ts';
import { env } from '../env.ts';

const StartBody = z.object({
  fondoId: z.enum(['semilla-inicia', 'fondo-crece']),
  mujeres: z.boolean().nullable().default(null),
  pilotoEmail: z.string().email(),
});

export async function pilotoRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/piloto/start', async (req, reply) => {
    const parsed = StartBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'datos_invalidos', detail: parsed.error.flatten() });
    const { fondoId, mujeres, pilotoEmail } = parsed.data;

    const state = normalizeState({ fondoId, mujeres, pilotoEmail, screen: 'levantamiento', block: 'identidad' });
    const d = deriveFields(state);

    const rows = await query<{ id: string }>(
      `INSERT INTO postulacion (fondo_id, mujeres, piloto_email, screen, block, lev_stage, estado_label, hard_issues, progress_pct, state)
       VALUES ($1, $2, $3, 'levantamiento', 'identidad', 'work', $4, $5, $6, $7)
       RETURNING id`,
      [fondoId, mujeres, pilotoEmail, d.estadoLabel, d.hardIssues, d.progressPct, state],
    );
    const postulacionId = rows[0].id;

    const token = await issueToken(postulacionId, pilotoEmail);
    const link = `${env.APP_BASE_URL}/?token=${token}`;
    await sendTransactional({ tipo: 'enlace_acceso', postulacionId, to: pilotoEmail, link });

    // El token viaja por correo, no en la respuesta. En dev sin Resend, queda en el log del servidor.
    return reply.send({ ok: true });
  });

  /** Reemite un enlace nuevo al correo de la postulación (enlace vencido). */
  app.post('/api/piloto/resend', async (req, reply) => {
    const Body = z.object({ email: z.string().email() });
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'datos_invalidos' });

    const rows = await query<{ id: string }>(
      `SELECT id FROM postulacion WHERE lower(piloto_email) = lower($1) ORDER BY created_at DESC LIMIT 1`,
      [parsed.data.email],
    );
    if (!rows.length) return reply.send({ ok: true }); // no revelamos si el correo existe

    const postulacionId = rows[0].id;
    const token = await issueToken(postulacionId, parsed.data.email);
    const link = `${env.APP_BASE_URL}/?token=${token}`;
    await sendTransactional({ tipo: 'enlace_acceso', postulacionId, to: parsed.data.email, link });
    return reply.send({ ok: true });
  });
}
