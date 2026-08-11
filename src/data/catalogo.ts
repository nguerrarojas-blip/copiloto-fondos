/**
 * Catálogo de fondos para el Matchmaker (búsqueda difusa) y para la landing.
 * En producción esto viene de una ingesta desde las bases oficiales de cada
 * institución (README §El catálogo de fondos viene de la fuente oficial) — acá
 * son valores de muestra. La restricción real no es qué fondos conocemos, sino
 * si la convocatoria está abierta: los tres abiertos tienen reglas completas en
 * `data/funds.ts` (tope, cofinanciamiento, secciones); los cerrados solo se
 * reconocen para decirle honestamente al usuario cuándo se espera que abran.
 */
export interface CatalogoFondo {
  id: string;
  nombre: string;
  institucion: string;
  abierto: boolean;
  /** Solo si abierto: cuánto falta para el cierre, ej. "cierra en 12 días". */
  cierre?: string;
  /** Solo si cerrado: cuándo se espera la próxima convocatoria. */
  apertura?: string;
}

export const CATALOGO: CatalogoFondo[] = [
  { id: 'semilla-inicia', nombre: 'Semilla Inicia', institucion: 'CORFO', abierto: true, cierre: 'cierra en 12 días' },
  { id: 'fondo-crece', nombre: 'Fondo Crece', institucion: 'Sercotec', abierto: true, cierre: 'cierra en 15 días' },
  { id: 'capital-abeja', nombre: 'Capital Abeja Emprende', institucion: 'Sercotec', abierto: true, cierre: 'cierra en 8 días' },
  { id: 'semilla-expande', nombre: 'Semilla Expande', institucion: 'CORFO', abierto: false, apertura: 'se espera que abra en septiembre' },
  { id: 'capital-semilla', nombre: 'Capital Semilla Emprende', institucion: 'Sercotec', abierto: false, apertura: 'convocatoria cerrada; la próxima se espera en noviembre' },
  { id: 'startup-ciencia', nombre: 'Startup Ciencia', institucion: 'ANID', abierto: false, apertura: 'se espera que abra en octubre' },
];

export function catalogoById(id: string): CatalogoFondo | undefined {
  return CATALOGO.find((c) => c.id === id);
}
