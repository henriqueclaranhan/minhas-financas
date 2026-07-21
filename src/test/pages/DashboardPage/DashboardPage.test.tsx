import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../../../pages/DashboardPage/DashboardPage';
import { useDashboardViewModel } from '../../../pages/DashboardPage/hooks/useDashboardViewModel';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../pages/DashboardPage/hooks/useDashboardViewModel');

describe('DashboardPage UI', () => {
  const mockActions = {
    setIsModalOpen: vi.fn(),
    setActionType: vi.fn(),
    handleTransactionAdd: vi.fn(),
    handlePlanningAdd: vi.fn()
  };

  const mockState = {
    initialBalance: 0,
    hasData: true,
    resolvedInitialBalance: 0,
    userName: 'Henrique',
    isModalOpen: false,
    actionType: 'none',
    chartData: {
      data: [
        { name: 'MAI/26', saldo: 1000, income: 1000, expense: 0 }
      ],
      currentBalance: 1000,
      monthlyIncome: 1000,
      monthlyExpense: 0
    },
    expensesByCategory: []
  };

  beforeEach(() => {
    vi.mocked(useDashboardViewModel).mockReturnValue({
      state: mockState,
      actions: mockActions
    } as any);
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders page header and summary correctly', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Olá, Henrique!')).toBeInTheDocument();
    
    const allText = document.body.textContent;
    expect(allText).toMatch(/1\.000,00/);
    expect(screen.getByRole('link', { name: /Saldo atual/i })).toHaveAttribute('href', '/transactions');
    expect(screen.getByRole('link', { name: /Receitas do mês/i })).toHaveAttribute('href', '/transactions');
    expect(screen.getByRole('link', { name: /Despesas do mês/i })).toHaveAttribute('href', '/expenses/breakdown');
    expect(screen.getByRole('link', { name: /Fatura atual/i })).toHaveAttribute('href', '/credit');
    expect(document.querySelectorAll('.summary-cards-container .summary-card-navigation-arrow')).toHaveLength(4);
    expect(screen.queryByText('Ver composição')).not.toBeInTheDocument();
  });

  it('calls openNewModal when clicking Nova ação', () => {
    renderWithRouter(<DashboardPage />);
    const buttons = screen.getAllByRole('button');
    const newActionButton = buttons.find(b => b.textContent?.includes('Nova ação'));
    
    if (newActionButton) {
      fireEvent.click(newActionButton);
    }
    
    expect(mockActions.setIsModalOpen).toHaveBeenCalledWith(true);
    expect(mockActions.setActionType).toHaveBeenCalledWith('none');
  });

  it('renders category icons in the expenses legend', () => {
    vi.mocked(useDashboardViewModel).mockReturnValue({
      state: {
        ...mockState,
        expensesByCategory: [
          { name: 'categories.food', value: 150, color: '#6366f1', percentage: 100 }
        ]
      },
      actions: mockActions
    } as any);

    const { container } = renderWithRouter(<DashboardPage />);

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(container.querySelector('.pie-legend-item .lucide-utensils')).toBeInTheDocument();
    expect(container.querySelector('.category-details-link')).toHaveAttribute('href', '/categories');
  });

  it('shows structural loading without temporary financial values', () => {
    vi.mocked(useDashboardViewModel).mockReturnValue({
      state: { ...mockState, isLoading: true },
      actions: mockActions,
    } as any);

    renderWithRouter(<DashboardPage />);

    expect(screen.getByRole('status', { name: 'Carregando conteúdo financeiro' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Saldo atual/i })).not.toBeInTheDocument();
  });
});
