import { describe, expect, it } from 'vitest';
import { PaymentMethod, TransactionType } from '../../enums/FinanceEnums';
import type { CompetenceEntry } from '../../types';
import { aggregateCompetenceEntries } from '../../utils/financeAggregationUtils';

describe('aggregateCompetenceEntries', () => {
  it('builds all period buckets in one pass', () => {
    const entries: CompetenceEntry[] = [
      { transactionId: 'income', description: 'Salary', amount: 2000, competenceDate: '2026-07-01', originalDate: '2026-07-01', paymentMethod: PaymentMethod.PIX, type: TransactionType.INCOME, installmentNumber: 1, totalInstallments: 1 },
      { transactionId: 'credit', description: 'Card', amount: 300, competenceDate: '2026-07-10', originalDate: '2026-06-10', paymentMethod: PaymentMethod.CREDIT, type: TransactionType.EXPENSE, category: 'shopping', installmentNumber: 1, totalInstallments: 2 },
      { transactionId: 'pix', description: 'Market', amount: 100, competenceDate: '2026-07-12', originalDate: '2026-07-12', paymentMethod: PaymentMethod.PIX, type: TransactionType.EXPENSE, category: 'food', installmentNumber: 1, totalInstallments: 1 },
    ];
    const aggregate = aggregateCompetenceEntries(entries);
    expect(aggregate).toMatchObject({ income: 2000, expense: 400, creditExpense: 300, directExpense: 100 });
    expect(aggregate.byMonth['2026-07']).toEqual({ income: 2000, expense: 400 });
    expect(aggregate.byCategory).toEqual({ shopping: 300, food: 100 });
  });
});
