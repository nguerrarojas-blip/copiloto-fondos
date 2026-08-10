/** Bloque Datos estadísticos + Equipo — Agente Intake. La proyección de ventas
 * dispara la alerta de penetración del Agente Benchmark (nunca sugiere cifra). */
import { useApp } from '../../../state/AppContext';
import { computePenetration } from '../../../domain/penetration';
import { MAX_PEN } from '../../../data/corpus';
import { Card, Field, Button, Pill } from '../../../ui/primitives';
import type { Stats } from '../../../state/types';

const STAT_FIELDS: { key: keyof Stats; label: string; note?: string }[] = [
  { key: 'ventasAnterior', label: 'Ventas del año anterior', note: 'En pesos. Cero es una respuesta válida.' },
  { key: 'empleados', label: 'N° de trabajadores' },
  { key: 'exportaciones', label: 'Exportaciones último año' },
  { key: 'capitalPrevio', label: 'Capital levantado antes', note: 'Fondos públicos o privados ya recibidos.' },
  { key: 'mercado', label: 'Mercado direccionable', note: 'Tamaño anual del mercado al que apuntas, en pesos.' },
  { key: 'proyeccion', label: 'Proyección de ventas año 2' },
];

export function DatosBlock() {
  const { state, dispatch } = useApp();
  const pen = computePenetration(state.stats);
  const statsFilled = Object.values(state.stats).some((v) => String(v).length);
  const teamFilled = state.team.some((t) => t.nombre);

  return (
    <Card accent="var(--steel)">
      <Pill color="var(--steel)" bg="var(--bg-secondary)">Agente Intake · datos y equipo</Pill>
      <h2 style={{ fontSize: 20, margin: '8px 0 4px' }}>Datos estadísticos</h2>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: 8 }}>
        {STAT_FIELDS.map((f) => {
          const isProy = f.key === 'proyeccion';
          const note = isProy
            ? pen.overMax
              ? `Agente Benchmark: implica ${pen.penetracion}% del mercado que declaraste. Los adjudicados proyectaron entre 4% y ${MAX_PEN}% al año 2.`
              : pen.penetracion > 0
                ? `Implica ${pen.penetracion}% del mercado declarado — dentro del rango de los adjudicados.`
                : ''
            : f.note || '';
          return (
            <Field
              key={f.key}
              label={f.label}
              inputMode="numeric"
              placeholder="0"
              value={state.stats[f.key] || ''}
              onChange={(e) => dispatch({ type: 'SET_STAT', key: f.key, value: e.target.value })}
              note={note}
              noteColor={isProy && pen.overMax ? 'var(--rose)' : isProy && pen.penetracion > 0 ? 'var(--teal)' : '#8b9099'}
              borderColor={isProy && pen.overMax ? 'var(--rose)' : 'var(--rule)'}
            />
          );
        })}
      </div>

      <h3 style={{ fontSize: 16, margin: '20px 0 8px' }}>Equipo</h3>
      {state.team.map((t, i) => (
        <div key={i} style={{ display: 'grid', gap: 8, gridTemplateColumns: '1.2fr 1.2fr 0.7fr auto', alignItems: 'end', marginBottom: 8 }}>
          <Field label={i === 0 ? 'Nombre' : ''} placeholder="Nombre" value={t.nombre} onChange={(e) => dispatch({ type: 'SET_TEAM', i, key: 'nombre', value: e.target.value })} />
          <Field label={i === 0 ? 'Rol' : ''} placeholder="Rol en el proyecto" value={t.rol} onChange={(e) => dispatch({ type: 'SET_TEAM', i, key: 'rol', value: e.target.value })} />
          <Field label={i === 0 ? '% jornada' : ''} inputMode="numeric" placeholder="100" value={t.dedicacion} onChange={(e) => dispatch({ type: 'SET_TEAM', i, key: 'dedicacion', value: e.target.value })} />
          <button aria-label={`Eliminar integrante ${i + 1}`} onClick={() => dispatch({ type: 'REMOVE_TEAM_ROW', i })} style={{ border: 'none', background: 'none', color: 'var(--rose)', fontSize: 18, paddingBottom: 8 }}>×</button>
        </div>
      ))}
      <Button onClick={() => dispatch({ type: 'ADD_TEAM_ROW' })}>+ Agregar integrante</Button>

      <div style={{ marginTop: 16 }}>
        <Button variant="teal" disabled={!(statsFilled && teamFilled)} onClick={() => dispatch({ type: 'VERIFY_START' })}>
          Verificar el expediente →
        </Button>
      </div>
    </Card>
  );
}
