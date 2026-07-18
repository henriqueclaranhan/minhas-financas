import { addMonths, parseISO, format } from 'date-fns';
import type { Transaction, PlannedExpense } from '../types';
import { PaymentMethod } from '../enums/FinanceEnums';

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

export function expandTransactions(transactions: Transaction[]): ExpandedTransaction[] {
  const expanded: ExpandedTransaction[] = [];
  
  for (const t of transactions) {
    if (t.installments && t.installments > 1) {
      const parsedDate = parseISO(t.date);
      const installmentAmount = t.amount / t.installments;
      const isCredit = t.paymentMethod === PaymentMethod.CREDIT;
      
      for (let i = 1; i <= t.installments; i++) {
        const offset = isCredit ? i : (i - 1);
        const nextDate = addMonths(parsedDate, offset);
        expanded.push({
          ...t,
          date: format(nextDate, 'yyyy-MM-dd'),
          amount: installmentAmount,
          isInstallment: true,
          installmentNumber: i,
          totalInstallments: t.installments,
          originalAmount: t.amount,
          originalId: t.id,
          id: `${t.id}-inst-${i}`
        });
      }
    } else {
      expanded.push(t);
    }
  }
  
  return expanded;
}

export function expandPlannedExpenses(expenses: PlannedExpense[]): ExpandedPlannedExpense[] {
  const expanded: ExpandedPlannedExpense[] = [];
  
  for (const p of expenses) {
    if (p.installments && p.installments > 1) {
      const parsedDate = parseISO(p.dueDate);
      const installmentAmount = p.amount / p.installments;
      const isCredit = p.paymentMethod === PaymentMethod.CREDIT;
      
      for (let i = 1; i <= p.installments; i++) {
        const offset = isCredit ? i : (i - 1);
        const nextDate = addMonths(parsedDate, offset);
        expanded.push({
          ...p,
          dueDate: format(nextDate, 'yyyy-MM-dd'),
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
      expanded.push(p);
    }
  }
  
  return expanded;
}
