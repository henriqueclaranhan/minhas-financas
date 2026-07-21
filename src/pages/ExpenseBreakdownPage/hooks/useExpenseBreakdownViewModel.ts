import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PaymentMethod, TransactionType } from '../../../enums/FinanceEnums';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { useFinance } from '../../../store/FinanceContext';
import type { CompetenceEntry, Transaction } from '../../../types';
import {
  buildExpenseBreakdownPath,
  getExpenseBreakdownIsoPeriod,
  parseExpenseBreakdownPeriod,
} from '../../../utils/expenseBreakdownUtils';
import { useCompetenceEntries } from '../../../hooks/useCompetenceEntries';
import { aggregateCompetenceEntries } from '../../../utils/financeAggregationUtils';

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
  entry: CompetenceEntry,
): ExpenseBreakdownItem {
  return {
    id: entry.id ?? `${entry.description}-${entry.competenceDate}`,
    originalId: entry.transactionId,
    description: entry.description,
    amount: entry.amount,
    competenceDate: entry.competenceDate,
    originalDate: entry.originalDate,
    paymentMethod: entry.paymentMethod,
    category: entry.category,
    installmentNumber: entry.installmentNumber,
    totalInstallments: entry.totalInstallments,
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

  const period = getExpenseBreakdownIsoPeriod(activePeriod);
  const { entries: competenceEntries } = useCompetenceEntries(period.startDate, period.endDate, transactions);

  const items = useMemo(() => {
    return competenceEntries
      .filter(entry => entry.type === TransactionType.EXPENSE)
      .map(entry => toBreakdownItem(entry))
      .sort((a, b) => b.competenceDate.localeCompare(a.competenceDate));
  }, [competenceEntries]);

  const creditInstallments = useMemo(
    () => items.filter(item => item.paymentMethod === PaymentMethod.CREDIT),
    [items],
  );
  const payments = useMemo(
    () => items.filter(item => item.paymentMethod !== PaymentMethod.CREDIT),
    [items],
  );
  const aggregate = useMemo(() => aggregateCompetenceEntries(competenceEntries), [competenceEntries]);
  const paymentsTotal = aggregate.directExpense;
  const creditTotal = aggregate.creditExpense;
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
