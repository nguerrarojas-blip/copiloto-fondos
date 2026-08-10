/**
 * Penetración de mercado: proyección año 2 / mercado direccionable.
 * Portado desde `Copiloto Final.dc.html` (renderVals → stats).
 *
 * NUNCA se sugiere una cifra: solo se avisa cuando queda fuera del rango que el
 * instrumento efectivamente financió (máximo del corpus de adjudicados, 7%).
 * Decisión explícita para no inducir a inflar.
 */
import type { Stats } from '../state/types';
import { num } from './format';
import { MAX_PEN } from '../data/corpus';

export interface Penetration {
  mercado: number;
  proyeccion: number;
  penetracion: number; // %
  overMax: boolean;
}

export function computePenetration(stats: Stats): Penetration {
  const mercado = num(stats.mercado);
  const proyeccion = num(stats.proyeccion);
  const penetracion = mercado > 0 ? Math.round((proyeccion / mercado) * 100) : 0;
  return { mercado, proyeccion, penetracion, overMax: penetracion > MAX_PEN };
}
