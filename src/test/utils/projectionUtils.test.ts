import { describe, it, expect } from 'vitest';
import { calculateProjections } from '../../utils/projectionUtils';
import { TransactionType, ExpenseStatus, PaymentMethod } from '../../enums/FinanceEnums';
import type { Transaction, PlannedExpense } from '../../types';

describe('projectionUtils', () => {
  it('should calculate projection accurately for 6 months', () => {
    const transactions: Transaction[] = [
      { id: '1', description: 'Salary', amount: 5000, date: '2026-05-01', paymentMethod: 'Pix', type: TransactionType.INCOME, installments: 1 },
      { id: '2', description: 'Groceries', amount: 1000, date: '2026-05-15', paymentMethod: 'Débito', type: TransactionType.EXPENSE, installments: 1 }
    ];
    const plannedExpenses: PlannedExpense[] = [
      { id: 'p1', description: 'Internet', amount: 150, dueDate: '2026-06-10', paymentMethod: 'Pix', type: TransactionType.EXPENSE, status: ExpenseStatus.PENDING, installments: 1, isRecurring: true, recurrenceInterval: 1 }
    ];
    
    // currentDate mock to 2026-05-20
    const mockDate = new Date('2026-05-20T12:00:00Z');

    const result = calculateProjections({
      transactions,
      plannedExpenses,
      initialBalance: 1000,
      startDate: new Date('2026-04-01T12:00:00Z'),
      endDate: new Date('2026-09-30T12:00:00Z'),
      currentDate: mockDate
    });

    expect(result.data.length).toBe(6);
    expect(result.monthlyIncome).toBe(5000);
    expect(result.monthlyExpense).toBe(1000);
    
    // Initial: 1000. Apr: 0 flow => 1000.
    // May: +5000 - 1000 = +4000 => 5000.
    expect(result.currentBalance).toBe(5000);

    // Jun: -150 => 4850
    // Jul: -150 => 4700
    // Aug: -150 => 4550
    // Sep: -150 => 4400
    
    expect(result.data[0].saldo).toBe(1000); // Apr
    expect(result.data[1].saldo).toBe(5000); // May
    expect(result.data[2].saldo).toBe(4850); // Jun
    expect(result.data[5].saldo).toBe(4400); // Sep
  });

  it('should project correctly for Boleto and Credit installments', () => {
    const transactions: Transaction[] = [
      { id: '1', description: 'Credit', amount: 300, date: '2026-05-01', paymentMethod: PaymentMethod.CREDIT, type: TransactionType.EXPENSE, installments: 3 }, // May 1st -> Jun, Jul, Aug
      { id: '2', description: 'Boleto', amount: 300, date: '2026-05-05', paymentMethod: PaymentMethod.BOLETO, type: TransactionType.EXPENSE, installments: 3 }  // May 5th -> May, Jun, Jul
    ];
    
    const mockDate = new Date('2026-05-20T12:00:00Z');

    const result = calculateProjections({
      transactions,
      plannedExpenses: [],
      initialBalance: 2000,
      startDate: new Date('2026-05-01T12:00:00Z'),
      endDate: new Date('2026-08-31T12:00:00Z'),
      currentDate: mockDate
    });

    expect(result.data.length).toBe(4);
    
    // May: Boleto (100) -> 1900
    expect(result.data[0].saldo).toBe(1900);
    
    // Jun: Boleto (100) + Credit (100) -> 1700
    expect(result.data[1].saldo).toBe(1700);

    // Jul: Boleto (100) + Credit (100) -> 1500
    expect(result.data[2].saldo).toBe(1500);

    // Aug: Credit (100) -> 1400
    expect(result.data[3].saldo).toBe(1400);
  });

  it('keeps the recurrence anchor after a shorter month', () => {
    const result = calculateProjections({
      transactions: [],
      plannedExpenses: [{
        id: 'month-end', description: 'Month end', amount: 100, dueDate: '2026-01-31',
        paymentMethod: PaymentMethod.PIX, type: TransactionType.EXPENSE, status: ExpenseStatus.PENDING,
        installments: 1, isRecurring: true, recurrenceInterval: 1, recurrenceDay: 31,
      }],
      initialBalance: 1000,
      startDate: new Date('2026-02-01T12:00:00Z'),
      endDate: new Date('2026-04-30T12:00:00Z'),
      currentDate: new Date('2026-01-15T12:00:00Z'),
    });

    expect(result.data.map(month => month.expense)).toEqual([100, 100, 100]);
  });
});
