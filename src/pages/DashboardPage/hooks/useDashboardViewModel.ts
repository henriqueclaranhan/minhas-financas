import { useState, useMemo } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { useAuth } from '../../../store/AuthContext';
import { calculateProjections } from '../../../utils/projectionUtils';
import { useLocale } from '../../../store/LocaleContext';
import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { formatCompetenceCategoryTotals } from '../../../utils/categoryExpenseUtils';
import type { PlannedExpense, Transaction } from '../../../types';
import { FinanceEntryMode, type FinanceEntryMode as FinanceEntryModeValue } from '../../../enums/UIEnums';
import { useCompetenceEntries } from '../../../hooks/useCompetenceEntries';
import { aggregateCompetenceEntries } from '../../../utils/financeAggregationUtils';
import { PaymentMethod, TransactionType } from '../../../enums/FinanceEnums';

export function useDashboardViewModel() {
  const { initialBalance, transactions, plannedExpenses, addTransaction, addPlannedExpense } = useFinance();
  const { user } = useAuth();
  const { locale } = useLocale();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<FinanceEntryModeValue>(FinanceEntryMode.NONE);

  const hasData = transactions.length > 0 || plannedExpenses.length > 0;
  const resolvedInitialBalance = initialBalance ?? 0;
  const projectionEnd = useMemo(() => endOfMonth(addMonths(new Date(), 4)), []);
  const { entries: competenceEntries } = useCompetenceEntries(
    '0001-01-01',
    format(projectionEnd, 'yyyy-MM-dd'),
    transactions,
  );
  const competenceAggregate = useMemo(
    () => aggregateCompetenceEntries(competenceEntries),
    [competenceEntries],
  );

  const chartData = useMemo(() => {
    return calculateProjections({
      transactions,
      plannedExpenses,
      initialBalance: resolvedInitialBalance,
      startDate: startOfMonth(addMonths(new Date(), -1)),
      endDate: projectionEnd,
      locale,
      competenceEntries,
      competenceAggregate,
    });
  }, [competenceAggregate, competenceEntries, plannedExpenses, projectionEnd, resolvedInitialBalance, locale, transactions]);

  const currentInvoice = useMemo(() => {
    const currentInvoiceKey = format(addMonths(new Date(), 1), 'yyyy-MM');
    return competenceEntries.reduce((total, entry) => (
      entry.type === TransactionType.EXPENSE
      && entry.paymentMethod === PaymentMethod.CREDIT
      && entry.competenceDate.startsWith(currentInvoiceKey)
        ? total + entry.amount
        : total
    ), 0);
  }, [competenceEntries]);

  const handleTransactionAdd = async (data: Omit<Transaction, 'id'>) => {
    await addTransaction(data);
    setIsModalOpen(false);
    setActionType(FinanceEntryMode.NONE);
  };

  const handlePlanningAdd = async (data: Omit<PlannedExpense, 'id'>) => {
    await addPlannedExpense(data);
    setIsModalOpen(false);
    setActionType(FinanceEntryMode.NONE);
  };

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';

  const expensesByCategory = useMemo(() => {
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const currentMonthEntries = competenceEntries.filter(entry => entry.competenceDate.startsWith(currentMonthKey));
    return formatCompetenceCategoryTotals(aggregateCompetenceEntries(currentMonthEntries).byCategory);
  }, [competenceEntries]);

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
