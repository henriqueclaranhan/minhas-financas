import { useState, useMemo } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { calculateProjections } from '../../../utils/projectionUtils';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export function useForecastViewModel() {
  const { transactions, plannedExpenses, initialBalance } = useFinance();

  const [includePlannedIncome, setIncludePlannedIncome] = useState(true);
  const [includePlannedExpense, setIncludePlannedExpense] = useState(true);
  const [monthsToProject, setMonthsToProject] = useState(6);
  const [startMonthOffset, setStartMonthOffset] = useState(0);

  const resolvedInitialBalance = initialBalance ?? 0;

  const chartData = useMemo(() => {
    return calculateProjections({
      transactions,
      plannedExpenses,
      initialBalance: resolvedInitialBalance,
      startMonthOffset,
      monthsToProject,
      includePlannedIncome,
      includePlannedExpense,
    });
  }, [
    transactions,
    plannedExpenses,
    resolvedInitialBalance,
    startMonthOffset,
    monthsToProject,
    includePlannedIncome,
    includePlannedExpense,
  ]);

  return {
    state: {
      chartData,
      includePlannedIncome,
      includePlannedExpense,
      monthsToProject,
      startMonthOffset,
      formatCurrency,
    },
    actions: {
      setIncludePlannedIncome,
      setIncludePlannedExpense,
      setMonthsToProject,
      setStartMonthOffset,
    },
  };
}
