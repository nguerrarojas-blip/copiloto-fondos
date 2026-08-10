import { describe, it, expect } from 'vitest';
import { normalize, levenshtein, findFondo } from '../matchmaker';

describe('normalize', () => {
  it('quita tildes, puntuación y baja a minúsculas', () => {
    expect(normalize('Semilla Inicia!')).toBe('semilla inicia');
    expect(normalize('Fondo Créce Sercotec')).toBe('fondo crece sercotec');
  });
});

describe('levenshtein', () => {
  it('distancia 0 para strings iguales', () => {
    expect(levenshtein('crece', 'crece')).toBe(0);
  });
  it('cuenta sustituciones e inserciones', () => {
    expect(levenshtein('crece', 'crfce')).toBe(1);
    expect(levenshtein('crece', 'crece1')).toBe(1);
  });
});

describe('findFondo — búsqueda difusa del Matchmaker', () => {
  it('encuentra por coincidencia exacta / inclusión', () => {
    expect(findFondo('Semilla Inicia')?.id).toBe('semilla-inicia');
    expect(findFondo('crece')?.id).toBe('fondo-crece');
  });

  it('tolera errores tipográficos dentro de max(3, 40% del largo)', () => {
    expect(findFondo('Semila Inicia')?.id).toBe('semilla-inicia');
    expect(findFondo('fondo crese')?.id).toBe('fondo-crece');
  });

  it('reconoce fondos fuera del piloto', () => {
    expect(findFondo('Startup Ciencia')?.id).toBe('startup-ciencia');
    expect(findFondo('Capital Abeja')?.id).toBe('capital-abeja');
  });

  it('devuelve null cuando no hay match razonable', () => {
    expect(findFondo('xkcd zzz plutonio')).toBeNull();
    expect(findFondo('')).toBeNull();
  });
});
