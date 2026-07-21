import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTransactionsViewModel } from '../../pages/TransactionsPage/hooks/useTransactionsViewModel';
import { usePlannedExpensesViewModel } from '../../pages/PlannedExpensesPage/hooks/usePlannedExpensesViewModel';
import { useFinance } from '../../store/FinanceContext';
import { useAuth } from '../../store/AuthContext';
import { useLocale } from '../../store/LocaleContext';
import { expandPlannedExpenses, expandTransactions } from '../../utils/financeUtils';

vi.mock('../../store/FinanceContext');
vi.mock('../../store/AuthContext');
vi.mock('../../store/LocaleContext');
vi.mock('../../utils/financeUtils');

const noop = vi.fn();
const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
const currentDate = `${currentYear}-${currentMonth}-15`;

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('category filters in list view models', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: null } as any);
    vi.mocked(useLocale).mockReturnValue({
      locale: 'pt-BR',
      t: (key: string) => key
    } as any);
    vi.mocked(expandTransactions).mockImplementation((items) => items as any);
    vi.mocked(expandPlannedExpenses).mockImplementation((items) => items as any);
  });

  it('applies and resets the transaction category filter', () => {
    const transactions = [
      { id: 'food', description: 'Market', amount: 100, type: 'expense', date: currentDate, paymentMethod: 'pix', category: 'food' },
      { id: 'home', description: 'Rent', amount: 900, type: 'expense', date: currentDate, paymentMethod: 'pix', category: 'housing' }
    ];

    vi.mocked(useFinance).mockReturnValue({
      transactions,
      plannedExpenses: [],
      addTransaction: noop,
      updateTransaction: noop,
      deleteTransaction: noop
    } as any);

    const { result } = renderHook(() => useTransactionsViewModel(), { wrapper });

    act(() => result.current.actions.setTempCategoryFilter('food'));
    act(() => result.current.actions.handleApplyFilters());

    expect(result.current.state.transactions.map(item => item.id)).toEqual(['food']);
    expect(result.current.state.categoryFilter).toBe('food');

    act(() => result.current.actions.handleResetFilters());

    expect(result.current.state.transactions).toHaveLength(2);
    expect(result.current.state.categoryFilter).toBe('all');
  });

  it('lists original credit purchases while preserving competence-based totals', () => {
    const transactions = [
      {
        id: 'credit',
        description: 'Notebook',
        amount: 900,
        type: 'expense',
        date: currentDate,
        paymentMethod: 'credit',
        category: 'other',
        installments: 3
      },
      {
        id: 'pix',
        description: 'Market',
        amount: 100,
        type: 'expense',
        date: currentDate,
        paymentMethod: 'pix',
        category: 'food',
        installments: 1
      }
    ];

    vi.mocked(expandTransactions).mockReturnValue([transactions[1]] as any);
    vi.mocked(useFinance).mockReturnValue({
      transactions,
      plannedExpenses: [],
      addTransaction: noop,
      updateTransaction: noop,
      deleteTransaction: noop
    } as any);

    const { result } = renderHook(() => useTransactionsViewModel(), { wrapper });

    expect(result.current.state.transactions.map(item => item.id)).toEqual(['credit', 'pix']);
    expect(result.current.state.transactions[0]).toMatchObject({
      id: 'credit',
      amount: 900,
      date: currentDate,
      installments: 3
    });
    expect(result.current.state.totalExpense).toBe(100);
  });

  it('applies and resets the planned expense category filter', () => {
    const plannedExpenses = [
      { id: 'food', description: 'Market', amount: 100, type: 'expense', dueDate: `${currentYear}-08-15`, status: 'pending', category: 'food' },
      { id: 'home', description: 'Rent', amount: 900, type: 'expense', dueDate: `${currentYear}-09-15`, status: 'pending', category: 'housing' }
    ];

    vi.mocked(useFinance).mockReturnValue({
      transactions: [],
      plannedExpenses,
      addPlannedExpense: noop,
      updatePlannedExpense: noop,
      confirmPlannedExpense: noop,
      rejectPlannedExpense: noop,
      deletePlannedExpense: noop
    } as any);

    const { result } = renderHook(() => usePlannedExpensesViewModel(), { wrapper });

    act(() => result.current.actions.setTempCategoryFilter('housing'));
    act(() => result.current.actions.handleApplyFilters());

    expect(result.current.state.pendingExpenses.map(item => item.id)).toEqual(['home']);
    expect(result.current.state.categoryFilter).toBe('housing');

    act(() => result.current.actions.handleResetFilters());

    expect(result.current.state.pendingExpenses).toHaveLength(2);
    expect(result.current.state.categoryFilter).toBe('all');
  });
});
