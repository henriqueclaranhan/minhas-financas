import { useState, useMemo, useCallback, useEffect } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { calculateCreditCardBillsFromEntries } from '../../../utils/creditCardUtils';
import { useLocale } from '../../../store/LocaleContext';
import type { PlannedExpense, Transaction } from '../../../types';
import { FinanceEntryMode, type FinanceEntryMode as FinanceEntryModeValue } from '../../../enums/UIEnums';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { addMonths, endOfMonth, endOfYear, format, parseISO, startOfMonth, startOfYear } from 'date-fns';
import { useCompetenceEntries } from '../../../hooks/useCompetenceEntries';

export function useCreditCardViewModel() {
  const { transactions, addTransaction, addPlannedExpense, isLoading: isFinanceLoading } = useFinance();
  const { locale } = useLocale();
  const temporal = useTemporalFilter(TemporalFilterMode.YEAR);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<FinanceEntryModeValue>(FinanceEntryMode.NONE);

  const { mode, month, year, startDate: rangeStart, endDate: rangeEnd } = temporal.state;
  const interval = useMemo(() => {
    if (mode === TemporalFilterMode.MONTH) {
      const date = new Date(year, month, 1);
      return { start: startOfMonth(date), end: endOfMonth(date) };
    }
    if (mode === TemporalFilterMode.YEAR) {
      const date = new Date(year, 0, 1);
      return { start: startOfYear(date), end: endOfYear(date) };
    }
    return { start: parseISO(rangeStart), end: parseISO(rangeEnd) };
  }, [mode, month, rangeEnd, rangeStart, year]);

  const { entries: competenceEntries, isLoading: isCompetenceLoading } = useCompetenceEntries(
    format(interval.start, 'yyyy-MM-dd'),
    format(interval.end, 'yyyy-MM-dd'),
    transactions,
  );
  const nextMonths = useMemo(() => {
    return calculateCreditCardBillsFromEntries(competenceEntries, interval, locale);
  }, [competenceEntries, locale, interval]);

  const currentInvoiceKey = format(addMonths(new Date(), 1), 'yyyy-MM');

  useEffect(() => {
    const currentIndex = nextMonths.findIndex(item => item.key === currentInvoiceKey);
    setSelectedMonthIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [currentInvoiceKey, nextMonths]);

  const selectedMonthData = nextMonths[selectedMonthIndex];
  const isCurrentInvoice = selectedMonthData?.key === currentInvoiceKey;

  const handleTransactionAdd = useCallback(async (data: Omit<Transaction, 'id'>) => {
    await addTransaction(data);
    setIsModalOpen(false);
    setTimeout(() => setActionType(FinanceEntryMode.NONE), 300);
  }, [addTransaction]);

  const handlePlanningAdd = useCallback(async (data: Omit<PlannedExpense, 'id'>) => {
    await addPlannedExpense(data);
    setIsModalOpen(false);
    setTimeout(() => setActionType(FinanceEntryMode.NONE), 300);
  }, [addPlannedExpense]);

  return {
    state: {
      nextMonths,
      selectedMonthIndex,
      selectedMonthData,
      isCurrentInvoice,
      isModalOpen,
      actionType,
      temporal: temporal.state,
      isLoading: isFinanceLoading || isCompetenceLoading,
    },
    actions: {
      setSelectedMonthIndex,
      setIsModalOpen,
      setActionType,
      handleTransactionAdd,
      handlePlanningAdd,
      temporal: temporal.actions,
    }
  };
}
