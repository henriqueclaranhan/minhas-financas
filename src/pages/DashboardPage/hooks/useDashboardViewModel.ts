import { useState, useMemo } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { useAuth } from '../../../store/AuthContext';
import { calculateProjections } from '../../../utils/projectionUtils';
import { useLocale } from '../../../store/LocaleContext';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { calculateCreditCardBills } from '../../../utils/creditCardUtils';
import { calculateExpensesByCategory } from '../../../utils/categoryExpenseUtils';
import type { PlannedExpense, Transaction } from '../../../types';
import { FinanceEntryMode, type FinanceEntryMode as FinanceEntryModeValue } from '../../../enums/UIEnums';

export function useDashboardViewModel() {
  const { initialBalance, transactions, plannedExpenses, addTransaction, addPlannedExpense } = useFinance();
  const { user } = useAuth();
  const { locale } = useLocale();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<FinanceEntryModeValue>(FinanceEntryMode.NONE);

  const hasData = transactions.length > 0 || plannedExpenses.length > 0;
  const resolvedInitialBalance = initialBalance ?? 0;

  const chartData = useMemo(() => {
    return calculateProjections({
      transactions,
      plannedExpenses,
      initialBalance: resolvedInitialBalance,
      startDate: startOfMonth(addMonths(new Date(), -1)),
      endDate: endOfMonth(addMonths(new Date(), 4)),
      locale
    });
  }, [transactions, plannedExpenses, resolvedInitialBalance, locale]);

  const currentInvoice = useMemo(() => {
    const bills = calculateCreditCardBills(transactions, new Date(), locale);
    return bills[4]?.data.total || 0; // Index 4 is the next month (which acts as the current open invoice for the user)
  }, [transactions, locale]);

  const handleTransactionAdd = (data: Omit<Transaction, 'id'>) => {
    addTransaction(data);
    setIsModalOpen(false);
    setActionType(FinanceEntryMode.NONE);
  };

  const handlePlanningAdd = (data: Omit<PlannedExpense, 'id'>) => {
    addPlannedExpense(data);
    setIsModalOpen(false);
    setActionType(FinanceEntryMode.NONE);
  };

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';

  const expensesByCategory = useMemo(() => {
    const currentDate = new Date();
    return calculateExpensesByCategory({
      transactions,
      startDate: startOfMonth(currentDate),
      endDate: endOfMonth(currentDate),
    });
  }, [transactions]);

  return {
    state: {
      initialBalance,
      hasData,
      resolvedInitialBalance,
      userName,
      isModalOpen,
      actionType,
      chartData,
      expensesByCategory,
      currentInvoice
    },
    actions: {
      setIsModalOpen,
      setActionType,
      handleTransactionAdd,
      handlePlanningAdd
    }
  };
}
