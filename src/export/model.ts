/**
 * Modelo único de datos para los documentos exportables (PDF, Word, guión del
 * video). Una sola fuente de verdad para que las tres salidas nunca se
 * desalineen entre sí ni con lo que ve el usuario en el expediente vivo.
 *
 * Todo el contenido sale del estado real del usuario — nada de texto fijo que
 * describa un proyecto ajeno o un ajuste que no ocurrió (ver README §Qué queda
 * simulado y REVISION_PRODUCCION.md #8).
 */
import type { AppState } from '../state/types';
import { FUNDS } from '../data/funds';
import { computeSections, type DocSection } from '../state/selectors';
import { computeBudget, type BudgetComputation } from '../domain/budget';
import { computePenetration } from '../domain/penetration';
import { textOf } from '../domain/expediente';
import { fmt } from '../domain/format';

export interface AdmisibilidadCheck {
  label: string;
  cumple: boolean;
}

export interface DocumentModel {
  generatedAt: Date;
  fondoNombre: string;
  fondoInstitucion: string;
  razonSocial: string;
  rut: string;
  repLegal: string;
  direccion: string;
  comuna: string;
  telefono: string;
  contactoEmail: string;
  monto: string;
  cofi: number;
  aporte: string;
  tope: string;
  sections: DocSection[];
  budget: AppState['budget'];
  budgetComputation: BudgetComputation;
  admisibilidad: AdmisibilidadCheck[];
  team: AppState['team'];
  stats: AppState['stats'];
  penetracionPct: number;
  proyeccionFmt: string;
  mercadoFmt: string;
  comentariosResueltos: { seccion: string; texto: string }[];
  resumenProyecto: string | null;
  atributoClave: string | null;
}

/** Documento que aún no tiene lo mínimo para exportarse con sentido. */
export function canExport(state: AppState): boolean {
  return !!state.identidad.razonSocial && !!state.identidad.rut;
}

export function buildDocumentModel(state: AppState): DocumentModel {
  const fund = FUNDS[state.fondoId];
  const { sections } = computeSections(state);
  const b = computeBudget(state.budget, fund, state.mujeres);
  const pen = computePenetration(state.stats);
  const tope = state.mujeres ? fund.topeMujeres : fund.tope;

  const admisibilidad: AdmisibilidadCheck[] = [
    { label: `Monto solicitado dentro del tope del instrumento (${fmt(tope)})`, cumple: b.solicitado <= tope },
    { label: `Cofinanciamiento propio igual o superior a ${fund.cofiMin}%`, cumple: b.cofi >= fund.cofiMin },
    { label: `Gastos de administración bajo ${fund.adminMax}% del subsidio`, cumple: b.adminPct <= fund.adminMax },
  ];

  // Comentarios de formulador ya resueltos (reales, si existen). Nunca se inventa
  // un comentario de cierre que el formulador no escribió.
  const comentariosResueltos = state.comentarios
    .filter((c) => c.resuelto && c.texto)
    .map((c) => ({ seccion: c.seccion, texto: c.texto }));

  // Primera respuesta narrativa disponible, para el guión del video.
  const allParagraphs = sections.flatMap((s) => s.paragraphs).filter((p) => p.text);
  const resumenProyecto = allParagraphs[0]?.text ?? null;
  const PREFERRED_SECOND_FIELDS = ['Atributos diferenciadores', 'Mejora productiva a financiar', 'Componente innovador'];
  const preferredSecond = allParagraphs.find((p) => PREFERRED_SECOND_FIELDS.includes(p.field));
  const atributoClave = (preferredSecond ?? allParagraphs[1])?.text ?? null;

  return {
    generatedAt: new Date(),
    fondoNombre: fund.nombre,
    fondoInstitucion: fund.institucion,
    razonSocial: state.identidad.razonSocial,
    rut: state.identidad.rut,
    repLegal: state.identidad.repLegal,
    direccion: state.identidad.direccion,
    comuna: state.identidad.comuna,
    telefono: state.identidad.telefono,
    contactoEmail: state.pilotoEmail,
    monto: fmt(b.solicitado),
    cofi: b.cofi,
    aporte: fmt(b.aporteTot),
    tope: fmt(tope),
    sections,
    budget: state.budget,
    budgetComputation: b,
    admisibilidad,
    team: state.team,
    stats: state.stats,
    penetracionPct: pen.penetracion,
    proyeccionFmt: fmt(pen.proyeccion),
    mercadoFmt: fmt(pen.mercado),
    comentariosResueltos,
    resumenProyecto,
    atributoClave,
  };
}

// Reexport para quien solo necesita textOf sin importar todo el módulo de dominio.
export { textOf };
