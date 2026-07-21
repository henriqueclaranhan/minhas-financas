import { useState, useMemo } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { calculateProjections } from '../../../utils/projectionUtils';
import { useLocale } from '../../../store/LocaleContext';
import { endOfMonth, endOfYear, format, parseISO, startOfMonth, startOfYear } from 'date-fns';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { useCompetenceEntries } from '../../../hooks/useCompetenceEntries';
import { aggregateCompetenceEntries } from '../../../utils/financeAggregationUtils';

export function useForecastViewModel() {
  const { transactions, plannedExpenses, initialBalance, isLoading: isFinanceLoading } = useFinance();
  const { formatCurrency, locale } = useLocale();

  const temporal = useTemporalFilter(TemporalFilterMode.YEAR);

  const [includePlannedIncome, setIncludePlannedIncome] = useState(true);
  const [includePlannedExpense, setIncludePlannedExpense] = useState(true);
  
  const { mode, month, year, startDate: rangeStart, endDate: rangeEnd } = temporal.state;
  const { startDate, endDate } = useMemo(() => {
    if (mode === TemporalFilterMode.MONTH) {
      const date = new Date(year, month, 1);
      return { startDate: startOfMonth(date), endDate: endOfMonth(date) };
    }
    if (mode === TemporalFilterMode.YEAR) {
      const date = new Date(year, 0, 1);
      return { startDate: startOfYear(date), endDate: endOfYear(date) };
    }
    return { startDate: parseISO(rangeStart), endDate: parseISO(rangeEnd) };
  }, [mode, month, rangeEnd, rangeStart, year]);

  const resolvedInitialBalance = initialBalance ?? 0;
  const { entries: competenceEntries, isLoading: isCompetenceLoading } = useCompetenceEntries('0001-01-01', format(endDate, 'yyyy-MM-dd'), transactions);
  const competenceAggregate = useMemo(() => aggregateCompetenceEntries(competenceEntries), [competenceEntries]);

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
      competenceEntries,
      competenceAggregate,
    });
  }, [
    competenceAggregate,
    competenceEntries,
    plannedExpenses,
    resolvedInitialBalance,
    startDate,
    endDate,
    includePlannedIncome,
    includePlannedExpense,
    locale,
    transactions,
  ]);

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
      temporal: temporal.state,
      totalIncome,
      totalExpense,
      isLoading: isFinanceLoading || isCompetenceLoading,
    },
    actions: {
      setIncludePlannedIncome,
      setIncludePlannedExpense,
      temporal: temporal.actions,
    },
  };
}
