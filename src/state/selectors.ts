/**
 * Derivación de las secciones del expediente vivo y del avance global.
 * Portado desde `Copiloto Final.dc.html` (renderVals → sections/progress).
 */
import type { AppState } from './types';
import { FUNDS } from '../data/funds';
import { QUESTIONS } from '../data/questions';
import { computeBudget } from '../domain/budget';
import { textOf, isRaw } from '../domain/expediente';

export interface DocParagraph {
  field: string;
  text: string | null;
  raw: boolean;
}

export interface DocSection {
  num: string;
  title: string;
  kind: string;
  paragraphs: DocParagraph[];
  done: number;
  total: number;
  countLabel: string;
  docState: 'completa' | 'parcial' | 'incompleta';
  emptyNote: string;
}

export interface ExpedienteView {
  sections: DocSection[];
  progressPct: number;
  doneFields: number;
  totalFields: number;
}

export function computeSections(s: AppState): ExpedienteView {
  const fund = FUNDS[s.fondoId];
  const b = computeBudget(s.budget, fund, s.mujeres);
  const agentsRan = ['scored', 'revision', 'devuelto', 'done'].includes(s.levStage);

  const identidadFilled = (['razonSocial', 'rut', 'repLegal', 'direccion', 'comuna', 'telefono'] as const).filter(
    (k) => s.identidad[k],
  ).length;
  const statsFilled = Object.keys(s.stats).filter((k) => String(s.stats[k as keyof typeof s.stats]).length).length;
  const teamFilled = s.team.filter((t) => t.nombre).length;

  const sections: DocSection[] = fund.sections.map((sec, idx) => {
    let done = 0;
    let total = 1;
    let paragraphs: DocParagraph[] = [];

    if (sec.qs) {
      paragraphs = sec.qs
        .filter((id) => s.answers[id] != null)
        .map((id) => ({ field: QUESTIONS[id].field, text: textOf(id, s.answers), raw: isRaw(id, s.answers) }));
      done = paragraphs.length;
      total = sec.qs.length;
      if (sec.kind === 'narrativa+presupuesto') {
        total += 1;
        if (b.hasRows) done += 1;
      }
    } else if (sec.kind === 'identidad') {
      done = identidadFilled;
      total = 6;
    } else if (sec.kind === 'admisibilidad') {
      done = agentsRan ? 1 : 0;
      total = 1;
    } else if (sec.kind === 'equipo') {
      done = teamFilled;
      total = Math.max(1, teamFilled);
    } else if (sec.kind === 'datos') {
      done = statsFilled;
      total = 6;
    }

    const complete = done >= total && total > 0;
    const partial = done > 0 && !complete;
    return {
      num: '0' + (idx + 1),
      title: sec.title,
      kind: sec.kind,
      paragraphs,
      done,
      total,
      countLabel: `${done}/${total}`,
      docState: complete ? 'completa' : partial ? 'parcial' : 'incompleta',
      emptyNote:
        done === 0
          ? sec.kind === 'admisibilidad'
            ? 'Se completa automáticamente cuando corran los agentes de verificación.'
            : 'Sin completar todavía — aparecerá marcada como incompleta en el documento descargable.'
          : '',
    };
  });

  const totalFields = sections.reduce((a, x) => a + x.total, 0);
  const doneFields = sections.reduce((a, x) => a + Math.min(x.done, x.total), 0);
  const progressPct = totalFields ? Math.round((doneFields / totalFields) * 100) : 0;

  return { sections, progressPct, doneFields, totalFields };
}
