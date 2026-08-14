/** Bloque Verificación: corre los tres agentes (QA, Coherencia, Benchmark),
 * muestra el ESTADO del expediente (dos valores, nunca un puntaje), y el ciclo de
 * revisión del formulador (enviar → devuelto con comentarios → aprobado). Con
 * backend conectado, "devuelto" y "aprobado" los decide el formulador real — el
 * postulante solo puede pedir una actualización de estado, nunca autoaprobarse. */
import { useState } from 'react';
import { useApp } from '../../../state/AppContext';
import { analyzeExpediente } from '../../../domain/expediente';
import { Card, Button, Pill, AgentFinding } from '../../../ui/primitives';
import { api, apiEnabled } from '../../../api/client';

export function VerificacionBlock() {
  const { state, dispatch } = useApp();
  const a = analyzeExpediente(state);
  const stage = state.levStage;

  if (stage === 'work' || stage === 'verifying') {
    return (
      <Card>
        <h2 style={{ fontSize: 20 }}>Verificación de los agentes</h2>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Tres agentes revisan tu expediente. Advierten, nunca bloquean.</p>
        <div style={{ marginTop: 14 }}>
          {a.agents.map((ag, i) => {
            const active = state.verifyIndex === i && stage === 'verifying';
            const shown = state.verifyIndex > i;
            return (
              <div key={ag.label} style={{ padding: '10px 0', borderTop: '1px solid var(--rule)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: state.verifyIndex >= i ? ag.color : 'var(--rule)', animation: active ? 'pulseDot 1.2s infinite' : 'none' }} />
                  <strong style={{ fontSize: 14 }}>{ag.label}</strong>
                  {active && <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--slate)' }}>revisando…</span>}
                </div>
                {shown && ag.findings.map((f, j) => <AgentFinding key={j} color={ag.color}>{f}</AgentFinding>)}
              </div>
            );
          })}
        </div>
        {stage === 'work' && <Button variant="teal" onClick={() => dispatch({ type: 'VERIFY_START' })} style={{ marginTop: 12 }}>Correr la verificación</Button>}
      </Card>
    );
  }

  // scored / revision / devuelto / done
  return (
    <Card accent={a.estado.color}>
      <Pill color={a.estado.color} bg={a.estado.label === 'Listo para revisión' ? 'var(--bg-success)' : 'var(--bg-warning)'}>
        {a.estado.label}
      </Pill>
      <p style={{ fontSize: 14, color: 'var(--slate)', marginTop: 8 }}>{a.estado.copy}</p>
      {a.estado.items.map((it, i) => (
        <AgentFinding key={i} color={it.color}>
          <span className="mono" style={{ fontSize: 10, color: it.color }}>{it.tag}</span>
          <div>{it.text}</div>
        </AgentFinding>
      ))}

      {stage === 'scored' && (
        <Button variant="teal" onClick={() => dispatch({ type: 'GO_REVISION' })} style={{ marginTop: 12 }}>
          Enviar a revisión del formulador →
        </Button>
      )}

      {stage === 'revision' && (
        <div style={{ marginTop: 14, background: 'var(--bg-secondary)', borderRadius: 10, padding: 14 }}>
          <strong style={{ fontSize: 14 }}>En revisión de un formulador</strong>
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>
            {state.reeditado ? 'Revisó tus correcciones.' : 'Los agentes hicieron el trabajo pesado; el formulador pone el criterio.'} Te avisamos por correo apenas termine.
          </p>
          <div style={{ marginTop: 8 }}>
            {apiEnabled() ? (
              <ActualizarEstado />
            ) : (
              <>
                <Button onClick={() => dispatch({ type: 'SIMULATE_DEVUELTO' })}>Simular: devuelto con comentarios</Button>{' '}
                <Button variant="teal" onClick={() => dispatch({ type: 'COMPLETE_REVIEW' })}>Simular: aprobado</Button>
              </>
            )}
          </div>
        </div>
      )}

      {stage === 'devuelto' && <Devuelto />}

      {stage === 'done' && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 14, color: 'var(--teal)' }}>
            {state.reeditado
              ? 'La formuladora revisó tus correcciones y aprobó el expediente. Quedó registrado qué cambió entre versiones.'
              : 'La formuladora aprobó el expediente con ajustes menores en la proyección de ventas y en el orden del presupuesto.'}
          </p>
          <Button variant="teal" onClick={() => dispatch({ type: 'GO_ENTREGA' })} style={{ marginTop: 8 }}>Ir a la entrega →</Button>
        </div>
      )}
    </Card>
  );
}

function ActualizarEstado() {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  async function actualizar() {
    setLoading(true);
    try {
      const { state: server } = await api.getPostulacion();
      dispatch({ type: 'SYNC_ESTADO', levStage: server.levStage, comentarios: server.comentarios });
      setChecked(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={actualizar} disabled={loading}>{loading ? 'Revisando…' : 'Actualizar estado'}</Button>
      {checked && <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6 }}>Sigue en revisión — todavía no hay novedades.</p>}
    </>
  );
}

function Devuelto() {
  const { state, dispatch } = useApp();
  const comentarios = state.comentarios.map((c) => ({ ...c, puedeResolver: String(c.respuesta || '').trim().length > 3 }));
  const todosResueltos = comentarios.length > 0 && comentarios.every((c) => c.resuelto);
  return (
    <div style={{ marginTop: 14 }}>
      <Pill color="var(--amber)" bg="var(--bg-warning)">Devuelto con comentarios</Pill>
      <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 6 }}>Cada comentario pide una respuesta. Solo se reenvía cuando todos están resueltos.</p>
      {comentarios.map((c) => (
        <div key={c.id} style={{ borderLeft: '3px solid var(--amber)', paddingLeft: 12, margin: '12px 0' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--amber)' }}>{c.seccion}</span>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: c.resuelto ? 'var(--teal)' : 'var(--amber)' }}>{c.resuelto ? 'resuelto' : 'pendiente'}</span>
          </div>
          <p style={{ fontSize: 13, margin: '4px 0' }}>{c.texto}</p>
          {!c.resuelto && (
            <>
              <textarea
                value={c.respuesta}
                onChange={(e) => dispatch({ type: 'SET_COMENTARIO_RESP', id: c.id, value: e.target.value })}
                placeholder="Tu respuesta o corrección"
                style={{ width: '100%', minHeight: 60, padding: 8, borderRadius: 6, border: '1px solid var(--rule)' }}
              />
              <div style={{ marginTop: 6 }}>
                <Button onClick={() => dispatch({ type: 'GO_BLOCK', block: c.block })}>Ir a la sección</Button>{' '}
                <Button variant="teal" disabled={!c.puedeResolver} onClick={() => dispatch({ type: 'RESOLVER_COMENTARIO', id: c.id })}>Marcar resuelto</Button>
              </div>
            </>
          )}
        </div>
      ))}
      <Button variant="teal" disabled={!todosResueltos} onClick={() => dispatch({ type: 'REENVIAR_REVISION' })} style={{ marginTop: 8 }}>
        Reenviar a revisión
      </Button>
    </div>
  );
}
