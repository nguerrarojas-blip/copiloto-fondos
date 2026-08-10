import { describe, it, expect } from 'vitest';
import { computeBudget } from '../budget';
import { FUNDS } from '../../data/funds';
import type { BudgetRow } from '../../state/types';

const semilla = FUNDS['semilla-inicia'];

function rows(rs: Array<Partial<BudgetRow>>): BudgetRow[] {
  return rs.map((r) => ({ categoria: '', detalle: '', monto: '', aporte: '', ...r }));
}

describe('computeBudget', () => {
  it('suma solicitado y aporte, calcula cofinanciamiento', () => {
    const b = computeBudget(
      rows([
        { categoria: 'Recursos humanos', monto: '8000000', aporte: '2000000' },
      ]),
      semilla,
      false,
    );
    expect(b.solicitado).toBe(8000000);
    expect(b.aporteTot).toBe(2000000);
    expect(b.cofi).toBe(20); // 2M / 10M
  });

  it('aplica el tope elevado cuando lidera una mujer ($17M en Semilla Inicia)', () => {
    const rs = rows([{ categoria: 'Recursos humanos', monto: '16000000', aporte: '5000000' }]);
    expect(computeBudget(rs, semilla, false).tope).toBe(15000000);
    expect(computeBudget(rs, semilla, true).tope).toBe(17000000);
    // A $16M supera el tope normal pero no el de mujeres.
    expect(computeBudget(rs, semilla, false).alerts.some((a) => a.tag.includes('tope'))).toBe(true);
    expect(computeBudget(rs, semilla, true).alerts.some((a) => a.tag.includes('tope'))).toBe(false);
  });

  it('marca cofinanciamiento bajo el mínimo', () => {
    const b = computeBudget(rows([{ monto: '9000000', aporte: '500000' }]), semilla, false);
    expect(b.cofi).toBeLessThan(semilla.cofiMin);
    expect(b.alerts.some((a) => a.tag.includes('cofinanciamiento'))).toBe(true);
  });

  it('marca administración sobre el tope de categoría', () => {
    const b = computeBudget(
      rows([
        { categoria: 'Recursos humanos', monto: '5000000', aporte: '2000000' },
        { categoria: 'Gastos de administración', monto: '2000000', aporte: '1000000' },
      ]),
      semilla,
      false,
    );
    expect(b.adminPct).toBeGreaterThan(semilla.adminMax); // 2M/7M ≈ 29%
    expect(b.alerts.some((a) => a.tag.includes('administración'))).toBe(true);
  });

  it('sin hallazgos duros muestra el mensaje verde de cumplimiento', () => {
    const b = computeBudget(
      rows([
        { categoria: 'Recursos humanos', monto: '8000000', aporte: '3000000' },
        { categoria: 'Gastos de administración', monto: '1000000', aporte: '400000' },
      ]),
      semilla,
      false,
    );
    expect(b.alerts).toHaveLength(1);
    expect(b.alerts[0].color).toBe('#1F6F63');
  });
});
