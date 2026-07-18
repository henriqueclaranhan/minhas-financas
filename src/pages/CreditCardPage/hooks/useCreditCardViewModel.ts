import { useState, useMemo } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { calculateCreditCardBills } from '../../../utils/creditCardUtils';
import { useLocale } from '../../../store/LocaleContext';

export function useCreditCardViewModel() {
  const { transactions } = useFinance();
  const { locale } = useLocale();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4); // Default to index 4 (next month after current month, wait, is it? We start at -3, so index 3 is current month, index 4 is +1 month)

  const nextMonths = useMemo(() => {
    return calculateCreditCardBills(transactions, new Date(), locale);
  }, [transactions, locale]);

  const selectedMonthData = nextMonths[selectedMonthIndex];
  const isCurrentInvoice = selectedMonthIndex === 4; 

  return {
    state: {
      nextMonths,
      selectedMonthIndex,
      selectedMonthData,
      isCurrentInvoice
    },
    actions: {
      setSelectedMonthIndex
    }
  };
}
