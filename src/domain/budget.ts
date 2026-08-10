/**
 * Cálculo del presupuesto y sus alertas del Agente QA.
 * Portado desde `Copiloto Final.dc.html` (renderVals → budget).
 *
 * Regla dura del producto: las alertas ADVIERTEN, nunca bloquean. El usuario
 * siempre puede seguir; lo que no puede es no enterarse.
 */
import type { BudgetRow } from '../state/types';
import type { Fund } from '../data/funds';
import { fmt, num } from './format';
import { AVG_COFI } from '../data/corpus';

export interface BudgetAlert {
  tag: string;
  color: string;
  bg: string;
  text: string;
}

export interface BudgetComputation {
  tope: number;
  solicitado: number;
  aporteTot: number;
  cofi: number; // % de aporte propio sobre el total
  admin: number;
  adminPct: number; // % de administración sobre lo solicitado
  hasRows: boolean;
  alerts: BudgetAlert[];
}

/** Detecta las filas de gastos de administración por el nombre de la categoría. */
function isAdmin(categoria: string): boolean {
  return String(categoria).indexOf('administración') > -1;
}

export function computeBudget(budget: BudgetRow[], fund: Fund, mujeres: boolean | null): BudgetComputation {
  const tope = mujeres ? fund.topeMujeres : fund.tope;
  const solicitado = budget.reduce((a, r) => a + num(r.monto), 0);
  const aporteTot = budget.reduce((a, r) => a + num(r.aporte), 0);
  const cofi = solicitado + aporteTot > 0 ? Math.round((aporteTot / (solicitado + aporteTot)) * 100) : 0;
  const admin = budget.filter((r) => isAdmin(r.categoria)).reduce((a, r) => a + num(r.monto), 0);
  const adminPct = solicitado > 0 ? Math.round((admin / solicitado) * 100) : 0;
  const hasRows = budget.some((r) => num(r.monto) > 0);

  const alerts: BudgetAlert[] = [];
  if (solicitado > tope) {
    alerts.push({
      tag: 'Agente QA · tope del instrumento',
      color: '#9C4A3C',
      bg: '#FBF4F2',
      text: `Estás pidiendo ${fmt(solicitado)} y ${fund.nombre} topa en ${fmt(
        tope,
      )}. Puedes seguir, pero así la postulación sería declarada inadmisible.`,
    });
  }
  if (cofi > 0 && cofi < fund.cofiMin) {
    alerts.push({
      tag: 'Agente QA · cofinanciamiento',
      color: '#B8863B',
      bg: '#FDF8EF',
      text: `Tu aporte es ${cofi}% del total y este instrumento exige al menos ${fund.cofiMin}%. Los adjudicados de referencia aportaron ${AVG_COFI}% en promedio.`,
    });
  }
  if (adminPct > fund.adminMax) {
    alerts.push({
      tag: 'Agente QA · gastos de administración',
      color: '#B8863B',
      bg: '#FDF8EF',
      text: `Administración es ${adminPct}% del monto solicitado y el tope es ${fund.adminMax}%. Conviene mover parte a otra categoría.`,
    });
  }
  if (hasRows && !alerts.length) {
    alerts.push({
      tag: 'Agente QA',
      color: '#1F6F63',
      bg: '#F4F8F6',
      text: 'El presupuesto cumple el tope, el cofinanciamiento mínimo y los límites por categoría del instrumento.',
    });
  }

  return { tope, solicitado, aporteTot, cofi, admin, adminPct, hasRows, alerts };
}
