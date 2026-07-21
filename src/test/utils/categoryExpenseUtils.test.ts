import { describe, expect, it } from 'vitest';
import { PaymentMethod, TransactionType } from '../../enums/FinanceEnums';
import type { Transaction } from '../../types';
import { calculateExpensesByCategory } from '../../utils/categoryExpenseUtils';

const transaction = (overrides: Partial<Transaction>): Transaction => ({
  id: 'transaction',
  description: 'Expense',
  amount: 100,
  date: '2026-01-15',
  installments: 1,
  paymentMethod: PaymentMethod.PIX,
  type: TransactionType.EXPENSE,
  category: 'food',
  ...overrides,
});

describe('calculateExpensesByCategory', () => {
  it('groups expenses in an inclusive interval and sorts by value', () => {
    const result = calculateExpensesByCategory({
      transactions: [
        transaction({ id: 'food', amount: 100, category: 'food', date: '2026-02-01' }),
        transaction({ id: 'home', amount: 300, category: 'housing', date: '2026-02-28' }),
        transaction({ id: 'outside', amount: 500, category: 'health', date: '2026-03-01' }),
        transaction({ id: 'income', amount: 900, category: 'salary', date: '2026-02-10', type: TransactionType.INCOME }),
      ],
      startDate: new Date(2026, 1, 1),
      endDate: new Date(2026, 1, 28),
    });

    expect(result.map(({ category, value }) => ({ category, value }))).toEqual([
      { category: 'housing', value: 300 },
      { category: 'food', value: 100 },
    ]);
    expect(result[0].percentage).toBe(75);
    expect(result[1].percentage).toBe(25);
  });

  it('groups transactions without a category under others', () => {
    const result = calculateExpensesByCategory({
      transactions: [transaction({ category: undefined })],
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 31),
    });

    expect(result[0]).toMatchObject({
      category: 'others',
      name: 'categories.others',
      value: 100,
      percentage: 100,
    });
  });

  it('starts credit installments next month and boleto installments in the current month', () => {
    const result = calculateExpensesByCategory({
      transactions: [
        transaction({
          id: 'credit',
          amount: 200,
          installments: 2,
          category: 'shopping',
          paymentMethod: PaymentMethod.CREDIT,
        }),
        transaction({
          id: 'boleto',
          amount: 300,
          installments: 2,
          category: 'housing',
          paymentMethod: PaymentMethod.BOLETO,
        }),
      ],
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 31),
    });

    expect(result.map(({ category, value }) => ({ category, value }))).toEqual([
      { category: 'housing', value: 150 },
    ]);

    const februaryResult = calculateExpensesByCategory({
      transactions: [
        transaction({ amount: 200, installments: 2, category: 'shopping', paymentMethod: PaymentMethod.CREDIT }),
        transaction({ amount: 300, installments: 2, category: 'housing', paymentMethod: PaymentMethod.BOLETO }),
      ],
      startDate: new Date(2026, 1, 1),
      endDate: new Date(2026, 1, 28),
    });

    expect(februaryResult.map(({ category, value }) => ({ category, value }))).toEqual([
      { category: 'housing', value: 150 },
      { category: 'shopping', value: 100 },
    ]);
  });

  it('returns an empty result when the interval has no expenses', () => {
    const result = calculateExpensesByCategory({
      transactions: [],
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 31),
    });

    expect(result).toEqual([]);
  });
});
