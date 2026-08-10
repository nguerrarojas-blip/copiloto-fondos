/** Endpoint del Agente Redactor: recibe el relato crudo y devuelve el párrafo formal.
 * Autenticado por enlace de acceso. Emite la métrica del proveedor si falla. */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requirePostulante } from '../auth.ts';
import { formalizeWithLLM } from '../llm.ts';
import { query } from '../db.ts';

const Body = z.object({
  raw: z.string().min(1),
  field: z.string().default(''),
  fondo: z.string().default(''),
});

export async function redactorRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/redactor', { preHandler: requirePostulante }, async (req, reply) => {
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'datos_invalidos' });
    try {
      const formal = await formalizeWithLLM(parsed.data);
      return reply.send({ formal });
    } catch {
      // Falla del proveedor: métrica sin contenido del proyecto y 502 para que el
      // front muestre las tres salidas (reintentar / sugerencia / guardar crudo).
      await query(`INSERT INTO metric_event (event, postulacion_id) VALUES ('agente_redactor_fallo', $1)`, [req.postulacionId]);
      return reply.code(502).send({ error: 'redactor_fallo' });
    }
  });
}
