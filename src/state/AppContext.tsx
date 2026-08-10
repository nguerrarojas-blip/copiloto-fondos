/**
 * Contexto global de la app del postulante.
 *
 * Dos modos de persistencia:
 *  - Con backend (VITE_API_URL definida): carga y guarda contra la API. El estado
 *    vive en el servidor, colgado de una postulación (README §Estado).
 *  - Sin backend: localStorage, para que la demo autónoma abra sin servidor.
 *
 * Además orquesta los temporizadores simulados (generación del Redactor y pipeline
 * de verificación). En producción la orquestación de agentes es real.
 */
import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import type { AppState } from './types';
import { INITIAL } from './initialState';
import { reducer, type Action } from './reducer';
import { track } from '../domain/metrics';
import { api, apiEnabled, readToken, ApiError } from '../api/client';

const STORAGE_KEY = 'copiloto_final_v2_state';

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<Ctx | null>(null);

function hydrateLocal(): AppState {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppState>;
      if (saved.levStage === 'verifying') saved.levStage = 'work';
      if (saved.redactorMode === 'generating') saved.redactorMode = 'choice';
      const hasProgress = !!saved.screen && saved.screen !== 'landing';
      return { ...INITIAL, ...saved, showResume: hasProgress, statePanelOpen: false };
    }
  } catch {
    /* estado corrupto → arranca limpio */
  }
  return INITIAL;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Con backend arrancamos limpio y cargamos async; sin backend, desde localStorage.
  const [state, dispatch] = useReducer(reducer, undefined, () => (apiEnabled() ? INITIAL : hydrateLocal()));
  const genTimer = useRef<ReturnType<typeof setTimeout>>();
  const verifyTimer = useRef<ReturnType<typeof setTimeout>>();
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const hydrated = useRef(false);

  // Carga inicial desde el servidor (si hay backend y token de acceso).
  useEffect(() => {
    if (!apiEnabled()) {
      hydrated.current = true;
      return;
    }
    const token = readToken();
    if (!token) {
      hydrated.current = true;
      return;
    }
    api
      .getPostulacion()
      .then(({ state: server }) => dispatch({ type: 'HYDRATE_SERVER', state: server, showResume: true }))
      .catch((e) => {
        // Enlace vencido: mostramos la pantalla que reemite, nunca un error opaco.
        if (e instanceof ApiError && e.status === 410) dispatch({ type: 'TOGGLE_SIM', key: 'simLinkExpired' });
      })
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  // Persistencia.
  useEffect(() => {
    if (!hydrated.current || state.simSaveError) return;

    if (apiEnabled()) {
      // Guardado en servidor con debounce; solo cuando ya existe una postulación.
      if (!readToken() || (state.screen !== 'levantamiento' && state.screen !== 'entrega')) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        api.savePostulacion(state).catch(() => {
          /* la UI puede mostrar "sin guardar" vía simSaveError si se desea */
        });
      }, 600);
      return () => clearTimeout(saveTimer.current);
    }

    // Sin backend: localStorage.
    try {
      const { statePanelOpen, showResume, ...persist } = state;
      void statePanelOpen;
      void showResume;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [state]);

  // Redactor (modo local, sin backend): al entrar en "generating", resuelve tras un
  // momento con la plantilla. Con backend, la generación la dispara NarrativaBlock
  // llamando a la API (Claude), así que acá no hacemos nada.
  useEffect(() => {
    if (!apiEnabled() && state.redactorMode === 'generating') {
      genTimer.current = setTimeout(() => dispatch({ type: 'SUBMIT_FREE_TEXT_RESOLVE' }), 1100);
      return () => clearTimeout(genTimer.current);
    }
  }, [state.redactorMode]);

  // Pipeline de verificación: avanza QA → Coherencia → Benchmark.
  useEffect(() => {
    if (state.levStage === 'verifying' && state.verifyIndex >= 0 && state.verifyIndex <= 2) {
      verifyTimer.current = setTimeout(() => dispatch({ type: 'VERIFY_STEP', index: state.verifyIndex + 1 }), 800);
      return () => clearTimeout(verifyTimer.current);
    }
  }, [state.levStage, state.verifyIndex]);

  // Instrumentación mínima (sin contenido del proyecto).
  useEffect(() => {
    if (state.screen === 'levantamiento') track('levantamiento_iniciado');
  }, [state.screen]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
