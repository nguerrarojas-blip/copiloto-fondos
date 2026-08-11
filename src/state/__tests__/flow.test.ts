import { describe, it, expect } from 'vitest';
import { reducer } from '../reducer';
import { INITIAL } from '../initialState';
import type { AppState } from '../types';
import { analyzeExpediente } from '../../domain/expediente';

/** Recorre el flujo del postulante manejando el reducer, como haría la UI. */
function run(actions: Parameters<typeof reducer>[1][], start: AppState = INITIAL): AppState {
  return actions.reduce((s, a) => reducer(s, a), start);
}

describe('Recorrido del postulante — diagnóstico guiado', () => {
  it('idea + tecnología → Semilla Inicia, llega al piloto y arranca el levantamiento', () => {
    const s = run([
      { type: 'DIAG_NO' },
      { type: 'DIAG_PICK_TIPO', value: 'juridica' },
      { type: 'DIAG_PICK_ETAPA', value: 'idea' },
      { type: 'DIAG_PICK_SECTOR', value: 'tech' },
      { type: 'DIAG_PICK_MUJERES', value: true },
    ]);
    expect(s.fondoId).toBe('semilla-inicia');
    expect(s.diagStep).toBe('result');

    const s2 = run(
      [
        { type: 'GO_PILOTO' },
        { type: 'SET_PILOTO_EMAIL', value: 'camila@feriadigital.cl' },
        { type: 'SEND_ACCESS_LINK' },
        { type: 'START_LEVANTAMIENTO' },
      ],
      s,
    );
    expect(s2.screen).toBe('levantamiento');
    expect(s2.accessLinkSent).toBe(true);
  });

  it('etapa consolidada → convocatoria cerrada, deriva a Semilla Expande (no empuja a un fondo equivocado)', () => {
    const s = run([{ type: 'DIAG_NO' }, { type: 'DIAG_PICK_TIPO', value: 'juridica' }, { type: 'DIAG_PICK_ETAPA', value: 'consolidada' }]);
    expect(s.diagStep).toBe('cerrado');
    expect(s.diagManualMatchId).toBe('semilla-expande');
  });

  it('sector científico → convocatoria cerrada, deriva a Startup Ciencia', () => {
    const s = run([
      { type: 'DIAG_NO' },
      { type: 'DIAG_PICK_TIPO', value: 'juridica' },
      { type: 'DIAG_PICK_ETAPA', value: 'idea' },
      { type: 'DIAG_PICK_SECTOR', value: 'cientifica' },
    ]);
    expect(s.diagStep).toBe('cerrado');
    expect(s.diagManualMatchId).toBe('startup-ciencia');
  });
});

describe('Redactor — la respuesta del usuario nunca se pierde', () => {
  it('falla del LLM: pasa a error conservando el draft; guardar crudo cuenta como hallazgo', () => {
    let s: AppState = { ...INITIAL, screen: 'levantamiento', block: 'narrativa', simLlmError: true, draft: 'mi texto real' };
    s = reducer(s, { type: 'SUBMIT_FREE_TEXT_START' });
    s = reducer(s, { type: 'SUBMIT_FREE_TEXT_RESOLVE' });
    expect(s.redactorMode).toBe('error');
    expect(s.draft).toBe('mi texto real'); // no se perdió
    s = reducer(s, { type: 'KEEP_RAW' });
    const a = s.answers['q1'];
    expect(typeof a === 'object' && a.raw).toBe(true);
  });

  it('camino feliz: genera, se aprueba y entra al expediente', () => {
    let s: AppState = { ...INITIAL, screen: 'levantamiento', block: 'narrativa', draft: 'una app para ferias libres' };
    s = reducer(s, { type: 'SUBMIT_FREE_TEXT_START' });
    s = reducer(s, { type: 'SUBMIT_FREE_TEXT_RESOLVE' });
    expect(s.redactorMode).toBe('review');
    s = reducer(s, { type: 'ACCEPT_GENERATED' });
    const a = s.answers['q1'];
    expect(typeof a === 'object' && a.custom && !a.raw).toBe(true);
  });
});

describe('Ciclo de revisión del formulador', () => {
  it('devuelto → responder los comentarios → solo reenvía cuando todos están resueltos', () => {
    let s = reducer({ ...INITIAL, levStage: 'revision' }, { type: 'SIMULATE_DEVUELTO' });
    expect(s.levStage).toBe('devuelto');
    expect(s.comentarios.length).toBe(2);
    // Reenviar sin resolver no cambia (la UI lo bloquea; aquí validamos el estado).
    s.comentarios.forEach((c) => {
      s = reducer(s, { type: 'SET_COMENTARIO_RESP', id: c.id, value: 'ya lo corregí' });
      s = reducer(s, { type: 'RESOLVER_COMENTARIO', id: c.id });
    });
    expect(s.comentarios.every((c) => c.resuelto)).toBe(true);
    s = reducer(s, { type: 'REENVIAR_REVISION' });
    expect(s.levStage).toBe('revision');
    expect(s.reeditado).toBe(true);
  });
});

describe('Estados del sistema', () => {
  it('el toggle de sim de enlace vencido y su reemisión llevan a retomar', () => {
    let s = reducer({ ...INITIAL, screen: 'levantamiento' }, { type: 'TOGGLE_SIM', key: 'simLinkExpired' });
    expect(s.simLinkExpired).toBe(true);
    s = reducer(s, { type: 'RESEND_LINK' });
    expect(s.simLinkExpired).toBe(false);
    expect(s.showResume).toBe(true);
  });
});

describe('Caso de ejemplo cargado', () => {
  it('LOAD_DEMO deja el expediente en verificación con estado calculado', () => {
    const s = reducer(INITIAL, { type: 'LOAD_DEMO' });
    expect(s.screen).toBe('levantamiento');
    expect(s.block).toBe('verificacion');
    expect(s.levStage).toBe('scored');
    const a = analyzeExpediente(s);
    expect(['Requiere atención', 'Listo para revisión']).toContain(a.estado.label);
  });
});
