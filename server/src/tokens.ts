/** Enlaces de acceso sin contraseña. Un token aleatorio se envía por correo; en la
 * base guardamos solo su hash SHA-256. Vencen a los 30 días (README §Estados). */
import { createHash, randomBytes } from 'node:crypto';
import { query } from './db.ts';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Crea un token nuevo para una postulación, lo persiste (hasheado) y lo devuelve en claro. */
export async function issueToken(postulacionId: string, email: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS).toISOString();
  await query(
    `INSERT INTO access_token (postulacion_id, token_hash, email, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [postulacionId, hashToken(token), email, expiresAt],
  );
  return token;
}

export interface ResolvedToken {
  postulacionId: string;
  email: string;
  expired: boolean;
}

/** Resuelve un token: identifica la postulación y si está vencido/revocado.
 * Marca el primer uso (métrica de retorno por enlace). */
export async function resolveToken(token: string): Promise<ResolvedToken | null> {
  const rows = await query<{
    postulacion_id: string;
    email: string;
    revoked: boolean;
    expires_at: string;
  }>(
    `SELECT postulacion_id, email, revoked, expires_at
       FROM access_token WHERE token_hash = $1`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row || row.revoked) return null;
  const expired = new Date(row.expires_at).getTime() < Date.now();
  if (!expired) {
    await query(`UPDATE access_token SET used_at = now() WHERE token_hash = $1 AND used_at IS NULL`, [
      hashToken(token),
    ]);
  }
  return { postulacionId: row.postulacion_id, email: row.email, expired };
}
