/** Autenticación del postulante por enlace de acceso (Bearer token). El navegador
 * solo tiene el token; el servidor lo resuelve a una postulación. */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { resolveToken } from './tokens.ts';

declare module 'fastify' {
  interface FastifyRequest {
    postulacionId?: string;
  }
}

function bearer(req: FastifyRequest): string | null {
  const h = req.headers.authorization;
  if (!h || !h.toLowerCase().startsWith('bearer ')) return null;
  return h.slice(7).trim() || null;
}

/** preHandler: exige un token válido y no vencido; deja `req.postulacionId`. */
export async function requirePostulante(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = bearer(req);
  if (!token) {
    reply.code(401).send({ error: 'falta_token' });
    return;
  }
  const resolved = await resolveToken(token);
  if (!resolved) {
    reply.code(401).send({ error: 'token_invalido' });
    return;
  }
  if (resolved.expired) {
    // Nunca un error opaco: el front usa esto para mostrar la pantalla que reemite.
    reply.code(410).send({ error: 'token_vencido', email: resolved.email });
    return;
  }
  req.postulacionId = resolved.postulacionId;
}
