import { useState, useMemo } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { useAuth } from '../../../store/AuthContext';
import { calculateProjections } from '../../../utils/projectionUtils';
import { useLocale } from '../../../store/LocaleContext';
import { TransactionType, PaymentMethod } from '../../../enums/FinanceEnums';
import { parseISO, isSameMonth, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { calculateCreditCardBills } from '../../../utils/creditCardUtils';

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
      startDate: startOfMonth(addMonths(new Date(), -1)),
      endDate: endOfMonth(addMonths(new Date(), 4)),
      locale
    });
  }, [transactions, plannedExpenses, resolvedInitialBalance, locale]);

  const currentInvoice = useMemo(() => {
    const bills = calculateCreditCardBills(transactions, new Date(), locale);
    return bills[4]?.data.total || 0; // Index 4 is the next month (which acts as the current open invoice for the user)
  }, [transactions, locale]);

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

  const expensesByCategory = useMemo(() => {
    const currentDate = new Date();
    const categoryTotals: Record<string, number> = {};
    
    let totalExpense = 0;
    transactions.forEach(t => {
      const type = t.type || TransactionType.EXPENSE;
      if (type === TransactionType.EXPENSE) {
        const txDate = parseISO(t.date);
        const isCredit = t.paymentMethod === PaymentMethod.CREDIT;
        const isBoleto = t.paymentMethod === PaymentMethod.BOLETO;
        const cat = t.category || 'others';
        
        if (isCredit || isBoleto) {
          const numInstallments = t.installments || 1;
          const instAmount = t.amount / numInstallments;
          for (let i = 1; i <= numInstallments; i++) {
            const offset = isCredit ? i : (i - 1);
            if (isSameMonth(addMonths(txDate, offset), currentDate)) {
              categoryTotals[cat] = (categoryTotals[cat] || 0) + instAmount;
              totalExpense += instAmount;
            }
          }
        } else if (isSameMonth(txDate, currentDate)) {
          categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
          totalExpense += t.amount;
        }
      }
    });

    // Premium colors for the pie chart
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1]) // highest first
      .map(([name, value], index) => ({
        name: `categories.${name}`,
        value,
        color: colors[index % colors.length],
        percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0
      }));
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
