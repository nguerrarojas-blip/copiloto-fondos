/**
 * Adaptador del motor de reglas para el servidor. REUTILIZA el mismo código del
 * front (una sola fuente de verdad): el estado que se guarda se vuelve a analizar
 * acá para recalcular el estado del expediente, los hallazgos duros y el avance,
 * sin confiar en lo que reporte el cliente.
 */
import type { AppState } from '../../src/state/types.ts';
import { INITIAL } from '../../src/state/initialState.ts';
import { analyzeExpediente } from '../../src/domain/expediente.ts';
import { computeSections } from '../../src/state/selectors.ts';
import { validRut } from '../../src/domain/rut.ts';

export type { AppState };

export interface Derived {
  estadoLabel: string;
  hardIssues: number;
  progressPct: number;
}

/** Normaliza un state recibido del cliente contra el INITIAL, descartando campos
 * de UI que no deben persistir. */
export function normalizeState(partial: Partial<AppState>): AppState {
  const s: AppState = { ...INITIAL, ...partial };
  // Campos que son solo de UI local: no se confían desde el cliente.
  s.statePanelOpen = false;
  s.showResume = false;
  s.simOffline = false;
  s.simSaveError = false;
  s.simLlmError = false;
  s.simFondoCerrado = false;
  s.simLinkExpired = false;
  s.simExportError = false;
  return s;
}

/** Recalcula en el servidor los valores derivados que se promueven a columnas. */
export function deriveFields(s: AppState): Derived {
  const a = analyzeExpediente(s);
  const { progressPct } = computeSections(s);
  return { estadoLabel: a.estado.label, hardIssues: a.hardIssues, progressPct };
}

export { validRut };
