/** Pantalla de entrega: tres descargas por propósito, atajos de edición,
 * comentario del formulador, checklist de documentos propios y vista previa con el
 * estado real de cada sección. Falla de descarga: el expediente sigue aprobado. */
import { useApp } from '../../state/AppContext';
import { FUNDS } from '../../data/funds';
import { analyzeExpediente } from '../../domain/expediente';
import { computeSections } from '../../state/selectors';
import { Card, Button, Pill } from '../../ui/primitives';
import type { Block } from '../../state/types';

const DOWNLOADS = [
  { label: 'PDF', proposito: 'para revisar y archivar' },
  { label: 'Word', proposito: 'para transcribir a la plataforma oficial' },
  { label: 'Guión del video', proposito: 'los 40 segundos que exige la convocatoria' },
];

const DOCS_PROPIOS = [
  'Certificado de vigencia de la sociedad',
  'Cédula del representante legal',
  'Carpeta tributaria del último año',
  'Video de presentación de 40 segundos',
];

const EDIT_SHORTCUTS: { label: string; block: Block }[] = [
  { label: 'Editar antecedentes', block: 'identidad' },
  { label: 'Editar narrativa', block: 'narrativa' },
  { label: 'Editar presupuesto', block: 'presupuesto' },
  { label: 'Editar datos y equipo', block: 'datos' },
];

export function Entrega() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];
  const a = analyzeExpediente(state);
  const { sections } = computeSections(state);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px 60px' }}>
      <Pill color={a.hardIssues > 0 ? 'var(--amber)' : 'var(--teal)'} bg={a.hardIssues > 0 ? 'var(--bg-warning)' : 'var(--bg-success)'}>
        {a.hardIssues > 0 ? 'Expediente entregado · requiere ajuste tuyo' : 'Expediente revisado y aprobado'}
      </Pill>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', margin: '12px 0' }}>Tu expediente de {fund.nombre}</h1>

      <Card accent="var(--teal)" style={{ marginBottom: 20 }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--teal)' }}>Comentario de cierre · Marcela, formuladora</span>
        <p style={{ fontSize: 14 }}>
          Bajé la proyección de ventas del año 2 a 6% del mercado que declaraste — dentro del rango de los adjudicados de
          este instrumento. Subí tu aporte propio para cruzar el mínimo de cofinanciamiento, y moví parte de administración a
          difusión para quedar bajo el tope.
        </p>
      </Card>

      {state.simExportError ? (
        <Card accent="var(--amber)" style={{ marginBottom: 20 }}>
          <strong style={{ color: 'var(--amber)' }}>No pudimos generar la descarga</strong>
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>
            Tu expediente sigue aprobado. Puedes reintentar, o te lo mandamos por correo apenas se resuelva — no tienes que
            volver a entrar.
          </p>
          <Button onClick={() => dispatch({ type: 'TOGGLE_SIM', key: 'simExportError' })} style={{ marginTop: 8 }}>Reintentar descarga</Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
          {DOWNLOADS.map((d) => (
            <Card key={d.label}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{d.label}</div>
              <p style={{ fontSize: 13, color: 'var(--slate)' }}>{d.proposito}</p>
              <Button variant="teal" onClick={() => alert(`Descarga de ${d.label} (simulada en el prototipo)`)} style={{ marginTop: 8 }}>Descargar {d.label}</Button>
            </Card>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Card>
          <h3 style={{ fontSize: 16 }}>Vista previa por sección</h3>
          {sections.map((sec) => {
            const color = sec.docState === 'completa' ? 'var(--teal)' : sec.docState === 'parcial' ? 'var(--amber)' : '#9aa0a8';
            return (
              <div key={sec.num} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--rule)' }}>
                <strong style={{ fontSize: 13 }}>{sec.num} · {sec.title}</strong>
                <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color }}>{sec.docState}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EDIT_SHORTCUTS.map((s) => (
              <Button key={s.block} onClick={() => dispatch({ type: 'EDIT_FROM_ENTREGA', block: s.block })}>{s.label}</Button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 16 }}>Lo que falta de tu lado</h3>
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>Documentos que solo tú tienes. El envío en la plataforma lo haces tú.</p>
          {DOCS_PROPIOS.map((d) => (
            <label key={d} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
              <input type="checkbox" /> {d}
            </label>
          ))}
        </Card>
      </div>
    </div>
  );
}
