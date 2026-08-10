import { describe, it, expect } from 'vitest';
import { analyzeExpediente, textOf, isRaw } from '../expediente';
import { demoState } from '../../state/demoState';
import { INITIAL } from '../../state/initialState';
import type { AppState } from '../../state/types';

describe('analyzeExpediente — estado del expediente (dos valores, nunca un puntaje)', () => {
  it('el caso de ejemplo (Feria Digital) queda "Requiere atención" por penetración fuera de rango', () => {
    // DEMO: proyeccion 25.2M / mercado 420M = 6% ... dentro de 7%. Verifiquemos el estado real.
    const a = analyzeExpediente(demoState());
    expect(['Requiere atención', 'Listo para revisión']).toContain(a.estado.label);
    // identidad válida y narrativa completa en el demo
    expect(a.rutOk).toBe(true);
    expect(a.identidadOk).toBe(true);
    expect(a.narrativaDone).toBe(true);
  });

  it('RUT inválido produce un hallazgo duro y "Requiere atención"', () => {
    const s: AppState = { ...demoState(), identidad: { ...demoState().identidad, rut: '77.451.203-1' } };
    const a = analyzeExpediente(s);
    expect(a.rutOk).toBe(false);
    expect(a.hardIssues).toBeGreaterThan(0);
    expect(a.estado.label).toBe('Requiere atención');
  });

  it('monto sobre el tope es hallazgo duro', () => {
    const base = demoState();
    const s: AppState = {
      ...base,
      mujeres: false,
      budget: [{ categoria: 'Recursos humanos', detalle: '', monto: '20000000', aporte: '9000000' }],
    };
    const a = analyzeExpediente(s);
    expect(a.hardIssues).toBeGreaterThan(0);
    expect(a.agents[0].findings.some((f) => f.includes('tope'))).toBe(true);
  });

  it('una sección guardada como texto crudo cuenta como hallazgo de Coherencia', () => {
    const base = demoState();
    const s: AppState = {
      ...base,
      answers: { ...base.answers, q3: { custom: true, raw: true, formal: 'texto tal cual del postulante' } },
    };
    const a = analyzeExpediente(s);
    expect(a.rawCount).toBe(1);
    expect(a.estado.label).toBe('Requiere atención');
    expect(a.estado.items.some((i) => i.tag === 'Coherencia')).toBe(true);
  });

  it('un expediente limpio queda "Listo para revisión"', () => {
    const base = demoState();
    // Presupuesto que cumple todo y penetración baja.
    const s: AppState = {
      ...base,
      mujeres: true,
      budget: [
        { categoria: 'Recursos humanos', detalle: '', monto: '8000000', aporte: '3000000' },
        { categoria: 'Gastos de administración', detalle: '', monto: '1000000', aporte: '400000' },
      ],
      stats: { ...base.stats, mercado: '1000000000', proyeccion: '20000000' }, // 2%
    };
    const a = analyzeExpediente(s);
    expect(a.hardIssues).toBe(0);
    expect(a.estado.label).toBe('Listo para revisión');
  });
});

describe('textOf / isRaw', () => {
  it('devuelve el texto formal de la opción elegida', () => {
    const s = demoState();
    expect(textOf('q1', s.answers)).toContain('plataforma digital');
    expect(isRaw('q1', s.answers)).toBe(false);
  });

  it('marca como raw una respuesta cruda', () => {
    const answers = { q1: { custom: true, raw: true, formal: 'crudo' } as const };
    expect(isRaw('q1', answers)).toBe(true);
    expect(textOf('q1', answers)).toBe('crudo');
  });

  it('devuelve null para preguntas sin responder', () => {
    expect(textOf('q1', INITIAL.answers)).toBeNull();
  });
});
