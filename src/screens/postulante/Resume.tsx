/** Pantallas de retorno: retomar sesión, enlace vencido y convocatoria cerrada.
 * Nunca un error: siempre hay una salida que no pierde el avance. */
import { useApp } from '../../state/AppContext';
import { FUNDS } from '../../data/funds';
import { analyzeExpediente } from '../../domain/expediente';
import { computeSections } from '../../state/selectors';
import { api, apiEnabled } from '../../api/client';
import { Card, Button, Pill } from '../../ui/primitives';

export function LinkExpired() {
  const { state, dispatch } = useApp();
  async function reenviar() {
    if (apiEnabled() && state.pilotoEmail) {
      try {
        await api.resendLink(state.pilotoEmail);
      } catch {
        /* silencioso: no revelamos si el correo existe */
      }
    }
    dispatch({ type: 'RESEND_LINK' });
  }
  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '60px 20px' }}>
      <Card accent="var(--amber)">
        <Pill color="var(--amber)" bg="var(--bg-warning)">Enlace vencido</Pill>
        <h1 style={{ fontSize: 26, margin: '10px 0' }}>Este enlace ya no sirve, pero tu expediente sí existe</h1>
        <p style={{ color: 'var(--slate)' }}>
          Los enlaces de acceso vencen a los 30 días por seguridad — llevan los datos de tu empresa. Te mandamos uno nuevo
          al mismo correo, no pierdes nada.
        </p>
        <p className="mono" style={{ fontSize: 12, color: 'var(--slate)' }}>Enviaremos el enlace nuevo a {state.pilotoEmail || 'tu correo'}</p>
        <Button variant="teal" onClick={reenviar} style={{ marginTop: 10 }}>Enviarme un enlace nuevo</Button>
      </Card>
    </div>
  );
}

export function Resume() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];
  const a = analyzeExpediente(state);
  const { progressPct, doneFields, totalFields } = computeSections(state);
  const cerrado = state.simFondoCerrado;

  const nextStep = !a.identidadOk
    ? 'completar los antecedentes del postulante'
    : !a.narrativaDone
      ? `responder la pregunta ${a.answeredCount + 1} de la narrativa`
      : !state.budget.some((r) => Number(r.monto) > 0)
        ? 'armar el presupuesto'
        : !['scored', 'revision', 'devuelto', 'done'].includes(state.levStage)
          ? 'verificar el expediente'
          : 'revisar la entrega';

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '60px 20px' }}>
      <Card accent={cerrado ? 'var(--rose)' : 'var(--teal)'}>
        {cerrado ? (
          <>
            <Pill color="var(--rose)" bg="var(--bg-error)">La convocatoria cerró</Pill>
            <h1 style={{ fontSize: 24, margin: '10px 0' }}>{fund.nombre} cerró mientras trabajabas</h1>
            <p style={{ color: 'var(--slate)' }}>
              Tu expediente queda guardado completo: cuando abra la próxima convocatoria lo retomamos y solo actualizamos
              plazos y montos. También podemos revisar si otro fondo abierto te calza.
            </p>
          </>
        ) : (
          <>
            <Pill color="var(--teal)" bg="var(--bg-success)">Bienvenida de vuelta</Pill>
            <h1 style={{ fontSize: 24, margin: '10px 0' }}>Tu expediente te estaba esperando</h1>
            <p style={{ color: 'var(--slate)' }}>Nada se perdió. Retomas exactamente donde lo dejaste.</p>
          </>
        )}

        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, margin: '14px 0' }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--slate)' }}>{state.identidad.razonSocial || 'Tu proyecto'} · {fund.nombre}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26 }}>{progressPct}%</span>
            <span style={{ fontSize: 12, color: 'var(--slate)' }}>{doneFields} de {totalFields} campos</span>
          </div>
          <p style={{ fontSize: 13, margin: '6px 0 0' }}>Siguiente paso: {nextStep}</p>
        </div>

        <Button variant="teal" onClick={() => dispatch({ type: 'RESUME_CONTINUE' })}>Continuar donde quedé →</Button>{' '}
        <Button onClick={() => dispatch({ type: 'RESTART' })}>Empezar de nuevo</Button>
      </Card>
    </div>
  );
}
