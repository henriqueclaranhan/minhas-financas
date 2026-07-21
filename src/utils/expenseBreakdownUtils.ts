import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';
import { TemporalFilterMode, type TemporalFilterMode as TemporalFilterModeValue } from '../enums/UIEnums';
import type { TemporalFilterInitialState } from '../hooks/useTemporalFilter';

export interface ExpenseBreakdownPeriod {
  mode: TemporalFilterModeValue;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getExpenseBreakdownIsoPeriod(period: ExpenseBreakdownPeriod) {
  if (period.mode === TemporalFilterMode.MONTH) {
    const date = new Date(period.year, period.month, 1);
    return {
      startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
    };
  }

  if (period.mode === TemporalFilterMode.YEAR) {
    const date = new Date(period.year, 0, 1);
    return {
      startDate: format(startOfYear(date), 'yyyy-MM-dd'),
      endDate: format(endOfYear(date), 'yyyy-MM-dd'),
    };
  }

  return { startDate: period.startDate, endDate: period.endDate };
}

export function buildExpenseBreakdownPath(period: ExpenseBreakdownPeriod) {
  const params = new URLSearchParams({ mode: period.mode, year: String(period.year) });
  if (period.mode === TemporalFilterMode.MONTH) params.set('month', String(period.month + 1));
  if (period.mode === TemporalFilterMode.PERIOD) {
    params.set('start', period.startDate);
    params.set('end', period.endDate);
  }
  return `/expenses/breakdown?${params.toString()}`;
}

export function parseExpenseBreakdownPeriod(params: URLSearchParams): TemporalFilterInitialState {
  const modeValue = params.get('mode');
  const mode = Object.values(TemporalFilterMode).includes(modeValue as TemporalFilterModeValue)
    ? modeValue as TemporalFilterModeValue
    : undefined;
  const yearValue = Number(params.get('year'));
  const monthValue = Number(params.get('month'));
  const startDate = params.get('start');
  const endDate = params.get('end');

  return {
    mode,
    year: Number.isInteger(yearValue) && yearValue >= 1900 && yearValue <= 2200 ? yearValue : undefined,
    month: Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12 ? monthValue - 1 : undefined,
    startDate: startDate && ISO_DATE_PATTERN.test(startDate) ? startDate : undefined,
    endDate: endDate && ISO_DATE_PATTERN.test(endDate) ? endDate : undefined,
  };
}
