import { useState, useMemo, useCallback } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { calculateCreditCardBills } from '../../../utils/creditCardUtils';
import { useLocale } from '../../../store/LocaleContext';

export function useCreditCardViewModel() {
  const { transactions, addTransaction, addPlannedExpense } = useFinance();
  const { locale } = useLocale();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'none' | 'transaction' | 'planning'>('none');

  const nextMonths = useMemo(() => {
    return calculateCreditCardBills(transactions, new Date(), locale);
  }, [transactions, locale]);

  const selectedMonthData = nextMonths[selectedMonthIndex];
  const isCurrentInvoice = selectedMonthIndex === 4; 

  const handleTransactionAdd = useCallback(async (data: any) => {
    try {
      await addTransaction(data);
      setIsModalOpen(false);
      setTimeout(() => setActionType('none'), 300);
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  }, [addTransaction]);

  const handlePlanningAdd = useCallback(async (data: any) => {
    try {
      await addPlannedExpense(data);
      setIsModalOpen(false);
      setTimeout(() => setActionType('none'), 300);
    } catch (error) {
      console.error('Failed to add planned expense:', error);
    }
  }, [addPlannedExpense]);

  return {
    state: {
      nextMonths,
      selectedMonthIndex,
      selectedMonthData,
      isCurrentInvoice,
      isModalOpen,
      actionType
    },
    actions: {
      setSelectedMonthIndex,
      setIsModalOpen,
      setActionType,
      handleTransactionAdd,
      handlePlanningAdd
    }
  };
}
