/**
 * Raíz de la aplicación. Un selector de "superficie" reúne las piezas del producto
 * que en las referencias venían como archivos .dc.html separados: la app del
 * postulante, el panel del formulador, el expediente entregable, los correos y el
 * anexo legal. En producción cada una es una ruta; aquí conviven para revisión.
 */
import { useState } from 'react';
import { AppProvider } from './state/AppContext';
import { PostulanteApp } from './screens/postulante/PostulanteApp';
import { PanelFormulador } from './screens/formulador/PanelFormulador';
import { ExpedienteDoc } from './screens/documento/ExpedienteDoc';
import { Correos } from './screens/correos/Correos';
import { LegalMetricas } from './screens/legal/LegalMetricas';

type Surface = 'postulante' | 'formulador' | 'documento' | 'correos' | 'legal';

const SURFACES: { key: Surface; label: string }[] = [
  { key: 'postulante', label: 'App del postulante' },
  { key: 'formulador', label: 'Panel del formulador' },
  { key: 'documento', label: 'Expediente (entregable)' },
  { key: 'correos', label: 'Correos' },
  { key: 'legal', label: 'Legal y métricas' },
];

export function App() {
  const [surface, setSurface] = useState<Surface>('postulante');

  return (
    <div>
      <nav style={{ background: 'var(--ink)', color: '#fff', display: 'flex', gap: 4, padding: '8px 16px', flexWrap: 'wrap', alignItems: 'center', overflowX: 'auto' }}>
        <strong style={{ fontFamily: 'var(--font-serif)', fontSize: 14, marginRight: 12 }}>Copiloto · demo de desarrollo</strong>
        {SURFACES.map((s) => (
          <button
            key={s.key}
            onClick={() => setSurface(s.key)}
            aria-current={surface === s.key}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '5px 12px',
              fontSize: 12,
              background: surface === s.key ? '#fff' : 'transparent',
              color: surface === s.key ? 'var(--ink)' : '#c7d0dc',
            }}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {surface === 'postulante' && (
        <AppProvider>
          <PostulanteApp />
        </AppProvider>
      )}
      {surface === 'formulador' && <PanelFormulador />}
      {surface === 'documento' && <ExpedienteDoc />}
      {surface === 'correos' && <Correos />}
      {surface === 'legal' && <LegalMetricas />}
    </div>
  );
}
