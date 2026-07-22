import { describe, expect, it } from 'vitest';
import { TemporalFilterMode } from '../../enums/UIEnums';
import {
  buildExpenseBreakdownPath,
  buildForecastExpenseBreakdownPath,
  buildPlannedExpenseBreakdownPath,
  getExpenseBreakdownIsoPeriod,
  parseExpenseBreakdownPeriod,
} from '../../utils/expenseBreakdownUtils';

describe('expenseBreakdownUtils', () => {
  it('serializes and parses a monthly period using human-readable month numbers', () => {
    const path = buildExpenseBreakdownPath({
      mode: TemporalFilterMode.MONTH,
      month: 6,
      year: 2026,
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    });

    expect(path).toBe('/expenses/breakdown?mode=month&year=2026&month=7');
    expect(parseExpenseBreakdownPeriod(new URLSearchParams(path.split('?')[1]))).toMatchObject({
      mode: TemporalFilterMode.MONTH,
      month: 6,
      year: 2026,
    });
  });

  it('preserves planning filters and forecast toggles in contextual paths', () => {
    const period = {
      mode: TemporalFilterMode.MONTH,
      month: 6,
      year: 2026,
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    };

    expect(buildPlannedExpenseBreakdownPath(period, {
      search: 'Cartão mercado',
      category: 'food',
      method: 'credit',
    })).toBe('/planned/breakdown?mode=month&year=2026&month=7&search=Cart%C3%A3o+mercado&category=food&method=credit');
    expect(buildForecastExpenseBreakdownPath(period, {
      includePlannedIncome: true,
      includePlannedExpense: false,
    })).toBe('/forecast/breakdown?mode=month&year=2026&month=7&plannedExpense=false');
  });

  it('resolves year and custom periods to ISO boundaries', () => {
    expect(getExpenseBreakdownIsoPeriod({
      mode: TemporalFilterMode.YEAR,
      month: 0,
      year: 2026,
      startDate: '',
      endDate: '',
    })).toEqual({ startDate: '2026-01-01', endDate: '2026-12-31' });

    expect(getExpenseBreakdownIsoPeriod({
      mode: TemporalFilterMode.PERIOD,
      month: 0,
      year: 2026,
      startDate: '2026-07-10',
      endDate: '2026-08-05',
    })).toEqual({ startDate: '2026-07-10', endDate: '2026-08-05' });
  });
});
