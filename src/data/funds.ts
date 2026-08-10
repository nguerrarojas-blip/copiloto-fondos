/**
 * Reglas de los instrumentos del piloto (README §Reglas de negocio).
 * Portado literalmente desde `Copiloto Final.dc.html` (FUNDS).
 * Los topes, cofinanciamiento mínimo, administración máxima, categorías de gasto
 * y secciones deben respetarse tal cual.
 */

export type FondoId = 'semilla-inicia' | 'fondo-crece';

export type SectionKind =
  | 'narrativa'
  | 'identidad'
  | 'admisibilidad'
  | 'narrativa+presupuesto'
  | 'equipo'
  | 'datos';

export interface FundSection {
  key: string;
  title: string;
  kind: SectionKind;
  qs?: string[];
}

export interface Fund {
  id: FondoId;
  nombre: string;
  institucion: string;
  tope: number;
  topeMujeres: number;
  dias: number;
  cofiMin: number;
  adminMax: number;
  motivo: string;
  categorias: string[];
  sections: FundSection[];
}

export const FUNDS: Record<FondoId, Fund> = {
  'semilla-inicia': {
    id: 'semilla-inicia',
    nombre: 'Semilla Inicia',
    institucion: 'CORFO',
    tope: 15000000,
    topeMujeres: 17000000,
    dias: 12,
    cofiMin: 20,
    adminMax: 15,
    motivo:
      'Idea o prototipo sin ventas consolidadas: es exactamente el perfil que financia Semilla Inicia.',
    categorias: [
      'Recursos humanos',
      'Servicios de terceros',
      'Equipamiento',
      'Difusión y marketing',
      'Gastos de administración',
    ],
    sections: [
      { key: 'intro', title: 'Introducción', kind: 'narrativa', qs: ['q1', 'q2'] },
      { key: 'antecedentes', title: 'Antecedentes generales', kind: 'identidad' },
      { key: 'admisibilidad', title: 'Admisibilidad', kind: 'admisibilidad' },
      {
        key: 'innovacion',
        title: 'Innovación',
        kind: 'narrativa',
        qs: ['q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'],
      },
      {
        key: 'escalabilidad',
        title: 'Escalabilidad y presupuesto',
        kind: 'narrativa+presupuesto',
        qs: ['q10', 'q11'],
      },
      { key: 'equipo', title: 'Equipo', kind: 'equipo' },
      { key: 'datos', title: 'Datos estadísticos', kind: 'datos' },
    ],
  },
  'fondo-crece': {
    id: 'fondo-crece',
    nombre: 'Fondo Crece',
    institucion: 'Sercotec',
    tope: 9000000,
    topeMujeres: 9000000,
    dias: 15,
    cofiMin: 30,
    adminMax: 10,
    motivo:
      'Con ventas iniciales y foco en crecer, Fondo Crece financia mejoras productivas y comerciales de empresas ya operando.',
    categorias: [
      'Activos fijos',
      'Habilitación de infraestructura',
      'Marketing y comercialización',
      'Asesorías y capacitación',
      'Gastos de administración',
    ],
    sections: [
      { key: 'negocio', title: 'Descripción del negocio', kind: 'narrativa', qs: ['q1', 'q2'] },
      { key: 'antecedentes', title: 'Antecedentes generales', kind: 'identidad' },
      { key: 'admisibilidad', title: 'Admisibilidad', kind: 'admisibilidad' },
      { key: 'mejora', title: 'Mejora productiva', kind: 'narrativa', qs: ['c1', 'q3', 'q5'] },
      {
        key: 'inversion',
        title: 'Plan de inversión',
        kind: 'narrativa+presupuesto',
        qs: ['q10'],
      },
      { key: 'equipo', title: 'Equipo', kind: 'equipo' },
      { key: 'datos', title: 'Datos estadísticos', kind: 'datos' },
    ],
  },
};

/** IDs de las preguntas narrativas de un fondo, en orden de sección. */
export function narrativeIds(fondoId: FondoId): string[] {
  return FUNDS[fondoId].sections
    .filter((sec) => sec.qs)
    .reduce<string[]>((acc, sec) => acc.concat(sec.qs!), []);
}
