import { addMonths, parseISO, format } from 'date-fns';
import type { Transaction, PlannedExpense } from '../types';
import { PaymentMethod, TransactionType } from '../enums/FinanceEnums';

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
    if (p.installments && p.installments > 1) {
      const parsedDate = parseISO(p.dueDate);
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
          id: `${p.id}-inst-${i}`
        });
      }
    } else {
      if (intersectsPeriod(p.dueDate, period)) expanded.push(p);
    }
  }
  
  return expanded;
}
