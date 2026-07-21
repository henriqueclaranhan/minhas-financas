import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PaymentMethod, TransactionType } from '../../../enums/FinanceEnums';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { useFinance } from '../../../store/FinanceContext';
import type { Transaction } from '../../../types';
import {
  buildExpenseBreakdownPath,
  getExpenseBreakdownIsoPeriod,
  parseExpenseBreakdownPeriod,
} from '../../../utils/expenseBreakdownUtils';
import { expandTransactions, type ExpandedTransaction } from '../../../utils/financeUtils';

export interface ExpenseBreakdownItem {
  id: string;
  originalId?: string;
  description: string;
  amount: number;
  competenceDate: string;
  originalDate: string;
  paymentMethod: Transaction['paymentMethod'];
  category?: string;
  installmentNumber: number;
  totalInstallments: number;
}

function toBreakdownItem(
  entry: ExpandedTransaction,
  originalTransactions: Map<string, Transaction>,
): ExpenseBreakdownItem {
  const originalId = entry.originalId ?? entry.id;
  const original = originalId ? originalTransactions.get(originalId) : undefined;

  return {
    id: entry.id ?? `${entry.description}-${entry.date}`,
    originalId,
    description: entry.description,
    amount: entry.amount,
    competenceDate: entry.date,
    originalDate: original?.date ?? entry.date,
    paymentMethod: entry.paymentMethod,
    category: entry.category,
    installmentNumber: entry.installmentNumber ?? 1,
    totalInstallments: entry.totalInstallments ?? entry.installments ?? 1,
  };
}

export function useExpenseBreakdownViewModel() {
  const { transactions } = useFinance();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPeriod = useRef(parseExpenseBreakdownPeriod(searchParams)).current;
  const temporal = useTemporalFilter(TemporalFilterMode.MONTH, initialPeriod);

  const activePeriod = useMemo(() => ({
    mode: temporal.state.mode,
    month: temporal.state.month,
    year: temporal.state.year,
    startDate: temporal.state.startDate,
    endDate: temporal.state.endDate,
  }), [
    temporal.state.endDate,
    temporal.state.mode,
    temporal.state.month,
    temporal.state.startDate,
    temporal.state.year,
  ]);

  useEffect(() => {
    const nextQuery = buildExpenseBreakdownPath(activePeriod).split('?')[1];
    if (searchParams.toString() !== nextQuery) setSearchParams(nextQuery, { replace: true });
  }, [activePeriod, searchParams, setSearchParams]);

  const items = useMemo(() => {
    const originals = new Map(
      transactions.filter(transaction => transaction.id).map(transaction => [transaction.id!, transaction]),
    );
    const period = getExpenseBreakdownIsoPeriod(activePeriod);

    return expandTransactions(transactions, period)
      .filter(transaction => transaction.type === TransactionType.EXPENSE)
      .map(transaction => toBreakdownItem(transaction, originals))
      .sort((a, b) => b.competenceDate.localeCompare(a.competenceDate));
  }, [activePeriod, transactions]);

  const creditInstallments = useMemo(
    () => items.filter(item => item.paymentMethod === PaymentMethod.CREDIT),
    [items],
  );
  const payments = useMemo(
    () => items.filter(item => item.paymentMethod !== PaymentMethod.CREDIT),
    [items],
  );
  const paymentsTotal = useMemo(() => payments.reduce((total, item) => total + item.amount, 0), [payments]);
  const creditTotal = useMemo(() => creditInstallments.reduce((total, item) => total + item.amount, 0), [creditInstallments]);
  const total = paymentsTotal + creditTotal;

  return {
    state: {
      payments,
      creditInstallments,
      paymentsTotal,
      creditTotal,
      total,
      paymentsShare: total > 0 ? (paymentsTotal / total) * 100 : 0,
      filterLabel: temporal.state.label,
      temporal: temporal.state,
    },
    actions: {
      temporal: temporal.actions,
    },
  };
}
