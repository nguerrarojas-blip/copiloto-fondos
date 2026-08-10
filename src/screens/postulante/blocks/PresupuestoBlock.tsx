/** Bloque Presupuesto — Agente Intake + alertas del Agente QA en vivo.
 * Las alertas advierten, nunca bloquean. Estado vacío que orienta, no una tabla en blanco. */
import type { CSSProperties } from 'react';
import { useApp } from '../../../state/AppContext';
import { FUNDS } from '../../../data/funds';
import { computeBudget } from '../../../domain/budget';
import { fmt } from '../../../domain/format';
import { AVG_MONTO, AVG_COFI } from '../../../data/corpus';
import { Card, Button, Pill, AgentFinding } from '../../../ui/primitives';

export function PresupuestoBlock() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];
  const b = computeBudget(state.budget, fund, state.mujeres);

  return (
    <Card accent="var(--steel)">
      <Pill color="var(--steel)" bg="var(--bg-secondary)">Agente Intake · presupuesto</Pill>
      <h2 style={{ fontSize: 20, margin: '8px 0 4px' }}>{fund.id === 'fondo-crece' ? 'Plan de inversión' : 'Presupuesto'}</h2>
      <p style={{ fontSize: 13, color: 'var(--slate)' }}>
        Los adjudicados pidieron {fmt(AVG_MONTO)} en promedio y aportaron {AVG_COFI}% propio. No te sugerimos un monto: te
        avisamos si el tuyo queda fuera del rango que este instrumento financió.
      </p>

      {state.budget.length === 0 ? (
        <div style={{ marginTop: 14, background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 14, margin: 0 }}>Empieza por tu gasto principal — para {fund.nombre} suele ser {fund.categorias[0].toLowerCase()}.</p>
          <Button variant="teal" onClick={() => dispatch({ type: 'ADD_BUDGET_ROW' })} style={{ marginTop: 10 }}>Agregar primer ítem</Button>
        </div>
      ) : (
        <div className="table-scroll" style={{ marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr className="mono" style={{ fontSize: 11, textAlign: 'left', color: 'var(--slate)' }}>
                <th style={{ padding: 6 }}>Categoría</th>
                <th style={{ padding: 6 }}>Detalle</th>
                <th style={{ padding: 6 }}>Monto</th>
                <th style={{ padding: 6 }}>Aporte propio</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.budget.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--rule)' }}>
                  <td style={{ padding: 4 }}>
                    <select value={r.categoria} onChange={(e) => dispatch({ type: 'SET_BUDGET', i, key: 'categoria', value: e.target.value })} style={cell}>
                      {fund.categorias.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: 4 }}>
                    <input value={r.detalle} onChange={(e) => dispatch({ type: 'SET_BUDGET', i, key: 'detalle', value: e.target.value })} placeholder="En qué se gasta" style={cell} />
                  </td>
                  <td style={{ padding: 4 }}>
                    <input value={r.monto} inputMode="numeric" onChange={(e) => dispatch({ type: 'SET_BUDGET', i, key: 'monto', value: e.target.value })} placeholder="0" style={{ ...cell, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: 4 }}>
                    <input value={r.aporte} inputMode="numeric" onChange={(e) => dispatch({ type: 'SET_BUDGET', i, key: 'aporte', value: e.target.value })} placeholder="0" style={{ ...cell, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: 4 }}>
                    <button aria-label={`Eliminar ítem ${i + 1}`} onClick={() => dispatch({ type: 'REMOVE_BUDGET_ROW', i })} style={{ border: 'none', background: 'none', color: 'var(--rose)', fontSize: 16 }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={() => dispatch({ type: 'ADD_BUDGET_ROW' })} style={{ marginTop: 10 }}>+ Agregar ítem</Button>
        </div>
      )}

      {b.hasRows && (
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14 }} className="mono">
          <Metric label="Solicitado" value={fmt(b.solicitado)} color={b.solicitado > b.tope ? 'var(--rose)' : 'var(--ink)'} />
          <Metric label="Aporte propio" value={fmt(b.aporteTot)} color="var(--ink)" />
          <Metric label="Cofinanciamiento" value={`${b.cofi}%`} color={b.cofi > 0 && b.cofi < fund.cofiMin ? 'var(--amber)' : 'var(--teal)'} />
          <Metric label="Tope" value={fmt(b.tope)} color="var(--slate)" />
        </div>
      )}

      {b.alerts.map((al, i) => (
        <AgentFinding key={i} color={al.color}>
          <span className="mono" style={{ fontSize: 10, color: al.color }}>{al.tag}</span>
          <div>{al.text}</div>
        </AgentFinding>
      ))}

      {b.hasRows && (
        <Button variant="teal" onClick={() => dispatch({ type: 'GO_DATOS' })} style={{ marginTop: 12 }}>Continuar a datos y equipo →</Button>
      )}
    </Card>
  );
}

const cell: CSSProperties = { width: '100%', padding: '7px 8px', borderRadius: 'var(--radius-cell)', border: '1px solid var(--rule)', fontSize: 13 };

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 17, color }}>{value}</div>
    </div>
  );
}
