/** Carga y valida las variables de entorno al arrancar. Falla temprano si falta algo crítico. */
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(8080),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  APP_BASE_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'Falta DATABASE_URL (cadena de conexión de Postgres)'),
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('Marcela de Copiloto <marcela@example.com>'),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  ANTHROPIC_MODEL: z.string().default('claude-3-5-sonnet-latest'),
  TOKEN_SECRET: z.string().min(8, 'Define TOKEN_SECRET con un valor aleatorio largo'),
});

export type Env = z.infer<typeof schema>;

export const env: Env = schema.parse(process.env);

/** Flags de disponibilidad de servicios opcionales. */
export const features = {
  email: env.RESEND_API_KEY.length > 0,
  llm: env.ANTHROPIC_API_KEY.length > 0,
};
