import { addMonths, endOfDay, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { PaymentMethod, TransactionType } from '../enums/FinanceEnums';
import type { CompetenceEntry, Transaction } from '../types';
import { aggregateCompetenceEntries } from './financeAggregationUtils';

const CATEGORY_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export interface CategoryExpenseData {
  category: string;
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface CalculateExpensesByCategoryParams {
  transactions: Transaction[];
  startDate: Date;
  endDate: Date;
}

export function calculateExpensesByCategory({
  transactions,
  startDate,
  endDate,
}: CalculateExpensesByCategoryParams): CategoryExpenseData[] {
  const interval = {
    start: startOfDay(startDate),
    end: endOfDay(endDate),
  };
  const categoryTotals: Record<string, number> = {};

  const addExpense = (category: string, amount: number, accountingDate: Date) => {
    if (isWithinInterval(accountingDate, interval)) {
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    }
  };

  transactions.forEach((transaction) => {
    const type = transaction.type || TransactionType.EXPENSE;
    if (type !== TransactionType.EXPENSE) return;

    const transactionDate = parseISO(transaction.date);
    const category = transaction.category || 'others';
    const isCredit = transaction.paymentMethod === PaymentMethod.CREDIT;
    const isBoleto = transaction.paymentMethod === PaymentMethod.BOLETO;

    if (!isCredit && !isBoleto) {
      addExpense(category, transaction.amount, transactionDate);
      return;
    }

    const installments = transaction.installments || 1;
    const installmentAmount = transaction.amount / installments;

    for (let installment = 1; installment <= installments; installment += 1) {
      const offset = isCredit ? installment : installment - 1;
      addExpense(category, installmentAmount, addMonths(transactionDate, offset));
    }
  });

  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  return Object.entries(categoryTotals)
    .sort(([, firstValue], [, secondValue]) => secondValue - firstValue)
    .map(([category, value], index) => ({
      category,
      name: `categories.${category}`,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
}

export function calculateCompetenceExpensesByCategory(entries: CompetenceEntry[]): CategoryExpenseData[] {
  return formatCompetenceCategoryTotals(aggregateCompetenceEntries(entries).byCategory);
}

export function formatCompetenceCategoryTotals(categoryTotals: Record<string, number>): CategoryExpenseData[] {
  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  return Object.entries(categoryTotals)
    .sort(([, firstValue], [, secondValue]) => secondValue - firstValue)
    .map(([category, value], index) => ({
      category,
      name: `categories.${category}`,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
}
