import { describe, it, expect } from 'vitest';
import { calculateCreditCardBills } from '../../utils/creditCardUtils';
import type { Transaction } from '../../types';
import { TransactionType, PaymentMethod } from '../../enums/FinanceEnums';

describe('creditCardUtils', () => {
  it('should calculate monthly bills based on credit card transactions with installments', () => {
    const transactions: Transaction[] = [
      { id: '1', description: 'TV', amount: 1200, date: '2026-05-10', paymentMethod: PaymentMethod.CREDIT, type: TransactionType.EXPENSE, installments: 3 },
      { id: '2', description: 'Groceries', amount: 300, date: '2026-06-15', paymentMethod: PaymentMethod.CREDIT, type: TransactionType.EXPENSE, installments: 1 },
      { id: '3', description: 'Pix Payment', amount: 100, date: '2026-05-15', paymentMethod: PaymentMethod.PIX, type: TransactionType.EXPENSE, installments: 1 }
    ];

    const mockDate = new Date('2026-06-20T12:00:00Z');
    const result = calculateCreditCardBills(transactions, mockDate);

    expect(result.length).toBe(12);

    // Current month is index 3 (since we start at -3)
    // 1200 TV in May with 3 installments -> Jun(400), Jul(400), Aug(400)
    // 300 Groceries in Jun with 1 installment -> Jul(300)
    // Pix Payment -> ignored

    const junData = result[3].data; // Jun 2026
    expect(result[3].key).toBe('2026-06');
    expect(junData.total).toBe(400); // 1st installment of TV
    expect(junData.items.length).toBe(1);
    expect(junData.items[0].description).toBe('TV');

    const julData = result[4].data; // Jul 2026
    expect(julData.total).toBe(700); // 2nd installment of TV (400) + 1st of Groceries (300)
    expect(julData.items.length).toBe(2);

    const augData = result[5].data; // Aug 2026
    expect(augData.total).toBe(400); // 3rd installment of TV (400)
    expect(augData.items.length).toBe(1);

    const sepData = result[6].data; // Sep 2026
    expect(sepData.total).toBe(0); // None
  });
});
