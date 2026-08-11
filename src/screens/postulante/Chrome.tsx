/** Cromo del postulante: header, banner de estado, menú de estados y pipeline de agentes. */
import { useApp } from '../../state/AppContext';
import { FUNDS } from '../../data/funds';
import { analyzeExpediente } from '../../domain/expediente';
import { Pill } from '../../ui/primitives';

const SIM_TOGGLES: { key: keyof ReturnType<typeof useApp>['state']; label: string }[] = [
  { key: 'simOffline', label: 'sin conexión' },
  { key: 'simSaveError', label: 'error al guardar' },
  { key: 'simLlmError', label: 'falla del Redactor' },
  { key: 'simFondoCerrado', label: 'convocatoria cerrada' },
  { key: 'simLinkExpired', label: 'enlace vencido' },
  { key: 'simExportError', label: 'falla la descarga' },
];

export function Header() {
  const { state, dispatch } = useApp();
  const savedLabel = state.simSaveError ? 'Sin guardar' : state.simOffline ? 'Guardado local' : 'Guardado';
  const savedColor = state.simSaveError || state.simOffline ? 'var(--amber)' : '#8b9099';
  return (
    <header style={{ borderBottom: '1px solid var(--rule)', background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 5 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <strong style={{ fontFamily: 'var(--font-serif)', fontSize: 17 }}>Copiloto de Postulación</strong>
        {state.demoMode && <Pill color="#fff" bg="var(--amber)">Modo demo</Pill>}
        <span className="mono" style={{ marginLeft: 'auto', fontSize: 12, color: savedColor }}>● {savedLabel}</span>
        {import.meta.env.DEV && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_STATE_PANEL' })}
              aria-expanded={state.statePanelOpen}
              style={{ border: '1px solid var(--rule)', background: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}
            >
              estados ▾
            </button>
            {state.statePanelOpen && (
              <div
                style={{ position: 'absolute', right: 0, top: 36, background: 'var(--ink)', color: '#fff', borderRadius: 12, padding: 14, width: 240, zIndex: 20, boxShadow: 'var(--shadow-widget)' }}
              >
                <p style={{ fontSize: 11, color: '#9aa8bb', margin: '0 0 10px' }}>
                  Estados del sistema · solo en desarrollo local, no es parte del producto
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SIM_TOGGLES.map((t) => {
                    const active = state[t.key] as boolean;
                    return (
                      <button
                        key={t.key}
                        aria-pressed={active}
                        onClick={() => dispatch({ type: 'TOGGLE_SIM', key: t.key })}
                        style={{
                          fontSize: 12,
                          borderRadius: 999,
                          padding: '4px 10px',
                          background: active ? 'var(--amber)' : 'transparent',
                          color: active ? '#fff' : '#9aa8bb',
                          border: `1px solid ${active ? 'var(--amber)' : '#3b4a60'}`,
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <button onClick={() => dispatch({ type: 'RESTART' })} style={{ border: '1px solid var(--rule)', background: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
          Reiniciar
        </button>
      </div>
      <Banner />
    </header>
  );
}

function Banner() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];
  let banner: null | { bg: string; border: string; text: string; actionLabel: string; key: keyof typeof state } = null;
  if (state.simOffline)
    banner = { bg: 'var(--bg-error)', border: 'var(--rose)', key: 'simOffline', actionLabel: 'Reintentar ahora', text: 'Sin conexión. Lo que escribas se guarda en este dispositivo y se sincroniza cuando vuelva la señal.' };
  else if (state.simSaveError)
    banner = { bg: 'var(--bg-warning)', border: 'var(--amber)', key: 'simSaveError', actionLabel: 'Reintentar guardado', text: 'No pudimos guardar tus últimos cambios en el servidor. No cierres esta pestaña todavía.' };
  else if (state.simFondoCerrado)
    banner = { bg: 'var(--bg-error)', border: 'var(--rose)', key: 'simFondoCerrado', actionLabel: 'Ver fondos abiertos', text: `${fund.nombre} cerró su convocatoria. Tu expediente se guarda completo para la próxima.` };
  if (!banner) return null;
  return (
    <div role="status" style={{ background: banner.bg, borderTop: `1px solid ${banner.border}`, padding: '10px 20px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: banner.border }} />
        <span>{banner.text}</span>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIM', key: banner!.key })}
          style={{ marginLeft: 'auto', border: `1px solid ${banner.border}`, background: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 12 }}
        >
          {banner.actionLabel}
        </button>
      </div>
    </div>
  );
}

/** Pipeline de agentes de la barra superior del levantamiento. */
export function Pipeline() {
  const { state } = useApp();
  const a = analyzeExpediente(state);
  const agentsRan = ['scored', 'revision', 'devuelto', 'done'].includes(state.levStage);
  const defs = [
    { label: 'Matchmaker', color: 'var(--amber)', done: true, active: false },
    { label: 'Intake', color: 'var(--steel)', done: a.identidadOk, active: ['identidad', 'presupuesto', 'datos'].includes(state.block) },
    { label: 'Redactor', color: 'var(--teal)', done: a.narrativaDone, active: state.block === 'narrativa' },
    { label: 'QA', color: 'var(--rose)', done: agentsRan, active: state.verifyIndex === 0 && state.levStage === 'verifying' },
    { label: 'Coherencia', color: 'var(--teal)', done: agentsRan, active: state.verifyIndex === 1 && state.levStage === 'verifying' },
    { label: 'Benchmark', color: 'var(--amber)', done: agentsRan, active: state.verifyIndex === 2 && state.levStage === 'verifying' },
  ];
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', padding: '10px 0' }}>
      {defs.map((p) => (
        <span key={p.label} className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: p.active ? 600 : 400, color: p.active ? p.color : p.done ? 'var(--ink)' : '#9aa0a8' }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background: p.active || p.done ? p.color : 'var(--rule)',
              boxShadow: p.active ? `0 0 0 3px ${p.color}22` : 'none',
              animation: p.active ? 'pulseDot 1.2s infinite' : 'none',
            }}
          />
          {p.label}
        </span>
      ))}
    </div>
  );
}
