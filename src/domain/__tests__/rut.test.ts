import { describe, it, expect } from 'vitest';
import { validRut } from '../rut';

describe('validRut — módulo 11 chileno', () => {
  it('acepta RUT válidos con dígito verificador numérico', () => {
    expect(validRut('77.451.203-9')).toBe(true); // caso del demo (Feria Digital SpA)
    expect(validRut('77.118.400-6')).toBe(true);
    expect(validRut('5.126.298-0')).toBe(true);
  });

  it('acepta dígito verificador K', () => {
    expect(validRut('12.345.670-K')).toBe(true);
    expect(validRut('12345670k')).toBe(true); // normaliza minúscula
  });

  it('rechaza dígito verificador incorrecto', () => {
    expect(validRut('77.451.203-1')).toBe(false);
    expect(validRut('12.345.670-9')).toBe(false);
  });

  it('rechaza entradas demasiado cortas o vacías', () => {
    expect(validRut('')).toBe(false);
    expect(validRut('123-4')).toBe(false);
  });

  it('normaliza puntos y guión (mismo RUT en distintos formatos)', () => {
    expect(validRut('77451203-9')).toBe(true);
    expect(validRut('77.451.203-9')).toBe(true);
  });
});
