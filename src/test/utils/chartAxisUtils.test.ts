import { describe, expect, it } from 'vitest';
import { calculateCurrencyAxisWidth, createCompactCurrencyFormatter } from '../../utils/chartAxisUtils';

describe('chartAxisUtils', () => {
  it('compacts large BRL values without losing their sign', () => {
    const format = createCompactCurrencyFormatter('pt-BR', 'BRL');

    expect(format(1_250_000)).toMatch(/R\$.*1,3.*mi/i);
    expect(format(-1_250_000)).toContain('-');
  });

  it('bounds the axis width for very large numeric values', () => {
    const format = createCompactCurrencyFormatter('en-US', 'USD');

    expect(calculateCurrencyAxisWidth([999_999_999_999], format)).toBeLessThanOrEqual(104);
    expect(calculateCurrencyAxisWidth([0], format)).toBeGreaterThanOrEqual(64);
  });
});
