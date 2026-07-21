import { useCallback, useMemo, useState } from 'react';
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import { TemporalFilterMode, type TemporalFilterMode as TemporalFilterModeValue } from '../enums/UIEnums';
import { useLocale } from '../store/LocaleContext';

export function useTemporalFilter(defaultMode: TemporalFilterModeValue) {
  const { locale, t } = useLocale();
  const now = new Date();
  const defaultMonth = now.getMonth();
  const defaultYear = now.getFullYear();
  const defaultStartDate = format(startOfMonth(now), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfMonth(now), 'yyyy-MM-dd');

  const [mode, setMode] = useState(defaultMode);
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [tempMode, setTempMode] = useState(defaultMode);
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
    setMode(tempMode);
    setMonth(tempMonth);
    setYear(tempYear);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setIsOpen(false);
  };

  const reset = () => {
    setTempMode(defaultMode);
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
