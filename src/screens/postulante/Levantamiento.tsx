/** Levantamiento: split-screen con los cinco bloques a la izquierda y el
 * expediente vivo a la derecha (README §Levantamiento). */
import { useApp } from '../../state/AppContext';
import { FUNDS } from '../../data/funds';
import { analyzeExpediente } from '../../domain/expediente';
import { Pipeline } from './Chrome';
import { ExpedienteVivo } from './ExpedienteVivo';
import { IdentidadBlock } from './blocks/IdentidadBlock';
import { NarrativaBlock } from './blocks/NarrativaBlock';
import { PresupuestoBlock } from './blocks/PresupuestoBlock';
import { DatosBlock } from './blocks/DatosBlock';
import { VerificacionBlock } from './blocks/VerificacionBlock';
import type { Block } from '../../state/types';

const RAIL: { key: Block; label: string }[] = [
  { key: 'identidad', label: 'Identidad' },
  { key: 'narrativa', label: 'Proyecto' },
  { key: 'presupuesto', label: 'Presupuesto' },
  { key: 'datos', label: 'Datos y equipo' },
  { key: 'verificacion', label: 'Verificación' },
];

export function Levantamiento() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];
  const a = analyzeExpediente(state);
  const agentsRan = ['scored', 'revision', 'devuelto', 'done'].includes(state.levStage);
  const statsFilled = Object.values(state.stats).filter((v) => String(v).length).length > 0;
  const teamFilled = state.team.some((t) => t.nombre);

  const ok: Record<Block, boolean> = {
    identidad: a.identidadOk,
    narrativa: a.narrativaDone,
    presupuesto: state.budget.some((r) => Number(r.monto) > 0),
    datos: statsFilled && teamFilled,
    verificacion: agentsRan,
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 20px 60px' }}>
      <Pipeline />

      {/* Riel de bloques */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 18px' }}>
        {RAIL.map((b) => {
          const active = state.block === b.key;
          return (
            <button
              key={b.key}
              onClick={() => dispatch({ type: 'GO_BLOCK', block: b.key })}
              aria-current={active}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                borderRadius: 999,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 500,
                background: active ? 'var(--ink)' : ok[b.key] ? 'var(--bg-success)' : '#fff',
                border: `1px solid ${active ? 'var(--ink)' : 'var(--rule)'}`,
                color: active ? '#fff' : ok[b.key] ? 'var(--teal)' : 'var(--slate)',
              }}
            >
              <span aria-hidden>{ok[b.key] ? '✓' : '○'}</span>
              {b.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', alignItems: 'start' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 8 }}>
            {fund.nombre} · {fund.institucion}
          </div>
          {state.block === 'identidad' && <IdentidadBlock />}
          {state.block === 'narrativa' && <NarrativaBlock />}
          {state.block === 'presupuesto' && <PresupuestoBlock />}
          {state.block === 'datos' && <DatosBlock />}
          {state.block === 'verificacion' && <VerificacionBlock />}
        </div>
        <ExpedienteVivo />
      </div>
    </div>
  );
}
