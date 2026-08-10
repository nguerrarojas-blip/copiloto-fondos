/** Pantalla del piloto: compromiso + captura de correo para el enlace de acceso.
 * Los datos de identidad NO se piden acá: matan la conversión (README). */
import { useApp } from '../../state/AppContext';
import { FUNDS } from '../../data/funds';
import { api, apiEnabled } from '../../api/client';
import { Card, Button, Pill } from '../../ui/primitives';

const EMAIL_RE = /.+@.+\..+/;

export function Piloto() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];
  const emailValid = EMAIL_RE.test(state.pilotoEmail);

  async function enviarEnlace() {
    // Con backend: crea la postulación y dispara el correo con el enlace real.
    if (apiEnabled()) {
      try {
        await api.startPiloto(state.fondoId, state.mujeres, state.pilotoEmail);
      } catch {
        /* la UI podría mostrar un aviso de reintento */
      }
    }
    dispatch({ type: 'SEND_ACCESS_LINK' });
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <Pill color="var(--teal)" bg="var(--bg-success)">Piloto gratuito · {fund.nombre}</Pill>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', margin: '14px 0' }}>El trato del piloto</h1>
      <p style={{ color: 'var(--slate)' }}>
        Te acompañamos a armar el expediente completo de {fund.nombre} sin costo. A cambio te pedimos un proyecto real,
        completar el levantamiento dentro del plazo y una conversación breve de retroalimentación al cierre. La garantía de
        admisibilidad rige igual que en la versión pagada.
      </p>

      <Card style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 16 }}>¿A qué correo te mandamos el enlace de acceso?</h3>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>
          No hay contraseña. El enlace guarda tu avance y te deja retomar desde cualquier dispositivo. Vence a los 30 días.
        </p>
        {state.accessLinkSent ? (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--teal)' }}>Enlace enviado a {state.pilotoEmail}. Ya puedes empezar.</p>
            <Button variant="teal" onClick={() => dispatch({ type: 'START_LEVANTAMIENTO' })} style={{ marginTop: 8 }}>
              Empezar el levantamiento →
            </Button>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <input
              type="email"
              value={state.pilotoEmail}
              onChange={(e) => dispatch({ type: 'SET_PILOTO_EMAIL', value: e.target.value })}
              placeholder="tu@correo.cl"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--rule)' }}
            />
            <Button variant="teal" disabled={!emailValid} onClick={enviarEnlace} style={{ marginTop: 10 }}>
              Enviarme el enlace
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
