/** Arranque del servidor de la API del Copiloto. */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env, features } from './env.ts';
import { pool } from './db.ts';
import { pilotoRoutes } from './routes/piloto.ts';
import { postulacionRoutes } from './routes/postulacion.ts';
import { formuladorRoutes } from './routes/formulador.ts';
import { redactorRoutes } from './routes/redactor.ts';

async function main(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });

  app.get('/health', async () => {
    await pool.query('SELECT 1');
    return { ok: true, email: features.email, llm: features.llm };
  });

  await app.register(pilotoRoutes);
  await app.register(postulacionRoutes);
  await app.register(formuladorRoutes);
  await app.register(redactorRoutes);

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  app.log.info(`Copiloto API en :${env.PORT} · correo=${features.email ? 'Resend' : 'consola'} · IA=${features.llm ? 'Anthropic' : 'pendiente'}`);
}

main().catch((e) => {
  console.error('No se pudo iniciar el servidor:', e);
  process.exit(1);
});
