/** Bloque narrativo — Agente Redactor. Chat con respuesta libre siempre disponible
 * + quick-replies como sugerencia; el párrafo formal se aprueba antes de entrar al
 * expediente. Incluye la falla del LLM: la respuesta del usuario NUNCA se pierde. */
import { useApp } from '../../../state/AppContext';
import { FUNDS, narrativeIds } from '../../../data/funds';
import { QUESTIONS } from '../../../data/questions';
import { api, apiEnabled } from '../../../api/client';
import { Card, Button, TextArea, Pill, AgentFinding } from '../../../ui/primitives';

export function NarrativaBlock() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];
  const ids = narrativeIds(state.fondoId);
  const pendingId = ids.find((id) => state.answers[id] == null);
  const answeredCount = ids.filter((id) => state.answers[id] != null).length;

  if (!pendingId) {
    return (
      <Card accent="var(--teal)">
        <Pill color="var(--teal)" bg="var(--bg-success)">Agente Redactor</Pill>
        <h2 style={{ fontSize: 20, margin: '8px 0 4px' }}>Narrativa completa</h2>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Las {ids.length} secciones narrativas quedaron redactadas y aprobadas por ti.</p>
        <Button variant="teal" onClick={() => dispatch({ type: 'GO_PRESUPUESTO' })} style={{ marginTop: 12 }}>Armar el presupuesto →</Button>
      </Card>
    );
  }

  const q = QUESTIONS[pendingId];
  const sec = fund.sections.find((x) => x.qs && x.qs.includes(pendingId))!;
  const secLabel = `0${fund.sections.indexOf(sec) + 1} · ${sec.title}`;
  const m = state.redactorMode;

  // Dispara la generación del párrafo formal. Con backend, la hace Claude en el
  // servidor; sin backend, la resuelve el temporizador local (plantilla).
  async function generar() {
    dispatch({ type: 'SUBMIT_FREE_TEXT_START' });
    if (!apiEnabled()) return; // el temporizador de AppContext resuelve en modo local
    try {
      const { formal } = await api.redactor({ raw: state.draft, field: q.field, fondo: fund.nombre });
      dispatch({ type: 'REDACTOR_RESOLVED', text: formal });
    } catch {
      // La respuesta del usuario nunca se pierde: queda en draft y ofrecemos salidas.
      dispatch({ type: 'REDACTOR_FAILED' });
    }
  }

  return (
    <Card accent="var(--teal)">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Pill color="var(--teal)" bg="var(--bg-success)">Agente Redactor</Pill>
        <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--slate)' }}>
          {secLabel} · pregunta {Math.min(answeredCount + 1, ids.length)} de {ids.length}
        </span>
      </div>

      <h2 style={{ fontSize: 20, margin: '10px 0 4px' }}>{q.question}</h2>
      <p style={{ fontSize: 13, color: 'var(--slate)' }}>{q.hint}</p>
      {q.benchmark && (
        <AgentFinding color="var(--amber)">
          <span className="mono" style={{ fontSize: 10, color: 'var(--amber)' }}>Benchmark · adjudicados</span>
          <div>{q.benchmark}</div>
        </AgentFinding>
      )}

      {(m === 'choice' || m === 'writing') && (
        <>
          {m === 'choice' && (
            <div style={{ marginTop: 12 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 6 }}>Sugerencias — o escribe tu propia respuesta</div>
              {q.options.map((o, i) => (
                <button
                  key={i}
                  onClick={() => dispatch({ type: 'PICK_OPTION', qid: pendingId, idx: i })}
                  style={{ display: 'block', width: '100%', textAlign: 'left', border: '1px solid var(--rule)', background: '#fff', borderRadius: 10, padding: '11px 13px', marginTop: 8, fontSize: 14 }}
                >
                  {o.short}
                </button>
              ))}
              <Button onClick={() => dispatch({ type: 'START_FREE_TEXT' })} style={{ marginTop: 12 }}>Prefiero escribirlo yo</Button>
            </div>
          )}

          {m === 'writing' && (
            <div style={{ marginTop: 12 }}>
              <TextArea
                autoFocus
                value={state.draft}
                onChange={(e) => dispatch({ type: 'SET_DRAFT', value: e.target.value })}
                placeholder="Cuéntalo con tus palabras. El Redactor lo pasa a lenguaje de formulario y tú lo apruebas."
              />
              <div style={{ marginTop: 8 }}>
                <Button variant="teal" disabled={state.draft.trim().length <= 4} onClick={generar}>Redactar con el agente</Button>{' '}
                <Button onClick={() => dispatch({ type: 'CANCEL_FREE_TEXT' })}>Volver a las sugerencias</Button>
              </div>
            </div>
          )}
        </>
      )}

      {m === 'generating' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 12, background: 'var(--bg-secondary)', borderRadius: 6, margin: '6px 0' }} />
          <div style={{ height: 12, width: '80%', background: 'var(--bg-secondary)', borderRadius: 6, margin: '6px 0' }} />
          <p style={{ fontSize: 12, color: 'var(--slate)' }}>Redactando… tu respuesta ya quedó guardada, no la pierdes.</p>
        </div>
      )}

      {m === 'review' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ borderLeft: '3px solid var(--teal)', paddingLeft: 12 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--teal)' }}>Párrafo propuesto</span>
            <p style={{ fontSize: 14 }}>{state.generated}</p>
          </div>
          <div style={{ marginTop: 8 }}>
            <Button variant="teal" onClick={() => dispatch({ type: 'ACCEPT_GENERATED' })}>Aprobar y agregar al expediente</Button>{' '}
            <Button onClick={() => dispatch({ type: 'EDIT_FREE_TEXT' })}>Editar mi texto</Button>
          </div>
        </div>
      )}

      {m === 'error' && (
        <div style={{ marginTop: 12, background: 'var(--bg-error)', border: '1px solid var(--rose)', borderRadius: 10, padding: 12 }}>
          <strong style={{ fontSize: 14, color: 'var(--rose)' }}>El Redactor no respondió</strong>
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>Tu respuesta está a salvo. Puedes reintentar, usar una sugerencia, o guardarla tal cual la escribiste.</p>
          <div style={{ marginTop: 8 }}>
            <Button variant="teal" onClick={generar}>Reintentar</Button>{' '}
            <Button onClick={() => dispatch({ type: 'CANCEL_FREE_TEXT' })}>Usar una sugerencia</Button>{' '}
            <Button onClick={() => dispatch({ type: 'KEEP_RAW' })}>Guardar mi texto tal cual</Button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--slate)', marginTop: 6 }}>Si la guardas cruda, queda marcada en el expediente y cuenta como hallazgo de Coherencia para el formulador.</p>
        </div>
      )}
    </Card>
  );
}
