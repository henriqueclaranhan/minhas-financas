import { describe, it, expect } from 'vitest';
import { expandTransactions, expandPlannedExpenses } from '../../utils/financeUtils';
import { TransactionType, ExpenseStatus, PaymentMethod } from '../../enums/FinanceEnums';
import type { Transaction, PlannedExpense } from '../../types';

describe('financeUtils', () => {
  describe('expandTransactions', () => {
    it('should expand a transaction with installments into multiple items (Credit starts next month)', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          description: 'TV',
          amount: 1000,
          date: '2026-01-15',
          paymentMethod: PaymentMethod.CREDIT,
          type: TransactionType.EXPENSE,
          installments: 10,
        }
      ];

      const expanded = expandTransactions(transactions);

      expect(expanded.length).toBe(10);
      
      expect(expanded[0].amount).toBe(100);
      expect(expanded[0].date).toBe('2026-02-15'); // starts next month for credit
      expect(expanded[0].isInstallment).toBe(true);
      expect(expanded[0].installmentNumber).toBe(1);
      expect(expanded[0].originalAmount).toBe(1000);
      expect(expanded[0].originalId).toBe('1');
      expect(expanded[0].id).toBe('1-inst-1');

      expect(expanded[1].amount).toBe(100);
      expect(expanded[1].date).toBe('2026-03-15');
      expect(expanded[1].installmentNumber).toBe(2);
    });

    it('should expand a transaction with installments into multiple items (Boleto starts current month)', () => {
      const transactions: Transaction[] = [
        {
          id: 'b1',
          description: 'Lava-louças',
          amount: 1200,
          date: '2026-01-15',
          paymentMethod: PaymentMethod.BOLETO,
          type: TransactionType.EXPENSE,
          installments: 12,
        }
      ];

      const expanded = expandTransactions(transactions);

      expect(expanded.length).toBe(12);
      expect(expanded[0].amount).toBe(100);
      expect(expanded[0].date).toBe('2026-01-15'); // starts current month for Boleto
      expect(expanded[0].installmentNumber).toBe(1);

      expect(expanded[1].amount).toBe(100);
      expect(expanded[1].date).toBe('2026-02-15');
      expect(expanded[1].installmentNumber).toBe(2);
    });

    it('should not expand a transaction without installments', () => {
      const transactions: Transaction[] = [
        {
          id: '2',
          description: 'Lunch',
          amount: 50,
          date: '2026-01-15',
          paymentMethod: 'Débito',
          type: TransactionType.EXPENSE,
          installments: 1,
        }
      ];

      const expanded = expandTransactions(transactions);

      expect(expanded.length).toBe(1);
      expect(expanded[0].id).toBe('2');
      expect(expanded[0].isInstallment).toBeUndefined();
      expect(expanded[0].amount).toBe(50);
    });

    it('should move a single-installment credit expense to the next month', () => {
      const transactions: Transaction[] = [
        {
          id: 'credit-1',
          description: 'Groceries',
          amount: 300,
          date: '2026-07-10',
          paymentMethod: PaymentMethod.CREDIT,
          type: TransactionType.EXPENSE,
          installments: 1,
        }
      ];

      const expanded = expandTransactions(transactions);

      expect(expanded).toHaveLength(1);
      expect(expanded[0].date).toBe('2026-08-10');
      expect(expanded[0].amount).toBe(300);
      expect(expanded[0].isInstallment).toBe(false);
      expect(expanded[0].originalId).toBe('credit-1');
    });

    it('should keep a single-installment boleto expense in the current month', () => {
      const transactions: Transaction[] = [
        {
          id: 'boleto-1',
          description: 'Course',
          amount: 300,
          date: '2026-07-10',
          paymentMethod: PaymentMethod.BOLETO,
          type: TransactionType.EXPENSE,
          installments: 1,
        }
      ];

      const expanded = expandTransactions(transactions);

      expect(expanded).toHaveLength(1);
      expect(expanded[0].date).toBe('2026-07-10');
      expect(expanded[0].amount).toBe(300);
      expect(expanded[0].isInstallment).toBeUndefined();
    });
  });

  describe('expandPlannedExpenses', () => {
    it('should expand a planned expense with installments (Credit)', () => {
      const expenses: PlannedExpense[] = [
        {
          id: '3',
          description: 'Phone',
          amount: 1200,
          dueDate: '2026-05-10',
          paymentMethod: PaymentMethod.CREDIT,
          type: TransactionType.EXPENSE,
          installments: 12,
          isRecurring: false,
          recurrenceInterval: 1,
          status: ExpenseStatus.PENDING
        }
      ];

      const expanded = expandPlannedExpenses(expenses);

      expect(expanded.length).toBe(12);
      expect(expanded[0].dueDate).toBe('2026-06-10'); // Next month
      expect(expanded[0].amount).toBe(100);
      
      expect(expanded[11].dueDate).toBe('2027-05-10');
      expect(expanded[11].installmentNumber).toBe(12);
    });
    
    it('should expand a planned expense with installments (Boleto)', () => {
      const expenses: PlannedExpense[] = [
        {
          id: '4',
          description: 'Curso',
          amount: 600,
          dueDate: '2026-05-10',
          paymentMethod: PaymentMethod.BOLETO,
          type: TransactionType.EXPENSE,
          installments: 6,
          isRecurring: false,
          recurrenceInterval: 1,
          status: ExpenseStatus.PENDING
        }
      ];

      const expanded = expandPlannedExpenses(expenses);

      expect(expanded.length).toBe(6);
      expect(expanded[0].dueDate).toBe('2026-05-10'); // Current month
      expect(expanded[0].amount).toBe(100);
      
      expect(expanded[5].dueDate).toBe('2026-10-10');
      expect(expanded[5].installmentNumber).toBe(6);
    });
  });
});
