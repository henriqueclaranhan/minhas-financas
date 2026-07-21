import { useMemo, useState } from 'react';
import { endOfMonth, format, isValid, parseISO, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { useFinance } from '../../../store/FinanceContext';
import { useLocale } from '../../../store/LocaleContext';
import { calculateCompetenceExpensesByCategory } from '../../../utils/categoryExpenseUtils';
import { CategoryExpenseFilterMode, type CategoryExpenseFilterMode as CategoryExpenseFilterModeValue } from '../../../enums/UIEnums';
import { useCompetenceEntries } from '../../../hooks/useCompetenceEntries';

export function useCategoryExpensesViewModel() {
  const { transactions, isLoading: isFinanceLoading } = useFinance();
  const { locale, formatCurrency } = useLocale();
  const now = new Date();
  const defaultMonth = now.getMonth();
  const defaultYear = now.getFullYear();
  const defaultStartDate = startOfMonth(now);
  const defaultEndDate = endOfMonth(now);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = searchParams.get('mode');
  const queryMonth = Number(searchParams.get('month'));
  const queryYear = Number(searchParams.get('year'));
  const queryStart = searchParams.get('start');
  const queryEnd = searchParams.get('end');
  const initialMode = Object.values(CategoryExpenseFilterMode).includes(queryMode as CategoryExpenseFilterModeValue)
    ? queryMode as CategoryExpenseFilterModeValue
    : CategoryExpenseFilterMode.MONTH;
  const initialMonth = Number.isInteger(queryMonth) && queryMonth >= 1 && queryMonth <= 12 ? queryMonth - 1 : defaultMonth;
  const initialYear = Number.isInteger(queryYear) && queryYear >= 1900 && queryYear <= 9999 ? queryYear : defaultYear;
  const parsedStart = queryStart ? parseISO(queryStart) : defaultStartDate;
  const parsedEnd = queryEnd ? parseISO(queryEnd) : defaultEndDate;
  const initialStart = queryStart && /^\d{4}-\d{2}-\d{2}$/.test(queryStart) && isValid(parsedStart) ? parsedStart : defaultStartDate;
  const initialEnd = queryEnd && /^\d{4}-\d{2}-\d{2}$/.test(queryEnd) && isValid(parsedEnd) ? parsedEnd : defaultEndDate;

  const filterMode = initialMode;
  const selectedMonth = initialMonth;
  const selectedYear = initialYear;
  const startDate = filterMode === CategoryExpenseFilterMode.MONTH ? startOfMonth(new Date(selectedYear, selectedMonth, 1)) : initialStart;
  const endDate = filterMode === CategoryExpenseFilterMode.MONTH ? endOfMonth(new Date(selectedYear, selectedMonth, 1)) : initialEnd;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [tempFilterMode, setTempFilterMode] = useState<CategoryExpenseFilterModeValue>(initialMode);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(initialMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(initialYear);
  const [tempStartDate, setTempStartDate] = useState(initialStart);
  const [tempEndDate, setTempEndDate] = useState(initialEnd);
  const [filterErrorKey, setFilterErrorKey] = useState<string | null>(null);

  const startDateIso = format(startDate, 'yyyy-MM-dd');
  const endDateIso = format(endDate, 'yyyy-MM-dd');
  const { entries: competenceEntries, isLoading: isCompetenceLoading } = useCompetenceEntries(startDateIso, endDateIso, transactions);
  const categoryData = useMemo(
    () => calculateCompetenceExpensesByCategory(competenceEntries),
    [competenceEntries],
  );

  const totalExpense = useMemo(
    () => categoryData.reduce((total, category) => total + category.value, 0),
    [categoryData],
  );

  const periodLabel = useMemo(() => {
    if (filterMode === CategoryExpenseFilterMode.MONTH) {
      const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
        new Date(selectedYear, selectedMonth, 1),
      );
      return `${monthName.replace(/^\p{L}/u, (letter) => letter.toUpperCase())} ${selectedYear}`;
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
  }, [endDate, filterMode, locale, selectedMonth, selectedYear, startDate]);

  const handleOpenFilters = () => {
    setTempFilterMode(filterMode);
    setTempSelectedMonth(selectedMonth);
    setTempSelectedYear(selectedYear);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setFilterErrorKey(null);
    setIsFilterModalOpen(true);
  };

  const handleCloseFilters = () => {
    setFilterErrorKey(null);
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = () => {
    if (tempFilterMode === CategoryExpenseFilterMode.RANGE && tempEndDate < tempStartDate) {
      setFilterErrorKey('categoryExpenses.invalidRange');
      return;
    }

    setFilterErrorKey(null);
    setSearchParams(() => {
      const next = new URLSearchParams({ mode: tempFilterMode });
      if (tempFilterMode === CategoryExpenseFilterMode.MONTH) {
        next.set('month', String(tempSelectedMonth + 1));
        next.set('year', String(tempSelectedYear));
      } else {
        next.set('start', format(tempStartDate, 'yyyy-MM-dd'));
        next.set('end', format(tempEndDate, 'yyyy-MM-dd'));
      }
      return next;
    }, { replace: true });

    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setTempFilterMode(CategoryExpenseFilterMode.MONTH);
    setTempSelectedMonth(defaultMonth);
    setTempSelectedYear(defaultYear);
    setTempStartDate(defaultStartDate);
    setTempEndDate(defaultEndDate);
    setSearchParams({}, { replace: true });
    setFilterErrorKey(null);
    setIsFilterModalOpen(false);
  };

  return {
    state: {
      categoryData,
      topCategory: categoryData[0],
      secondCategory: categoryData[1],
      totalExpense,
      formattedTotalExpense: formatCurrency(totalExpense),
      filterMode,
      selectedMonth,
      selectedYear,
      startDate,
      endDate,
      periodLabel,
      isFilterModalOpen,
      tempFilterMode,
      tempSelectedMonth,
      tempSelectedYear,
      tempStartDate,
      tempEndDate,
      filterErrorKey,
      defaultYear,
      startDateValue: format(tempStartDate, 'yyyy-MM-dd'),
      endDateValue: format(tempEndDate, 'yyyy-MM-dd'),
      formatCurrency,
      isLoading: isFinanceLoading || isCompetenceLoading,
    },
    actions: {
      setTempFilterMode,
      setTempSelectedMonth,
      setTempSelectedYear,
      setTempStartDate,
      setTempEndDate,
      handleOpenFilters,
      handleCloseFilters,
      handleApplyFilters,
      handleResetFilters,
      setTempStartDateValue: (value: string) => value && setTempStartDate(parseISO(value)),
      setTempEndDateValue: (value: string) => value && setTempEndDate(parseISO(value)),
    },
  };
}
