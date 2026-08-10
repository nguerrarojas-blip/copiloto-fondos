/**
 * Envío de correos con Resend, usando las plantillas del producto (una sola fuente
 * de verdad: `src/data/emails.ts`). Texto plano, remitente con nombre de persona.
 *
 * Reglas del producto que se hacen cumplir acá:
 *  - Nunca más de un correo por acción.
 *  - Un solo recordatorio de plazo por postulación.
 *  - Todo queda registrado en la tabla correo_enviado (idempotencia + auditoría).
 */
import { Resend } from 'resend';
import { EMAILS, type Email } from '../../src/data/emails.ts';
import { env, features } from './env.ts';
import { query } from './db.ts';

const resend = features.email ? new Resend(env.RESEND_API_KEY) : null;

export type CorreoTipo = 'enlace_acceso' | 'en_revision' | 'devuelto' | 'listo' | 'recordatorio';

// Mapa de tipo → plantilla (por nombre en la referencia).
const TEMPLATE_BY_TIPO: Record<CorreoTipo, string> = {
  enlace_acceso: 'Enlace de acceso',
  en_revision: 'Expediente en revisión',
  devuelto: 'Devuelto con comentarios',
  listo: 'Expediente listo',
  recordatorio: 'Recordatorio de plazo',
};

function template(tipo: CorreoTipo): Email {
  const name = TEMPLATE_BY_TIPO[tipo];
  const t = EMAILS.find((e) => e.name === name);
  if (!t) throw new Error(`Sin plantilla de correo para ${tipo}`);
  return t;
}

/** Cuerpo en texto plano: cuerpo + enlace (si aplica) + pie. */
function renderPlain(t: Email, link?: string): string {
  const cta = link ? `\n\n${t.cta}: ${link}` : '';
  return `${t.body}${cta}\n\n—\n${t.footer}`;
}

interface SendOpts {
  tipo: CorreoTipo;
  postulacionId: string;
  to: string;
  link?: string;
}

/** Envía un correo transaccional. El recordatorio se envía a lo más una vez. */
export async function sendTransactional({ tipo, postulacionId, to, link }: SendOpts): Promise<{ sent: boolean; reason?: string }> {
  if (tipo === 'recordatorio') {
    const prev = await query(
      `SELECT 1 FROM correo_enviado WHERE postulacion_id = $1 AND tipo = 'recordatorio' LIMIT 1`,
      [postulacionId],
    );
    if (prev.length) return { sent: false, reason: 'recordatorio ya enviado' };
  }

  const t = template(tipo);
  const text = renderPlain(t, link);
  let providerId: string | null = null;

  if (resend) {
    const res = await resend.emails.send({ from: env.EMAIL_FROM, to, subject: t.subject, text });
    if (res.error) throw new Error(`Resend: ${res.error.message}`);
    providerId = res.data?.id ?? null;
  } else {
    // Sin llave de Resend: modo desarrollo, se registra en consola.
    console.log(`\n[correo:${tipo}] → ${to}\nAsunto: ${t.subject}\n${text}\n`);
  }

  await query(
    `INSERT INTO correo_enviado (postulacion_id, tipo, to_email, subject, provider_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [postulacionId, tipo, to, t.subject, providerId],
  );
  return { sent: true };
}
