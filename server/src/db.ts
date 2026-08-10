/** Pool de conexiones a PostgreSQL (DigitalOcean Managed). */
import pg from 'pg';
import { env } from './env.ts';

// DigitalOcean Managed Postgres exige SSL. Aceptamos su certificado gestionado.
export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL.includes('localhost') ? undefined : { rejectUnauthorized: false },
  max: 10,
});

/** Helper tipado para consultas. */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await pool.query<T>(text, params as never[]);
  return res.rows;
}

/** Ejecuta una función dentro de una transacción. */
export async function withTx<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
