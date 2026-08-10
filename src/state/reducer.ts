/**
 * Reducer de la aplicación del postulante.
 * Porta las transiciones de estado de la clase Component de `Copiloto Final.dc.html`
 * (diagSayYes, pickEtapa, submitFreeText, runVerification, etc.) a acciones puras.
 */
import type { AppState, Block, Answer, BudgetRow, Comentario } from './types';
import type { FondoId } from '../data/funds';
import { FUNDS, narrativeIds } from '../data/funds';
import { INITIAL } from './initialState';
import { demoState } from './demoState';
import { COMENTARIOS_BASE } from '../data/demo';
import { findFondo } from '../domain/matchmaker';
import { formalize } from '../domain/format';

export type Action =
  // Navegación / global
  | { type: 'HYDRATE_SERVER'; state: Partial<AppState>; showResume: boolean }
  | { type: 'RESTART' }
  | { type: 'RESUME_CONTINUE' }
  | { type: 'RESEND_LINK' }
  | { type: 'LOAD_DEMO' }
  | { type: 'TOGGLE_STATE_PANEL' }
  | { type: 'TOGGLE_SIM'; key: keyof AppState }
  // Diagnóstico
  | { type: 'DIAG_YES' }
  | { type: 'DIAG_NO' }
  | { type: 'DIAG_SET_MANUAL'; value: string }
  | { type: 'DIAG_BUSCAR' }
  | { type: 'DIAG_CONFIRMAR' }
  | { type: 'DIAG_CORREGIR' }
  | { type: 'DIAG_PICK_TIPO'; value: string }
  | { type: 'DIAG_PICK_ETAPA'; value: string }
  | { type: 'DIAG_PICK_SECTOR'; value: string }
  | { type: 'DIAG_PICK_MUJERES'; value: boolean }
  | { type: 'DIAG_BACK' }
  | { type: 'DIAG_SET_EMAIL'; value: string }
  | { type: 'DIAG_SUBMIT_EMAIL' }
  // Piloto
  | { type: 'GO_PILOTO' }
  | { type: 'SET_PILOTO_EMAIL'; value: string }
  | { type: 'SEND_ACCESS_LINK' }
  | { type: 'START_LEVANTAMIENTO' }
  // Bloques
  | { type: 'GO_BLOCK'; block: Block }
  // Identidad
  | { type: 'SET_IDENT'; key: keyof AppState['identidad']; value: string }
  | { type: 'TOGGLE_CONSENT' }
  | { type: 'NEXT_FROM_IDENTIDAD' }
  // Narrativa / Redactor
  | { type: 'PICK_OPTION'; qid: string; idx: number }
  | { type: 'START_FREE_TEXT' }
  | { type: 'SET_DRAFT'; value: string }
  | { type: 'CANCEL_FREE_TEXT' }
  | { type: 'EDIT_FREE_TEXT' }
  | { type: 'SUBMIT_FREE_TEXT_START' }
  | { type: 'SUBMIT_FREE_TEXT_RESOLVE' }
  | { type: 'REDACTOR_RESOLVED'; text: string }
  | { type: 'REDACTOR_FAILED' }
  | { type: 'ACCEPT_GENERATED' }
  | { type: 'KEEP_RAW' }
  // Presupuesto / datos / equipo
  | { type: 'GO_PRESUPUESTO' }
  | { type: 'GO_DATOS' }
  | { type: 'SET_BUDGET'; i: number; key: keyof BudgetRow; value: string }
  | { type: 'ADD_BUDGET_ROW' }
  | { type: 'REMOVE_BUDGET_ROW'; i: number }
  | { type: 'SET_STAT'; key: keyof AppState['stats']; value: string }
  | { type: 'SET_TEAM'; i: number; key: keyof AppState['team'][number]; value: string }
  | { type: 'ADD_TEAM_ROW' }
  | { type: 'REMOVE_TEAM_ROW'; i: number }
  // Verificación / revisión / entrega
  | { type: 'VERIFY_START' }
  | { type: 'VERIFY_STEP'; index: number }
  | { type: 'GO_REVISION' }
  | { type: 'SIMULATE_DEVUELTO' }
  | { type: 'SET_COMENTARIO_RESP'; id: string; value: string }
  | { type: 'RESOLVER_COMENTARIO'; id: string }
  | { type: 'REENVIAR_REVISION' }
  | { type: 'COMPLETE_REVIEW' }
  | { type: 'GO_ENTREGA' }
  | { type: 'EDIT_FROM_ENTREGA'; block: Block };

/** Marca de última edición (equivalente al `touch` del original). */
function touch<T extends Partial<AppState>>(patch: T): T & { lastEdit: number } {
  return { ...patch, lastEdit: Date.now() };
}

function pendingQuestionId(s: AppState): string | undefined {
  return narrativeIds(s.fondoId).find((id) => s.answers[id] == null);
}

const EMAIL_RE = /.+@.+\..+/;

export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'HYDRATE_SERVER':
      return { ...INITIAL, ...a.state, showResume: a.showResume, statePanelOpen: false };
    case 'RESTART':
      return { ...INITIAL, showResume: false };
    case 'RESUME_CONTINUE':
      return { ...s, showResume: false };
    case 'RESEND_LINK':
      return { ...s, simLinkExpired: false, showResume: true };
    case 'LOAD_DEMO':
      return demoState();
    case 'TOGGLE_STATE_PANEL':
      return { ...s, statePanelOpen: !s.statePanelOpen };
    case 'TOGGLE_SIM':
      return { ...s, [a.key]: !s[a.key] };

    // Diagnóstico
    case 'DIAG_YES':
      return { ...s, diagStep: 'manual' };
    case 'DIAG_NO':
      return { ...s, diagStep: 'tipo' };
    case 'DIAG_SET_MANUAL':
      return { ...s, diagFondoManual: a.value };
    case 'DIAG_BUSCAR':
      return s.diagFondoManual.trim() ? { ...s, diagStep: 'manualConfirm' } : s;
    case 'DIAG_CONFIRMAR': {
      const m = findFondo(s.diagFondoManual);
      if (!m) return { ...s, diagStep: 'tipo' };
      if (m.id === 'semilla-inicia' || m.id === 'fondo-crece')
        return { ...s, fondoId: m.id as FondoId, diagManualMatchId: m.id, diagStep: 'mujeres' };
      return { ...s, diagManualMatchId: m.id, diagStep: 'fueraPiloto' };
    }
    case 'DIAG_CORREGIR':
      return { ...s, diagStep: 'manual', diagFondoManual: '' };
    case 'DIAG_PICK_TIPO':
      return { ...s, tipo: a.value, diagStep: 'etapa' };
    case 'DIAG_PICK_ETAPA':
      if (a.value === 'consolidada') return { ...s, etapa: a.value, diagStep: 'nomatch' };
      return {
        ...s,
        etapa: a.value,
        fondoId: a.value === 'idea' ? 'semilla-inicia' : 'fondo-crece',
        diagStep: 'sector',
      };
    case 'DIAG_PICK_SECTOR':
      if (a.value === 'cientifica')
        return { ...s, sector: a.value, diagStep: 'fueraPiloto', diagManualMatchId: 'startup-ciencia' };
      return { ...s, sector: a.value, diagStep: 'mujeres' };
    case 'DIAG_PICK_MUJERES':
      return { ...s, mujeres: a.value, diagStep: 'result' };
    case 'DIAG_BACK': {
      const order = ['ask', 'tipo', 'etapa', 'sector', 'mujeres', 'result'];
      const cur = s.diagStep;
      if (cur === 'manual') return { ...s, diagStep: 'ask' };
      if (cur === 'manualConfirm') return { ...s, diagStep: 'manual' };
      if (cur === 'fueraPiloto' || cur === 'nomatch') return { ...s, diagStep: 'etapa' };
      const i = order.indexOf(cur);
      return { ...s, diagStep: (i > 0 ? order[i - 1] : 'ask') as AppState['diagStep'] };
    }
    case 'DIAG_SET_EMAIL':
      return { ...s, diagEmail: a.value };
    case 'DIAG_SUBMIT_EMAIL':
      return EMAIL_RE.test(s.diagEmail) ? { ...s, diagEmailSent: true } : s;

    // Piloto
    case 'GO_PILOTO':
      return { ...s, screen: 'piloto' };
    case 'SET_PILOTO_EMAIL':
      return { ...s, pilotoEmail: a.value };
    case 'SEND_ACCESS_LINK':
      return EMAIL_RE.test(s.pilotoEmail) ? { ...s, accessLinkSent: true } : s;
    case 'START_LEVANTAMIENTO':
      return { ...s, ...touch({ screen: 'levantamiento', block: 'identidad' }) };

    // Bloques
    case 'GO_BLOCK':
      return { ...s, block: a.block, redactorMode: 'choice' };

    // Identidad
    case 'SET_IDENT':
      return { ...s, identidad: { ...s.identidad, [a.key]: a.value }, lastEdit: Date.now() };
    case 'TOGGLE_CONSENT':
      return { ...s, consent: !s.consent };
    case 'NEXT_FROM_IDENTIDAD':
      return { ...s, ...touch({ block: 'narrativa' }) };

    // Narrativa / Redactor
    case 'PICK_OPTION':
      return {
        ...s,
        answers: { ...s.answers, [a.qid]: a.idx },
        redactorMode: 'choice',
        lastEdit: Date.now(),
      };
    case 'START_FREE_TEXT':
      return { ...s, redactorMode: 'writing', draft: '' };
    case 'SET_DRAFT':
      return { ...s, draft: a.value };
    case 'CANCEL_FREE_TEXT':
      return { ...s, redactorMode: 'choice' };
    case 'EDIT_FREE_TEXT':
      return { ...s, redactorMode: 'writing' };
    case 'SUBMIT_FREE_TEXT_START':
      return { ...s, redactorMode: 'generating' };
    case 'SUBMIT_FREE_TEXT_RESOLVE':
      // Resolución local (modo sin backend). La respuesta NUNCA se pierde (queda en draft).
      return s.simLlmError || s.simOffline
        ? { ...s, redactorMode: 'error' }
        : { ...s, redactorMode: 'review', generated: formalize(s.draft) };
    case 'REDACTOR_RESOLVED':
      // Resolución con backend: el párrafo lo generó el servidor (Claude).
      return { ...s, redactorMode: 'review', generated: a.text };
    case 'REDACTOR_FAILED':
      return { ...s, redactorMode: 'error' };
    case 'ACCEPT_GENERATED': {
      const qid = pendingQuestionId(s);
      if (!qid) return { ...s, redactorMode: 'choice' };
      const answer: Answer = { custom: true, formal: s.generated };
      return { ...s, answers: { ...s.answers, [qid]: answer }, redactorMode: 'choice', draft: '', generated: '', lastEdit: Date.now() };
    }
    case 'KEEP_RAW': {
      const qid = pendingQuestionId(s);
      if (!qid) return { ...s, redactorMode: 'choice' };
      const answer: Answer = { custom: true, raw: true, formal: s.draft };
      return { ...s, answers: { ...s.answers, [qid]: answer }, redactorMode: 'choice', draft: '', generated: '', lastEdit: Date.now() };
    }

    // Presupuesto / datos / equipo
    case 'GO_PRESUPUESTO':
      return { ...s, ...touch({ block: 'presupuesto' }) };
    case 'GO_DATOS':
      return { ...s, ...touch({ block: 'datos' }) };
    case 'SET_BUDGET': {
      const budget = s.budget.map((r, j) => (j === a.i ? { ...r, [a.key]: a.value } : r));
      return { ...s, budget, lastEdit: Date.now() };
    }
    case 'ADD_BUDGET_ROW':
      return {
        ...s,
        budget: [...s.budget, { categoria: FUNDS[s.fondoId].categorias[0], detalle: '', monto: '', aporte: '' }],
        lastEdit: Date.now(),
      };
    case 'REMOVE_BUDGET_ROW':
      return { ...s, budget: s.budget.filter((_, j) => j !== a.i), lastEdit: Date.now() };
    case 'SET_STAT':
      return { ...s, stats: { ...s.stats, [a.key]: a.value }, lastEdit: Date.now() };
    case 'SET_TEAM': {
      const team = s.team.map((r, j) => (j === a.i ? { ...r, [a.key]: a.value } : r));
      return { ...s, team, lastEdit: Date.now() };
    }
    case 'ADD_TEAM_ROW':
      return { ...s, team: [...s.team, { nombre: '', rol: '', dedicacion: '' }] };
    case 'REMOVE_TEAM_ROW':
      return { ...s, team: s.team.filter((_, j) => j !== a.i) };

    // Verificación / revisión / entrega
    case 'VERIFY_START':
      return { ...s, block: 'verificacion', levStage: 'verifying', verifyIndex: 0 };
    case 'VERIFY_STEP':
      return a.index > 2
        ? { ...s, levStage: 'scored' }
        : { ...s, verifyIndex: a.index };
    case 'GO_REVISION':
      return { ...s, levStage: 'revision' };
    case 'SIMULATE_DEVUELTO':
      return {
        ...s,
        levStage: 'devuelto',
        comentarios: COMENTARIOS_BASE.map((c) => ({ ...c, block: c.block as Block, respuesta: '', resuelto: false })) as Comentario[],
      };
    case 'SET_COMENTARIO_RESP':
      return { ...s, comentarios: s.comentarios.map((c) => (c.id === a.id ? { ...c, respuesta: a.value } : c)) };
    case 'RESOLVER_COMENTARIO':
      return { ...s, comentarios: s.comentarios.map((c) => (c.id === a.id ? { ...c, resuelto: true } : c)) };
    case 'REENVIAR_REVISION':
      return { ...s, levStage: 'revision', reeditado: true };
    case 'COMPLETE_REVIEW':
      return { ...s, levStage: 'done' };
    case 'GO_ENTREGA':
      return { ...s, screen: 'entrega' };
    case 'EDIT_FROM_ENTREGA':
      return { ...s, screen: 'levantamiento', block: a.block, levStage: 'work', verifyIndex: -1, reeditado: true };

    default:
      return s;
  }
}
