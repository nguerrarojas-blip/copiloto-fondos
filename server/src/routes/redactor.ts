/** Endpoint del Agente Redactor: recibe el relato crudo y devuelve el párrafo formal.
 * Autenticado por enlace de acceso. Emite la métrica del proveedor si falla. */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requirePostulante } from '../auth.ts';
import { formalizeWithLLM } from '../llm.ts';
import { query } from '../db.ts';
import { getOfficialContext } from '../../../src/data/bibliografia.ts';
import type { FondoId } from '../../../src/data/funds.ts';

const Body = z.object({
  raw: z.string().min(1),
  field: z.string().default(''),
  fondo: z.string().default(''),
  fondoId: z.string().default(''),
  qid: z.string().default(''),
});

export async function redactorRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/redactor', { preHandler: requirePostulante }, async (req, reply) => {
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'datos_invalidos' });
    const { raw, field, fondo, fondoId, qid } = parsed.data;
    // Contexto oficial de las bases, si ya fue verificado para este (fondo, campo).
    // Nunca es un dato del proyecto — solo informa qué pide el formulario.
    const official = getOfficialContext(fondoId as FondoId, qid);
    try {
      const formal = await formalizeWithLLM({ raw, field, fondo, officialContext: official?.texto });
      return reply.send({ formal });
    } catch {
      // Falla del proveedor: métrica sin contenido del proyecto y 502 para que el
      // front muestre las tres salidas (reintentar / sugerencia / guardar crudo).
      await query(`INSERT INTO metric_event (event, postulacion_id) VALUES ('agente_redactor_fallo', $1)`, [req.postulacionId]);
      return reply.code(502).send({ error: 'redactor_fallo' });
    }
  });
}
