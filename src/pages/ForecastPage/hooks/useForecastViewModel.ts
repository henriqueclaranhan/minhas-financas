import { useState, useMemo } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { calculateProjections } from '../../../utils/projectionUtils';
import { useLocale } from '../../../store/LocaleContext';
import { startOfYear, endOfYear } from 'date-fns';
import { ForecastFilterMode, type ForecastFilterMode as ForecastFilterModeValue } from '../../../enums/UIEnums';

export function useForecastViewModel() {
  const { transactions, plannedExpenses, initialBalance } = useFinance();
  const { formatCurrency, locale } = useLocale();

  const currentYear = new Date().getFullYear();
  const defaultStartDate = startOfYear(new Date());
  const defaultEndDate = endOfYear(new Date());

  const [includePlannedIncome, setIncludePlannedIncome] = useState(true);
  const [includePlannedExpense, setIncludePlannedExpense] = useState(true);
  
  const [filterType, setFilterType] = useState<ForecastFilterModeValue>(ForecastFilterMode.YEAR);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(defaultEndDate);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Temporary state for the modal
  const [tempFilterType, setTempFilterType] = useState<ForecastFilterModeValue>(ForecastFilterMode.YEAR);
  const [tempSelectedYear, setTempSelectedYear] = useState<number>(currentYear);
  const [tempStartDate, setTempStartDate] = useState<Date>(defaultStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(defaultEndDate);

  const resolvedInitialBalance = initialBalance ?? 0;

  const chartData = useMemo(() => {
    return calculateProjections({
      transactions,
      plannedExpenses,
      initialBalance: resolvedInitialBalance,
      startDate,
      endDate,
      includePlannedIncome,
      includePlannedExpense,
      locale,
    });
  }, [
    transactions,
    plannedExpenses,
    resolvedInitialBalance,
    startDate,
    endDate,
    includePlannedIncome,
    includePlannedExpense,
    locale,
  ]);

  const handleOpenFilters = () => {
    setTempFilterType(filterType);
    setTempSelectedYear(selectedYear);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setFilterType(tempFilterType);
    setSelectedYear(tempSelectedYear);
    if (tempFilterType === ForecastFilterMode.YEAR) {
      setStartDate(startOfYear(new Date(tempSelectedYear, 0, 1)));
      setEndDate(endOfYear(new Date(tempSelectedYear, 11, 1)));
    } else {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
    }
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setTempFilterType(ForecastFilterMode.YEAR);
    setTempSelectedYear(currentYear);
    setTempStartDate(defaultStartDate);
    setTempEndDate(defaultEndDate);
  };

  const handleSelectYear = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    if (!isNaN(year)) {
      setTempSelectedYear(year);
    }
  };

  const totalIncome = useMemo(() => chartData.data.reduce((sum, item) => sum + item.income, 0), [chartData.data]);
  const totalExpense = useMemo(() => chartData.data.reduce((sum, item) => sum + item.expense, 0), [chartData.data]);

  return {
    state: {
      chartData,
      includePlannedIncome,
      includePlannedExpense,
      startDate,
      endDate,
      formatCurrency,
      isFilterModalOpen,
      tempFilterType,
      tempSelectedYear,
      tempStartDate,
      tempEndDate,
      filterType,
      selectedYear,
      totalIncome,
      totalExpense,
    },
    actions: {
      setIncludePlannedIncome,
      setIncludePlannedExpense,
      setIsFilterModalOpen,
      setTempFilterType,
      setTempSelectedYear,
      setTempStartDate,
      setTempEndDate,
      handleOpenFilters,
      handleApplyFilters,
      handleResetFilters,
      handleSelectYear,
    },
  };
}


