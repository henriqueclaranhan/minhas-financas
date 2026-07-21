import { describe, expect, it } from 'vitest';
import { formatPercentage } from '../../utils/numberFormatUtils';

describe('formatPercentage', () => {
  it('uses a decimal comma for Portuguese', () => {
    expect(formatPercentage(33.333, 'pt-BR')).toBe('33,3%');
  });

  it('uses a decimal point for English', () => {
    expect(formatPercentage(33.333, 'en-US')).toBe('33.3%');
  });
});
