import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpenseStatus, PaymentMethod, TransactionType } from '../../../enums/FinanceEnums';
import { useExpenseBreakdownViewModel } from '../../../pages/ExpenseBreakdownPage/hooks/useExpenseBreakdownViewModel';
import { useFinance } from '../../../store/FinanceContext';

vi.mock('../../../store/FinanceContext');

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/expenses/breakdown?mode=month&year=2026&month=7']}>
    {children}
  </MemoryRouter>
);

describe('useExpenseBreakdownViewModel', () => {
  beforeEach(() => {
    vi.mocked(useFinance).mockReturnValue({
      transactions: [
        { id: 'credit', description: 'Notebook', amount: 600, date: '2026-06-10', paymentMethod: PaymentMethod.CREDIT, type: TransactionType.EXPENSE, installments: 2 },
        { id: 'pix', description: 'Market', amount: 100, date: '2026-07-12', paymentMethod: PaymentMethod.PIX, type: TransactionType.EXPENSE, installments: 1 },
        { id: 'boleto', description: 'Course', amount: 200, date: '2026-06-05', paymentMethod: PaymentMethod.BOLETO, type: TransactionType.EXPENSE, installments: 2 },
        { id: 'income', description: 'Salary', amount: 5000, date: '2026-07-01', paymentMethod: PaymentMethod.PIX, type: TransactionType.INCOME, installments: 1 },
      ],
    } as any);
  });

  it('reconciles direct payments and credit installments for the selected competence month', () => {
    const { result } = renderHook(() => useExpenseBreakdownViewModel(), { wrapper });

    expect(result.current.state.payments.map(item => item.description)).toEqual(['Market', 'Course']);
    expect(result.current.state.creditInstallments).toHaveLength(1);
    expect(result.current.state.creditInstallments[0]).toMatchObject({
      description: 'Notebook',
      amount: 300,
      installmentNumber: 1,
      totalInstallments: 2,
      originalDate: '2026-06-10',
      competenceDate: '2026-07-10',
    });
    expect(result.current.state.paymentsTotal).toBe(200);
    expect(result.current.state.creditTotal).toBe(300);
    expect(result.current.state.total).toBe(500);
    expect(result.current.state.paymentsShare).toBe(40);
  });

  it('reconciles filtered one-time and recurring plans for the planning context', () => {
    vi.mocked(useFinance).mockReturnValue({
      transactions: [],
      plannedExpenses: [
        { id: 'one-time', description: 'Market', amount: 150, dueDate: '2026-07-12', isRecurring: false, recurrenceInterval: 1, status: ExpenseStatus.PENDING, type: TransactionType.EXPENSE, paymentMethod: PaymentMethod.PIX, category: 'food' },
        { id: 'recurring', description: 'Market subscription', amount: 50, dueDate: '2026-07-05', isRecurring: true, recurrenceInterval: 1, status: ExpenseStatus.PENDING, type: TransactionType.EXPENSE, paymentMethod: PaymentMethod.PIX, category: 'food' },
        { id: 'ignored', description: 'Rent', amount: 900, dueDate: '2026-07-10', isRecurring: false, recurrenceInterval: 1, status: ExpenseStatus.PENDING, type: TransactionType.EXPENSE, paymentMethod: PaymentMethod.PIX, category: 'housing' },
      ],
    } as any);
    const planningWrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/planned/breakdown?mode=month&year=2026&month=7&search=market&category=food&method=pix']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useExpenseBreakdownViewModel('planned'), { wrapper: planningWrapper });

    expect(result.current.state.groups.map(group => [group.key, group.total])).toEqual([
      ['oneTime', 150],
      ['recurring', 50],
    ]);
    expect(result.current.state.total).toBe(200);
  });
});
