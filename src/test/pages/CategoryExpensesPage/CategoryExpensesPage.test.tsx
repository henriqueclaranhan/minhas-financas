import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryExpensesPage } from '../../../pages/CategoryExpensesPage';
import { useCategoryExpensesViewModel } from '../../../pages/CategoryExpensesPage/hooks/useCategoryExpensesViewModel';

vi.mock('../../../pages/CategoryExpensesPage/hooks/useCategoryExpensesViewModel');

const actions = {
  setTempFilterMode: vi.fn(),
  setTempSelectedMonth: vi.fn(),
  setTempSelectedYear: vi.fn(),
  setTempStartDate: vi.fn(),
  setTempEndDate: vi.fn(),
  handleOpenFilters: vi.fn(),
  handleCloseFilters: vi.fn(),
  handleApplyFilters: vi.fn(),
  handleResetFilters: vi.fn(),
  setTempStartDateValue: vi.fn(),
  setTempEndDateValue: vi.fn(),
};

const baseState = {
  categoryData: [
    {
      category: 'food',
      name: 'categories.food',
      value: 250,
      color: '#6366f1',
      percentage: 100,
    },
  ],
  topCategory: {
    category: 'food',
    name: 'categories.food',
    value: 250,
    color: '#6366f1',
    percentage: 100,
  },
  secondCategory: undefined,
  totalExpense: 250,
  formattedTotalExpense: 'R$ 250,00',
  filterMode: 'month',
  selectedMonth: 6,
  selectedYear: 2026,
  startDate: new Date(2026, 6, 1),
  endDate: new Date(2026, 6, 31),
  periodLabel: 'Julho 2026',
  isFilterModalOpen: false,
  tempFilterMode: 'month',
  tempSelectedMonth: 6,
  tempSelectedYear: 2026,
  tempStartDate: new Date(2026, 6, 1),
  tempEndDate: new Date(2026, 6, 31),
  filterErrorKey: null,
  defaultYear: 2026,
  startDateValue: '2026-07-01',
  endDateValue: '2026-07-31',
  formatCurrency: (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`,
};

describe('CategoryExpensesPage', () => {
  beforeEach(() => {
    vi.mocked(useCategoryExpensesViewModel).mockReturnValue({ state: baseState, actions } as any);
  });

  const renderPage = () => render(
    <BrowserRouter>
      <CategoryExpensesPage />
    </BrowserRouter>,
  );

  it('renders the current period, total, chart, and ranked breakdown', () => {
    const { container } = renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Gastos por categoria' })).toBeInTheDocument();
    expect(screen.getByText('Julho 2026')).toBeInTheDocument();
    expect(container.querySelectorAll('.category-summary-card')).toHaveLength(3);
    expect(screen.getByText('Categoria com mais gastos')).toBeInTheDocument();
    expect(screen.getByText('2ª categoria com mais gastos')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 250,00')).toHaveLength(4);
    expect(screen.getAllByText('Alimentação')).toHaveLength(3);
    expect(container.querySelector('.category-expenses-item .lucide-utensils')).toBeInTheDocument();
    expect(container.querySelector('.pie-chart-panel-expanded')).toBeInTheDocument();
  });

  it('renders the empty state when the period has no expenses', () => {
    vi.mocked(useCategoryExpensesViewModel).mockReturnValue({
      state: { ...baseState, categoryData: [], totalExpense: 0, formattedTotalExpense: 'R$ 0,00' },
      actions,
    } as any);

    renderPage();

    expect(screen.getByText('Nenhum gasto encontrado no período selecionado.')).toBeInTheDocument();
  });

  it('renders the month filter controls when the modal is open', () => {
    vi.mocked(useCategoryExpensesViewModel).mockReturnValue({
      state: { ...baseState, isFilterModalOpen: true },
      actions,
    } as any);

    renderPage();

    expect(screen.getByText('Filtrar por')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mês' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Período' })).toBeInTheDocument();
  });
});
