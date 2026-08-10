/** Bloque Identidad — Agente Intake. Datos del postulante + consentimiento.
 * El texto del consentimiento es el exacto de Legal y Metricas §2. */
import { useApp } from '../../../state/AppContext';
import { validRut } from '../../../domain/rut';
import { Card, Field, Button, Pill } from '../../../ui/primitives';
import type { Identidad } from '../../../state/types';

const FIELDS: { key: keyof Identidad; label: string; placeholder: string }[] = [
  { key: 'razonSocial', label: 'Razón social o nombre', placeholder: 'Feria Digital SpA' },
  { key: 'rut', label: 'RUT', placeholder: '77.451.203-9' },
  { key: 'repLegal', label: 'Representante legal', placeholder: 'Nombre completo' },
  { key: 'direccion', label: 'Dirección', placeholder: 'Calle y número' },
  { key: 'comuna', label: 'Comuna', placeholder: 'Ñuñoa' },
  { key: 'telefono', label: 'Teléfono de contacto', placeholder: '+56 9 ...' },
];

export function IdentidadBlock() {
  const { state, dispatch } = useApp();
  const rutOk = validRut(state.identidad.rut);
  const identidadOk = !!(state.identidad.razonSocial && rutOk && state.identidad.repLegal && state.consent);

  return (
    <Card accent="var(--steel)">
      <Pill color="var(--steel)" bg="var(--bg-secondary)">Agente Intake</Pill>
      <h2 style={{ fontSize: 20, margin: '8px 0 4px' }}>Antecedentes del postulante</h2>
      <p style={{ fontSize: 13, color: 'var(--slate)' }}>Datos con validación en vivo. El RUT se comprueba con módulo 11.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: 12 }}>
        {FIELDS.map((f) => {
          const value = state.identidad[f.key] || '';
          const isRut = f.key === 'rut';
          const error = isRut && value.length > 3 && !rutOk ? 'El dígito verificador no calza. Con el RUT malo la postulación se cae en admisibilidad.' : '';
          return (
            <Field
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              value={value}
              onChange={(e) => dispatch({ type: 'SET_IDENT', key: f.key, value: e.target.value })}
              error={error}
              ok={isRut && rutOk ? 'RUT válido' : ''}
              borderColor={error ? 'var(--rose)' : isRut && rutOk ? 'var(--teal)' : 'var(--rule)'}
            />
          );
        })}
      </div>

      <button
        onClick={() => dispatch({ type: 'TOGGLE_CONSENT' })}
        role="checkbox"
        aria-checked={state.consent}
        style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', background: 'var(--bg-secondary)', border: '1px solid var(--rule)', borderRadius: 10, padding: 12, marginTop: 16, width: '100%' }}
      >
        <span aria-hidden style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 5, background: state.consent ? 'var(--teal)' : '#fff', border: `1px solid ${state.consent ? 'var(--teal)' : 'var(--rule)'}`, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
          {state.consent ? '✓' : ''}
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink)' }}>
          Autorizo el tratamiento de los datos de mi empresa y de mi proyecto para elaborar esta postulación. No se usan
          para entrenar modelos ni se comparten con terceros. <em>Ver detalle.</em>
        </span>
      </button>

      <div style={{ marginTop: 16 }}>
        <Button variant="teal" disabled={!identidadOk} onClick={() => dispatch({ type: 'NEXT_FROM_IDENTIDAD' })}>
          Continuar al proyecto →
        </Button>
        {!identidadOk && <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6 }}>Necesitas razón social, RUT válido, representante legal y marcar el consentimiento.</p>}
      </div>
    </Card>
  );
}
