import type { AppState } from './types';

/** Estado inicial (README §Estado de la aplicación → INITIAL). */
export const INITIAL: AppState = {
  screen: 'landing',
  diagStep: 'ask',
  diagFondoManual: '',
  diagManualMatchId: null,
  tipo: null,
  etapa: null,
  sector: null,
  mujeres: null,
  fondoId: 'semilla-inicia',

  diagEmail: '',
  diagEmailSent: false,
  pilotoEmail: '',
  accessLinkSent: false,

  block: 'identidad',
  identidad: { razonSocial: '', rut: '', direccion: '', comuna: '', telefono: '', repLegal: '' },
  consent: false,
  answers: {},
  redactorMode: 'choice',
  draft: '',
  generated: '',
  budget: [],
  stats: { ventasAnterior: '', empleados: '', exportaciones: '', capitalPrevio: '', mercado: '', proyeccion: '' },
  team: [{ nombre: '', rol: '', dedicacion: '' }],

  levStage: 'work',
  verifyIndex: -1,
  demoMode: false,
  comentarios: [],
  reeditado: false,
  lastEdit: null,

  simOffline: false,
  simSaveError: false,
  simLlmError: false,
  simFondoCerrado: false,
  simLinkExpired: false,
  simExportError: false,

  statePanelOpen: false,
  showResume: false,
};
