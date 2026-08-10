/** Los cinco correos transaccionales del producto (Correos - Plantillas.dc.html).
 * Texto plano, sin plantilla decorada; remitente con nombre de persona. */
import type { ReactNode } from 'react';
import { EMAILS } from '../../data/emails';
import { Card, Pill } from '../../ui/primitives';

const REGLAS = [
  'Nunca más de un correo por acción del usuario o del formulador — cero correos de "seguimiento" automáticos que nadie pidió.',
  'El enlace de acceso vence a los 30 días y cada correo trae uno fresco; el enlace vencido lleva a una pantalla que reemite, no a un error.',
  'Todo correo que contenga datos del proyecto lleva la línea de privacidad al pie.',
  'Un solo recordatorio de plazo por postulación, a 5 días del cierre, y solo si el expediente está incompleto.',
  'Idioma: tuteo, frases cortas, sin jerga de fondos.',
];

export function Correos() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 60px' }}>
      <h1 style={{ fontSize: 26 }}>Correos transaccionales</h1>
      <p style={{ color: 'var(--slate)', fontSize: 14 }}>
        Son parte del producto, no un detalle técnico: para mucha gente el correo es el único contacto entre una sesión y la
        siguiente.
      </p>

      <div style={{ display: 'grid', gap: 18, marginTop: 16 }}>
        {EMAILS.map((e) => (
          <Card key={e.tag}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Pill color="#fff" bg={e.tagBg}>{e.tag}</Pill>
              <strong style={{ fontSize: 16 }}>{e.name}</strong>
            </div>
            <p style={{ fontSize: 12, color: 'var(--slate)', margin: '6px 0' }}>{e.trigger}</p>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              <div style={{ color: 'var(--slate)' }}>De: {e.from}</div>
              <div style={{ color: 'var(--slate)', marginBottom: 8 }}>Asunto: {e.subject}</div>
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>{e.body}</div>
              <div style={{ marginTop: 10 }}>
                <span style={{ display: 'inline-block', background: 'var(--teal)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>{e.cta}</span>
              </div>
              <div style={{ color: 'var(--slate)', fontSize: 11, marginTop: 10, whiteSpace: 'pre-wrap' }}>{e.footer}</div>
            </div>
            <AgentNote>{e.rationale}</AgentNote>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 20 }} accent="var(--steel)">
        <h3 style={{ fontSize: 16 }}>Reglas transversales</h3>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--slate)' }}>
          {REGLAS.map((r, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{r}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function AgentNote({ children }: { children: ReactNode }) {
  return (
    <div style={{ borderLeft: '3px solid var(--amber)', paddingLeft: 12, marginTop: 10 }}>
      <span className="mono" style={{ fontSize: 10, color: 'var(--amber)' }}>Criterio</span>
      <p style={{ fontSize: 13, color: 'var(--slate)', margin: '2px 0 0' }}>{children}</p>
    </div>
  );
}
