import { useState, useMemo } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { useAuth } from '../../../store/AuthContext';
import { calculateProjections } from '../../../utils/projectionUtils';
import { useLocale } from '../../../store/LocaleContext';

export function useDashboardViewModel() {
  const { initialBalance, transactions, plannedExpenses, addTransaction, addPlannedExpense } = useFinance();
  const { user } = useAuth();
  const { locale } = useLocale();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'none' | 'transaction' | 'planning'>('none');

  const hasData = transactions.length > 0 || plannedExpenses.length > 0;
  const resolvedInitialBalance = initialBalance ?? 0;

  const chartData = useMemo(() => {
    return calculateProjections({
      transactions,
      plannedExpenses,
      initialBalance: resolvedInitialBalance,
      startMonthOffset: -1, // Dashboard rule: 1 past month
      monthsToProject: 6,    // 1 past + current + 4 future
      locale
    });
  }, [transactions, plannedExpenses, resolvedInitialBalance, locale]);

  const handleTransactionAdd = (data: any) => {
    addTransaction(data);
    setIsModalOpen(false);
    setActionType('none');
  };

  const handlePlanningAdd = (data: any) => {
    addPlannedExpense(data);
    setIsModalOpen(false);
    setActionType('none');
  };

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';

  return {
    state: {
      initialBalance,
      hasData,
      resolvedInitialBalance,
      userName,
      isModalOpen,
      actionType,
      chartData
    },
    actions: {
      setIsModalOpen,
      setActionType,
      handleTransactionAdd,
      handlePlanningAdd
    }
  };
}
