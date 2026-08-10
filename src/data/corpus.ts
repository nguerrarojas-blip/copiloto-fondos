/**
 * Corpus de proyectos adjudicados de referencia (README §Corpus).
 * Anónimo de cara al usuario. En producción es una tabla real a poblar; estos
 * cuatro registros son de muestra. Se usan para promedios y penetración máxima.
 * Portado literalmente desde `Copiloto Final.dc.html` (CORPUS).
 */
export interface CorpusEntry { nombre: string; fondo: string; anio: number; monto: number; cofi: number; penetracion: number; leccion: string; }

export const CORPUS: CorpusEntry[] = [
  { nombre:'Economía circular', fondo:'Semilla Inicia', anio:2024, monto:14200000, cofi:27, penetracion:5,
    leccion:'Presupuesto concentrado en desarrollo y terreno: administración en 9% y sin equipamiento prescindible.' },
  { nombre:'Tecnología agrícola', fondo:'Semilla Inicia', anio:2024, monto:15000000, cofi:32, penetracion:4,
    leccion:'Proyectó 4% del mercado direccionable al año 2 y lo respaldó con cartas de intención de tres compradores.' },
  { nombre:'Turismo rural', fondo:'Semilla Inicia', anio:2023, monto:12800000, cofi:24, penetracion:7,
    leccion:'Su sección de competencia nombró cuatro competidores concretos con debilidades específicas.' },
  { nombre:'Manufactura textil', fondo:'Fondo Crece', anio:2025, monto:8600000, cofi:35, penetracion:6,
    leccion:'Aportó 35% de cofinanciamiento con equipamiento propio valorizado, no solo caja.' },
]

export const AVG_MONTO = Math.round(CORPUS.reduce((a, c) => a + c.monto, 0) / CORPUS.length);
export const AVG_COFI = Math.round(CORPUS.reduce((a, c) => a + c.cofi, 0) / CORPUS.length);
export const MAX_PEN = Math.max(...CORPUS.map((c) => c.penetracion));
