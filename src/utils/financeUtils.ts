import { addMonths, parseISO, format } from 'date-fns';
import type { Transaction, PlannedExpense } from '../types';
import { PaymentMethod, TransactionType } from '../enums/FinanceEnums';
import { addMonthsAtRecurrenceDay, resolveRecurrenceDay } from './recurrenceUtils';

export type ExpandedTransaction = Transaction & {
  isInstallment?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  originalAmount?: number;
  originalId?: string;
};

export type ExpandedPlannedExpense = PlannedExpense & {
  isInstallment?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  originalAmount?: number;
  originalId?: string;
};

interface IsoPeriod {
  startDate: string;
  endDate: string;
}

function intersectsPeriod(date: string, period?: IsoPeriod): boolean {
  return !period || (date >= period.startDate && date <= period.endDate);
}

export function expandTransactions(transactions: Transaction[], period?: IsoPeriod): ExpandedTransaction[] {
  const expanded: ExpandedTransaction[] = [];
  
  for (const t of transactions) {
    const installmentCount = t.installments || 1;
    const isCredit = t.paymentMethod === PaymentMethod.CREDIT;
    const isSingleInstallmentCreditExpense = isCredit
      && t.type !== TransactionType.INCOME
      && installmentCount === 1;

    if (installmentCount > 1 || isSingleInstallmentCreditExpense) {
      const parsedDate = parseISO(t.date);
      const installmentAmount = t.amount / installmentCount;
      
      for (let i = 1; i <= installmentCount; i++) {
        const offset = isCredit ? i : (i - 1);
        const nextDate = addMonths(parsedDate, offset);
        const installmentDate = format(nextDate, 'yyyy-MM-dd');
        if (!intersectsPeriod(installmentDate, period)) continue;
        expanded.push({
          ...t,
          date: installmentDate,
          amount: installmentAmount,
          isInstallment: installmentCount > 1,
          installmentNumber: i,
          totalInstallments: installmentCount,
          originalAmount: t.amount,
          originalId: t.id,
          id: `${t.id}-inst-${i}`
        });
      }
    } else {
      if (intersectsPeriod(t.date, period)) expanded.push(t);
    }
  }
  
  return expanded;
}

export function expandPlannedExpenses(expenses: PlannedExpense[], period?: IsoPeriod): ExpandedPlannedExpense[] {
  const expanded: ExpandedPlannedExpense[] = [];
  
  for (const p of expenses) {
    const sourceId = p.id ?? `${p.description}-${p.dueDate}`;
    const occurrenceDates = [p.dueDate];
    const recurrenceDay = p.isRecurring ? resolveRecurrenceDay(p.dueDate, p.recurrenceDay) : undefined;
    if (p.isRecurring && period) {
      occurrenceDates.length = 0;
      let occurrenceDate = parseISO(p.dueDate);
      while (format(occurrenceDate, 'yyyy-MM-dd') <= period.endDate) {
        occurrenceDates.push(format(occurrenceDate, 'yyyy-MM-dd'));
        occurrenceDate = addMonthsAtRecurrenceDay(occurrenceDate, p.recurrenceInterval || 1, recurrenceDay!);
      }
    }

    for (const occurrenceDate of occurrenceDates) {
      if (p.installments && p.installments > 1) {
        const parsedDate = parseISO(occurrenceDate);
        const installmentAmount = p.amount / p.installments;
        const isCredit = p.paymentMethod === PaymentMethod.CREDIT;

        for (let i = 1; i <= p.installments; i++) {
          const offset = isCredit ? i : (i - 1);
          const nextDate = addMonths(parsedDate, offset);
          const installmentDate = format(nextDate, 'yyyy-MM-dd');
          if (!intersectsPeriod(installmentDate, period)) continue;
          expanded.push({
            ...p,
            dueDate: installmentDate,
            amount: installmentAmount,
            isInstallment: true,
            installmentNumber: i,
            totalInstallments: p.installments,
            originalAmount: p.amount,
            originalId: p.id,
            recurrenceDay,
            id: p.isRecurring
              ? `${sourceId}-rec-${occurrenceDate}-inst-${i}`
              : `${sourceId}-inst-${i}`
          });
        }
      } else if (intersectsPeriod(occurrenceDate, period)) {
        expanded.push(p.isRecurring ? {
          ...p,
          dueDate: occurrenceDate,
          originalId: p.id,
          recurrenceDay,
          id: `${sourceId}-rec-${occurrenceDate}`,
        } : p);
      }
    }
  }
  
  return expanded;
}
