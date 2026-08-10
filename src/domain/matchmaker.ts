/**
 * Motor de búsqueda difusa del Matchmaker.
 * Portado desde `Copiloto Final.dc.html` (normalize, levenshtein, findFondo).
 * Normaliza tildes y puntuación, acepta coincidencia por inclusión y distancia
 * de Levenshtein con tolerancia max(3, 40% del largo del nombre).
 */
import { CATALOGO, type CatalogoFondo } from '../data/catalogo';

// Rango de marcas diacríticas combinantes (U+0300–U+036F) para quitar tildes tras NFD.
const COMBINING_MARKS = /[̀-ͯ]/g;

export function normalize(str: string): string {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] =
        a[i - 1] === b[j - 1]
          ? d[i - 1][j - 1]
          : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
    }
  }
  return d[m][n];
}

export function findFondo(query: string): CatalogoFondo | null {
  const q = normalize(query);
  if (!q) return null;
  let best: CatalogoFondo | null = null;
  let bestDist = Infinity;
  for (const f of CATALOGO) {
    const n = normalize(f.nombre);
    if (n.indexOf(q) > -1 || q.indexOf(n) > -1) return f;
    const d = levenshtein(q, n);
    if (d < bestDist) {
      bestDist = d;
      best = f;
    }
  }
  return best && bestDist <= Math.max(3, Math.floor(normalize(best.nombre).length * 0.4))
    ? best
    : null;
}
