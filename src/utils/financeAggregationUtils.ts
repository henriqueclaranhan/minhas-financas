import { PaymentMethod, TransactionType } from '../enums/FinanceEnums';
import type { CompetenceEntry } from '../types';

export interface FinanceAggregate {
  income: number;
  expense: number;
  creditExpense: number;
  directExpense: number;
  byMonth: Record<string, { income: number; expense: number }>;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
}

export function aggregateCompetenceEntries(entries: CompetenceEntry[]): FinanceAggregate {
  const aggregate: FinanceAggregate = {
    income: 0,
    expense: 0,
    creditExpense: 0,
    directExpense: 0,
    byMonth: {},
    byCategory: {},
    byPaymentMethod: {},
  };

  for (const entry of entries) {
    const month = entry.competenceDate.slice(0, 7);
    const monthBucket = aggregate.byMonth[month] ?? (aggregate.byMonth[month] = { income: 0, expense: 0 });
    if (entry.type === TransactionType.INCOME) {
      aggregate.income += entry.amount;
      monthBucket.income += entry.amount;
      continue;
    }
    aggregate.expense += entry.amount;
    monthBucket.expense += entry.amount;
    if (entry.paymentMethod === PaymentMethod.CREDIT) aggregate.creditExpense += entry.amount;
    else aggregate.directExpense += entry.amount;
    const category = entry.category ?? 'others';
    aggregate.byCategory[category] = (aggregate.byCategory[category] ?? 0) + entry.amount;
    aggregate.byPaymentMethod[entry.paymentMethod] = (aggregate.byPaymentMethod[entry.paymentMethod] ?? 0) + entry.amount;
  }

  return aggregate;
}
