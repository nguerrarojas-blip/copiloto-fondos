/**
 * Reglas del expediente: validez de identidad, avance narrativo, hallazgos de los
 * tres agentes (QA/Admisibilidad, Coherencia, Benchmark), conteo de hallazgos
 * duros y el ESTADO del expediente.
 *
 * Portado desde `Copiloto Final.dc.html` (renderVals). Regla clave (README):
 * el estado tiene DOS valores, nunca un puntaje. Hay hallazgos duros si el RUT es
 * inválido, el monto supera el tope, el cofinanciamiento baja del mínimo, la
 * administración supera su tope, la penetración supera el máximo del corpus, o
 * quedaron secciones sin redactar por el agente. Cualquiera → "Requiere atención".
 * Ninguno → "Listo para revisión". Ambos pasan igual por un formulador.
 */
import type { AppState, Answer } from '../state/types';
import { FUNDS, narrativeIds } from '../data/funds';
import { QUESTIONS } from '../data/questions';
import { CORPUS, AVG_MONTO, AVG_COFI } from '../data/corpus';
import { validRut } from './rut';
import { fmt } from './format';
import { computeBudget } from './budget';
import { computePenetration } from './penetration';

export interface AgentFindings {
  label: string;
  color: string;
  findings: string[];
}

export interface EstadoItem {
  tag: string;
  color: string;
  text: string;
}

export interface Estado {
  label: 'Requiere atención' | 'Listo para revisión';
  color: string;
  copy: string;
  items: EstadoItem[];
}

/** Texto formal que entra al expediente para una respuesta narrativa. */
export function textOf(qid: string, answers: Record<string, Answer>): string | null {
  const a = answers[qid];
  if (a == null) return null;
  return typeof a === 'object' && a.custom ? a.formal : QUESTIONS[qid].options[a as number].formal;
}

/** ¿La respuesta quedó como texto crudo del postulante, sin redactar por el agente? */
export function isRaw(qid: string, answers: Record<string, Answer>): boolean {
  const a = answers[qid];
  return typeof a === 'object' && !!a.custom && !!a.raw;
}

export interface ExpedienteAnalysis {
  rutOk: boolean;
  identidadOk: boolean;
  narrativaDone: boolean;
  answeredCount: number;
  rawCount: number;
  agents: AgentFindings[];
  hardIssues: number;
  estado: Estado;
}

export function analyzeExpediente(s: AppState): ExpedienteAnalysis {
  const fund = FUNDS[s.fondoId];
  const b = computeBudget(s.budget, fund, s.mujeres);
  const pen = computePenetration(s.stats);
  const ids = narrativeIds(s.fondoId);

  const rutOk = validRut(s.identidad.rut);
  const identidadOk = !!(s.identidad.razonSocial && rutOk && s.identidad.repLegal && s.consent);

  const pendingId = ids.find((id) => s.answers[id] == null);
  const narrativaDone = !pendingId;
  const answeredCount = ids.filter((id) => s.answers[id] != null).length;

  // Agente QA / Admisibilidad
  const qaFindings: string[] = [];
  if (!rutOk) qaFindings.push('RUT no válido: la postulación sería rechazada en admisibilidad.');
  if (b.solicitado > b.tope) qaFindings.push(`Monto solicitado sobre el tope del instrumento (${fmt(b.tope)}).`);
  if (b.cofi < fund.cofiMin)
    qaFindings.push(`Cofinanciamiento bajo el mínimo exigido (${b.cofi}% vs ${fund.cofiMin}%).`);
  if (b.adminPct > fund.adminMax)
    qaFindings.push(`Gastos de administración en ${b.adminPct}%, sobre el tope de ${fund.adminMax}%.`);
  qaFindings.push('Falta grabar el video de presentación exigido por la convocatoria.');

  // Agente Coherencia
  const rawCount = ids.filter((id) => isRaw(id, s.answers)).length;
  const customCount = ids.filter((id) => {
    const a = s.answers[id];
    return typeof a === 'object' && a.custom;
  }).length;
  const cohFindings: string[] = [];
  if (rawCount)
    cohFindings.push(`${rawCount} sección(es) quedaron sin redactar por el agente: van tal como las escribió el postulante.`);
  if (customCount - rawCount > 0)
    cohFindings.push(`${customCount - rawCount} sección(es) redactadas desde texto libre: revisar fidelidad.`);
  if (!s.team.some((t) => t.nombre))
    cohFindings.push('El equipo declarado está vacío pero la narrativa menciona trabajo en terreno.');
  if (!cohFindings.length)
    cohFindings.push('Sin contradicciones entre narrativa, presupuesto y datos declarados.');

  // Agente Benchmark · adjudicados
  const benchFindings: string[] = [];
  if (pen.overMax)
    benchFindings.push(
      `Proyección de ventas implica ${pen.penetracion}% de penetración; el máximo entre adjudicados comparables es ${Math.max(
        ...CORPUS.map((c) => c.penetracion),
      )}%.`,
    );
  if (b.solicitado > 0) benchFindings.push(`Monto solicitado ${fmt(b.solicitado)} vs. promedio adjudicado ${fmt(AVG_MONTO)}.`);
  if (b.cofi > 0) benchFindings.push(`Cofinanciamiento ${b.cofi}% vs. ${AVG_COFI}% promedio de los adjudicados.`);

  const agents: AgentFindings[] = [
    { label: 'Agente QA / Admisibilidad', color: '#9C4A3C', findings: qaFindings },
    { label: 'Agente Coherencia', color: '#1F6F63', findings: cohFindings },
    { label: 'Agente Benchmark · adjudicados', color: '#B8863B', findings: benchFindings },
  ];

  // Hallazgos duros → estado
  const hardIssues =
    (!rutOk ? 1 : 0) +
    (b.solicitado > b.tope ? 1 : 0) +
    (b.cofi < fund.cofiMin ? 1 : 0) +
    (b.adminPct > fund.adminMax ? 1 : 0) +
    (pen.overMax ? 1 : 0) +
    rawCount;

  const estado: Estado =
    hardIssues > 0
      ? {
          label: 'Requiere atención',
          color: '#B8863B',
          copy: 'Los agentes marcaron puntos que un evaluador castigaría. Nada te bloquea: el formulador los trabaja contigo antes de entregar.',
          items: [
            ...qaFindings.slice(0, qaFindings.length - 1).map((t) => ({ tag: 'QA / Admisibilidad', color: '#9C4A3C', text: t })),
            ...benchFindings.filter((t) => t.indexOf('penetración') > -1).map((t) => ({ tag: 'Benchmark', color: '#B8863B', text: t })),
            ...(rawCount ? [{ tag: 'Coherencia', color: '#1F6F63', text: `${rawCount} sección(es) sin redactar por el agente.` }] : []),
          ],
        }
      : {
          label: 'Listo para revisión',
          color: '#1F6F63',
          copy: 'Admisibilidad, coherencia y contraste con adjudicados sin hallazgos. Igual pasa por un formulador: es lo que sostiene la promesa de admisibilidad.',
          items: [
            { tag: 'Benchmark', color: '#1F6F63', text: `Tus cifras están dentro del rango de los ${CORPUS.length} proyectos adjudicados de referencia.` },
          ],
        };

  return { rutOk, identidadOk, narrativaDone, answeredCount, rawCount, agents, hardIssues, estado };
}
