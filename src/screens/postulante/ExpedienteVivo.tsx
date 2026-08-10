/** Expediente vivo a la derecha del levantamiento: refleja en tiempo real lo que
 * se va llenando, con el estado de cada sección. */
import { useApp } from '../../state/AppContext';
import { computeSections } from '../../state/selectors';
import { FUNDS } from '../../data/funds';

export function ExpedienteVivo() {
  const { state } = useApp();
  const { sections, progressPct, doneFields, totalFields } = computeSections(state);
  const fund = FUNDS[state.fondoId];

  return (
    <aside style={{ background: '#fff', border: '1px solid var(--rule)', borderRadius: 'var(--radius-card)', padding: 18, position: 'sticky', top: 92, maxHeight: 'calc(100vh - 110px)', overflow: 'auto' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Expediente · {fund.nombre}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 4px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 30 }}>{progressPct}%</span>
        <span style={{ fontSize: 12, color: 'var(--slate)' }}>{doneFields} de {totalFields} campos del formulario oficial</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--teal)' }} />
      </div>

      <div style={{ marginTop: 14 }}>
        {sections.map((sec) => {
          const color = sec.docState === 'completa' ? 'var(--teal)' : sec.docState === 'parcial' ? 'var(--amber)' : '#9aa0a8';
          return (
            <div key={sec.num} style={{ padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  aria-hidden
                  style={{ width: 18, height: 18, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: sec.docState === 'incompleta' ? 'var(--slate)' : '#fff', background: sec.docState === 'incompleta' ? '#fff' : color, border: `1px solid ${sec.docState === 'incompleta' ? 'var(--rule)' : color}` }}
                >
                  {sec.docState === 'completa' ? '✓' : sec.docState === 'parcial' ? '·' : ''}
                </span>
                <strong style={{ fontSize: 13 }}>
                  {sec.num} · {sec.title}
                </strong>
                <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color }}>{sec.countLabel}</span>
              </div>
              {sec.paragraphs.map((p, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${p.raw ? 'var(--rose)' : 'var(--teal)'}`, paddingLeft: 10, margin: '8px 0 0', fontSize: 12, color: 'var(--slate)' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--slate)' }}>{p.field}{p.raw ? ' · sin redactar' : ''}</span>
                  <p style={{ margin: '2px 0 0' }}>{p.text}</p>
                </div>
              ))}
              {sec.emptyNote && <p style={{ fontSize: 11, color: '#9aa0a8', margin: '6px 0 0' }}>{sec.emptyNote}</p>}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
