import { useMemo, useState } from 'react';
import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { useFinance } from '../../../store/FinanceContext';
import { useLocale } from '../../../store/LocaleContext';
import { calculateCompetenceExpensesByCategory } from '../../../utils/categoryExpenseUtils';
import { CategoryExpenseFilterMode, type CategoryExpenseFilterMode as CategoryExpenseFilterModeValue } from '../../../enums/UIEnums';
import { useCompetenceEntries } from '../../../hooks/useCompetenceEntries';

export function useCategoryExpensesViewModel() {
  const { transactions } = useFinance();
  const { locale, formatCurrency } = useLocale();
  const now = new Date();
  const defaultMonth = now.getMonth();
  const defaultYear = now.getFullYear();
  const defaultStartDate = startOfMonth(now);
  const defaultEndDate = endOfMonth(now);

  const [filterMode, setFilterMode] = useState<CategoryExpenseFilterModeValue>(CategoryExpenseFilterMode.MONTH);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [tempFilterMode, setTempFilterMode] = useState<CategoryExpenseFilterModeValue>(CategoryExpenseFilterMode.MONTH);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(defaultMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(defaultYear);
  const [tempStartDate, setTempStartDate] = useState(defaultStartDate);
  const [tempEndDate, setTempEndDate] = useState(defaultEndDate);
  const [filterErrorKey, setFilterErrorKey] = useState<string | null>(null);

  const startDateIso = format(startDate, 'yyyy-MM-dd');
  const endDateIso = format(endDate, 'yyyy-MM-dd');
  const { entries: competenceEntries } = useCompetenceEntries(startDateIso, endDateIso, transactions);
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

    setFilterMode(tempFilterMode);
    setFilterErrorKey(null);

    if (tempFilterMode === CategoryExpenseFilterMode.MONTH) {
      const monthDate = new Date(tempSelectedYear, tempSelectedMonth, 1);
      setSelectedMonth(tempSelectedMonth);
      setSelectedYear(tempSelectedYear);
      setStartDate(startOfMonth(monthDate));
      setEndDate(endOfMonth(monthDate));
    } else {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
    }

    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setFilterMode(CategoryExpenseFilterMode.MONTH);
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setTempFilterMode(CategoryExpenseFilterMode.MONTH);
    setTempSelectedMonth(defaultMonth);
    setTempSelectedYear(defaultYear);
    setTempStartDate(defaultStartDate);
    setTempEndDate(defaultEndDate);
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
