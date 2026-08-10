/**
 * Modelo de estado de la aplicación del postulante (README §Estado de la aplicación).
 * En producción esto vive en el servidor, colgado de una postulación que a su vez
 * cuelga de un perfil de empresa persistente (requerimientos §5.2.2).
 */
import type { FondoId } from '../data/funds';

export type Screen = 'landing' | 'piloto' | 'levantamiento' | 'entrega';

export type DiagStep =
  | 'ask'
  | 'manual'
  | 'manualConfirm'
  | 'tipo'
  | 'etapa'
  | 'sector'
  | 'mujeres'
  | 'result'
  | 'nomatch'
  | 'fueraPiloto';

export type Block = 'identidad' | 'narrativa' | 'presupuesto' | 'datos' | 'verificacion';

export type LevStage = 'work' | 'verifying' | 'scored' | 'revision' | 'devuelto' | 'done';

export type RedactorMode = 'choice' | 'writing' | 'generating' | 'review' | 'error';

export interface Identidad {
  razonSocial: string;
  rut: string;
  direccion: string;
  comuna: string;
  telefono: string;
  repLegal: string;
}

export interface BudgetRow {
  categoria: string;
  detalle: string;
  monto: string;
  aporte: string;
}

export interface Stats {
  ventasAnterior: string;
  empleados: string;
  exportaciones: string;
  capitalPrevio: string;
  mercado: string;
  proyeccion: string;
}

export interface TeamMember {
  nombre: string;
  rol: string;
  dedicacion: string;
}

/** Respuesta a una pregunta narrativa: índice de opción, o texto propio (custom). */
export type Answer =
  | number
  | { custom: true; raw?: true; formal: string };

export interface Comentario {
  id: string;
  seccion: string;
  block: Block;
  texto: string;
  respuesta: string;
  resuelto: boolean;
}

export interface AppState {
  screen: Screen;
  diagStep: DiagStep;
  diagFondoManual: string;
  diagManualMatchId: string | null;
  tipo: string | null;
  etapa: string | null;
  sector: string | null;
  mujeres: boolean | null;
  fondoId: FondoId;

  diagEmail: string;
  diagEmailSent: boolean;
  pilotoEmail: string;
  accessLinkSent: boolean;

  block: Block;
  identidad: Identidad;
  consent: boolean;
  answers: Record<string, Answer>;
  redactorMode: RedactorMode;
  draft: string;
  generated: string;
  budget: BudgetRow[];
  stats: Stats;
  team: TeamMember[];

  levStage: LevStage;
  verifyIndex: number;
  demoMode: boolean;
  comentarios: Comentario[];
  reeditado: boolean;
  lastEdit: number | null;

  // Estados del sistema simulados (README §Estados)
  simOffline: boolean;
  simSaveError: boolean;
  simLlmError: boolean;
  simFondoCerrado: boolean;
  simLinkExpired: boolean;
  simExportError: boolean;

  // UI local (no se persiste)
  statePanelOpen: boolean;
  showResume: boolean;
}
