import type { AppState, Answer, BudgetRow, TeamMember, Stats, Identidad } from './types';
import type { FondoId } from '../data/funds';
import { INITIAL } from './initialState';
import { DEMO } from '../data/demo';

/**
 * Estado del "Recorrer con el caso de ejemplo": precarga un proyecto completo y
 * consistente (Feria Digital SpA) directo en la etapa de verificación.
 * Portado desde `Copiloto Final.dc.html` (loadDemo).
 */
export function demoState(): AppState {
  const answers: Record<string, Answer> = { ...(DEMO.answers as Record<string, number>) };
  return {
    ...INITIAL,
    demoMode: true,
    screen: 'levantamiento',
    fondoId: DEMO.fondoId as FondoId,
    mujeres: DEMO.mujeres,
    pilotoEmail: 'camila@feriadigital.cl',
    accessLinkSent: true,
    block: 'verificacion',
    levStage: 'scored',
    verifyIndex: 3,
    lastEdit: Date.now(),
    identidad: { ...(DEMO.identidad as Identidad) },
    consent: true,
    answers,
    budget: DEMO.budget.map((b) => ({ ...b }) as BudgetRow),
    stats: { ...(DEMO.stats as Stats) },
    team: DEMO.team.map((t) => ({ ...t }) as TeamMember),
  };
}
