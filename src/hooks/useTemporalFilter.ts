import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import { TemporalFilterMode, type TemporalFilterMode as TemporalFilterModeValue } from '../enums/UIEnums';
import { useLocale } from '../store/LocaleContext';

export interface TemporalFilterInitialState {
  mode?: TemporalFilterModeValue;
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseISO(value).getTime());
}

export function useTemporalFilter(defaultMode: TemporalFilterModeValue, initialState: TemporalFilterInitialState = {}) {
  const { locale, t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const now = new Date();
  const fallback = {
    mode: initialState.mode ?? defaultMode,
    month: initialState.month ?? now.getMonth(),
    year: initialState.year ?? now.getFullYear(),
    startDate: initialState.startDate ?? format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: initialState.endDate ?? format(endOfMonth(now), 'yyyy-MM-dd'),
  };
  const defaultMonth = fallback.month;
  const defaultYear = fallback.year;
  const defaultStartDate = fallback.startDate;
  const defaultEndDate = fallback.endDate;
  const initialMode = fallback.mode;

  const queryMode = searchParams.get('mode');
  const queryMonth = Number(searchParams.get('month'));
  const queryYear = Number(searchParams.get('year'));
  const queryStartDate = searchParams.get('start');
  const queryEndDate = searchParams.get('end');
  const mode = Object.values(TemporalFilterMode).includes(queryMode as TemporalFilterModeValue) ? queryMode as TemporalFilterModeValue : fallback.mode;
  const month = Number.isInteger(queryMonth) && queryMonth >= 1 && queryMonth <= 12 ? queryMonth - 1 : fallback.month;
  const year = Number.isInteger(queryYear) && queryYear >= 1900 && queryYear <= 9999 ? queryYear : fallback.year;
  const startDate = isIsoDate(queryStartDate) ? queryStartDate : fallback.startDate;
  const endDate = isIsoDate(queryEndDate) ? queryEndDate : fallback.endDate;
  const [tempMode, setTempMode] = useState(initialMode);
  const [tempMonth, setTempMonth] = useState(defaultMonth);
  const [tempYear, setTempYear] = useState(defaultYear);
  const [tempStartDate, setTempStartDate] = useState(defaultStartDate);
  const [tempEndDate, setTempEndDate] = useState(defaultEndDate);
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setTempMode(mode);
    setTempMonth(month);
    setTempYear(year);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(true);
  };

  const apply = () => {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      next.set('mode', tempMode);
      next.set('year', String(tempYear));
      if (tempMode === TemporalFilterMode.MONTH) next.set('month', String(tempMonth + 1));
      else next.delete('month');
      if (tempMode === TemporalFilterMode.PERIOD) {
        next.set('start', tempStartDate);
        next.set('end', tempEndDate);
      } else {
        next.delete('start');
        next.delete('end');
      }
      return next;
    }, { replace: true });
    setIsOpen(false);
  };

  const reset = () => {
    setTempMode(initialMode);
    setTempMonth(defaultMonth);
    setTempYear(defaultYear);
    setTempStartDate(defaultStartDate);
    setTempEndDate(defaultEndDate);
  };

  const matchesDate = useCallback((isoDate: string) => {
    const date = parseISO(isoDate);
    if (mode === TemporalFilterMode.MONTH) return date.getUTCMonth() === month && date.getUTCFullYear() === year;
    if (mode === TemporalFilterMode.YEAR) return date.getUTCFullYear() === year;
    return isWithinInterval(date, { start: parseISO(startDate), end: parseISO(endDate) });
  }, [endDate, mode, month, startDate, year]);

  const label = useMemo(() => {
    if (mode === TemporalFilterMode.MONTH) {
      const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(year, month, 1));
      return t('filters.monthOfYear', { month: monthName.replace(/^\p{L}/u, letter => letter.toUpperCase()), year });
    }
    if (mode === TemporalFilterMode.YEAR) return t('filters.fullYearOf', { year });
    const formatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${formatter.format(parseISO(startDate))} – ${formatter.format(parseISO(endDate))}`;
  }, [endDate, locale, mode, month, startDate, t, year]);

  return {
    state: { mode, month, year, startDate, endDate, tempMode, tempMonth, tempYear, tempStartDate, tempEndDate, isOpen, label, defaultYear },
    actions: { setTempMode, setTempMonth, setTempYear, setTempStartDate, setTempEndDate, setIsOpen, open, apply, reset, matchesDate },
  };
}
