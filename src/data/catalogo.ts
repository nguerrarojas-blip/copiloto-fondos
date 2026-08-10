/**
 * Catálogo de fondos para el Matchmaker (búsqueda difusa).
 * Solo dos entran al piloto (semilla-inicia, fondo-crece); el resto se reconoce
 * pero se deriva fuera del piloto.
 */
export interface CatalogoFondo {
  id: string;
  nombre: string;
  institucion: string;
}

export const CATALOGO: CatalogoFondo[] = [
  { id: 'semilla-inicia', nombre: 'Semilla Inicia', institucion: 'CORFO' },
  { id: 'fondo-crece', nombre: 'Fondo Crece', institucion: 'Sercotec' },
  { id: 'semilla-expande', nombre: 'Semilla Expande', institucion: 'CORFO' },
  { id: 'capital-abeja', nombre: 'Capital Abeja Emprende', institucion: 'Sercotec' },
  { id: 'capital-semilla', nombre: 'Capital Semilla Emprende', institucion: 'Sercotec' },
  { id: 'startup-ciencia', nombre: 'Startup Ciencia', institucion: 'ANID' },
];

/** Los dos fondos que el piloto cubre de punta a punta. */
export const PILOTO_FONDOS = ['semilla-inicia', 'fondo-crece'] as const;
