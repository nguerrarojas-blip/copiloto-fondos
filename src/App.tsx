/**
 * Raíz de la aplicación. `/` es el producto real de cara al postulante — sin banner
 * de demo, sin selector de superficies. Las piezas internas (panel del formulador,
 * expediente de referencia, correos, legal) viven en rutas separadas bajo
 * `/interno/*`, no enlazadas desde el producto público.
 *
 * Nota de seguridad: estas rutas internas todavía no exigen sesión real del lado
 * del frontend (el backend sí valida `x-formulador-email` en sus propias rutas,
 * ver `server/src/routes/formulador.ts`, pero el panel de este frontend aún no las
 * llama). No compartir estas URLs fuera del equipo hasta que eso se resuelva.
 */
import { useEffect, useState } from 'react';
import { AppProvider } from './state/AppContext';
import { PostulanteApp } from './screens/postulante/PostulanteApp';
import { PanelFormulador } from './screens/formulador/PanelFormulador';
import { ExpedienteDoc } from './screens/documento/ExpedienteDoc';
import { Correos } from './screens/correos/Correos';
import { LegalMetricas } from './screens/legal/LegalMetricas';

const INTERNAL_ROUTES: { path: string; label: string; render: () => JSX.Element }[] = [
  { path: '/interno/formulador', label: 'Panel del formulador', render: () => <PanelFormulador /> },
  { path: '/interno/expediente', label: 'Expediente (referencia)', render: () => <ExpedienteDoc /> },
  { path: '/interno/correos', label: 'Correos (plantillas)', render: () => <Correos /> },
  { path: '/interno/legal', label: 'Legal y métricas', render: () => <LegalMetricas /> },
];

function usePathname(): string {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

function InternalBanner({ label }: { label: string }) {
  return (
    <div style={{ background: 'var(--ink)', color: '#fff', padding: '8px 16px', fontSize: 12 }}>
      <strong>Interno · {label}</strong> — sin sesión real todavía, no compartir este enlace.
    </div>
  );
}

function InternalIndex() {
  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px', fontFamily: 'var(--font-sans, sans-serif)' }}>
      <h1 style={{ fontSize: 20 }}>Herramientas internas</h1>
      <p style={{ fontSize: 13, color: 'var(--slate)' }}>Referencia de diseño y desarrollo — no es parte del producto público.</p>
      <ul style={{ paddingLeft: 18, fontSize: 14 }}>
        {INTERNAL_ROUTES.map((r) => (
          <li key={r.path} style={{ margin: '8px 0' }}>
            <a href={r.path}>{r.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function App() {
  const path = usePathname();
  const internal = INTERNAL_ROUTES.find((r) => r.path === path);

  if (path === '/interno' || path === '/interno/') return <InternalIndex />;

  if (internal) {
    return (
      <div>
        <InternalBanner label={internal.label} />
        {internal.render()}
      </div>
    );
  }

  return (
    <AppProvider>
      <PostulanteApp />
    </AppProvider>
  );
}
