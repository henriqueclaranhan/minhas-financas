import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentMethod, TransactionType } from '../../../enums/FinanceEnums';
import { useCategoryExpensesViewModel } from '../../../pages/CategoryExpensesPage/hooks/useCategoryExpensesViewModel';
import { useFinance } from '../../../store/FinanceContext';
import { useLocale } from '../../../store/LocaleContext';

vi.mock('../../../store/FinanceContext');
vi.mock('../../../store/LocaleContext');

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const currentMonthValue = String(currentMonth + 1).padStart(2, '0');
const alternateDate = new Date(currentYear, currentMonth - 1, 10);
const alternateYear = alternateDate.getFullYear();
const alternateMonth = alternateDate.getMonth();
const alternateMonthValue = String(alternateMonth + 1).padStart(2, '0');

describe('useCategoryExpensesViewModel', () => {
  beforeEach(() => {
    vi.mocked(useLocale).mockReturnValue({
      locale: 'pt-BR',
      formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
    } as any);
    vi.mocked(useFinance).mockReturnValue({
      transactions: [
        {
          id: 'current',
          description: 'Current expense',
          amount: 120,
          date: `${currentYear}-${currentMonthValue}-15`,
          installments: 1,
          paymentMethod: PaymentMethod.PIX,
          type: TransactionType.EXPENSE,
          category: 'food',
        },
        {
          id: 'alternate',
          description: 'Alternate month expense',
          amount: 300,
          date: `${alternateYear}-${alternateMonthValue}-10`,
          installments: 1,
          paymentMethod: PaymentMethod.PIX,
          type: TransactionType.EXPENSE,
          category: 'housing',
        },
      ],
    } as any);
  });

  it('defaults to the current month', () => {
    const { result } = renderHook(() => useCategoryExpensesViewModel());

    expect(result.current.state.filterMode).toBe('month');
    expect(result.current.state.selectedMonth).toBe(currentMonth);
    expect(result.current.state.selectedYear).toBe(currentYear);
    expect(result.current.state.categoryData.map((item) => item.category)).toEqual(['food']);
    expect(result.current.state.topCategory?.category).toBe('food');
    expect(result.current.state.secondCategory).toBeUndefined();
    expect(result.current.state.totalExpense).toBe(120);
  });

  it('applies another month and resets to the current month', () => {
    const { result } = renderHook(() => useCategoryExpensesViewModel());

    act(() => {
      result.current.actions.setTempSelectedMonth(alternateMonth);
      result.current.actions.setTempSelectedYear(alternateYear);
    });
    act(() => result.current.actions.handleApplyFilters());

    expect(result.current.state.categoryData.map((item) => item.category)).toEqual(['housing']);
    expect(result.current.state.totalExpense).toBe(300);

    act(() => result.current.actions.handleResetFilters());

    expect(result.current.state.selectedMonth).toBe(currentMonth);
    expect(result.current.state.categoryData.map((item) => item.category)).toEqual(['food']);
  });

  it('applies a valid custom range', () => {
    const { result } = renderHook(() => useCategoryExpensesViewModel());

    act(() => result.current.actions.setTempFilterMode('range'));
    act(() => {
      result.current.actions.setTempStartDateValue(`${alternateYear}-${alternateMonthValue}-01`);
      result.current.actions.setTempEndDateValue(`${alternateYear}-${alternateMonthValue}-28`);
    });
    act(() => result.current.actions.handleApplyFilters());

    expect(result.current.state.filterMode).toBe('range');
    expect(result.current.state.categoryData.map((item) => item.category)).toEqual(['housing']);
  });

  it('keeps the modal open and reports an invalid range', () => {
    const { result } = renderHook(() => useCategoryExpensesViewModel());

    act(() => result.current.actions.handleOpenFilters());
    act(() => result.current.actions.setTempFilterMode('range'));
    act(() => {
      result.current.actions.setTempStartDateValue(`${currentYear}-02-01`);
      result.current.actions.setTempEndDateValue(`${currentYear}-01-01`);
    });
    act(() => result.current.actions.handleApplyFilters());

    expect(result.current.state.filterErrorKey).toBe('categoryExpenses.invalidRange');
    expect(result.current.state.isFilterModalOpen).toBe(true);
    expect(result.current.state.filterMode).toBe('month');
  });
});
