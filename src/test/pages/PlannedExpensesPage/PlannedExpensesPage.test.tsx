import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlannedExpensesPage } from '../../../pages/PlannedExpensesPage/PlannedExpensesPage';
import { usePlannedExpensesViewModel } from '../../../pages/PlannedExpensesPage/hooks/usePlannedExpensesViewModel';

vi.mock('../../../pages/PlannedExpensesPage/hooks/usePlannedExpensesViewModel');

describe('PlannedExpensesPage UI', () => {
  const mockActions = {
    setFilter: vi.fn(),
    setSearchQuery: vi.fn(),
    setIsModalOpen: vi.fn(),
    setIsFilterModalOpen: vi.fn(),
    setTempSelectedMonth: vi.fn(),
    setTempSelectedYear: vi.fn(),
    setExpenseToDelete: vi.fn(),
    setExpenseToConfirm: vi.fn(),
    setEditingExpense: vi.fn(),
    handleAddOrUpdate: vi.fn(),
    openNewModal: vi.fn(),
    openEditModal: vi.fn(),
    handleOpenFilters: vi.fn(),
    handleApplyFilters: vi.fn(),
    handleResetFilters: vi.fn(),
    confirmDelete: vi.fn(),
    confirmAction: vi.fn(),
    rejectAction: vi.fn(),
    handleConfirmPrompt: vi.fn(),
    handleDeletePrompt: vi.fn()
  };

  const mockState = {
    pendingExpenses: [
      { id: '1', description: 'Aluguel', amount: 1500, type: 'expense', dueDate: '2026-05-10', paymentMethod: 'Pix' }
    ],
    totalIncome: 0,
    totalExpense: 1500,
    isModalOpen: false,
    isFilterModalOpen: false,
    filter: 'all',
    searchQuery: '',
    selectedMonth: 4,
    selectedYear: 2026,
    tempSelectedMonth: 4,
    tempSelectedYear: 2026,
    editingExpense: null,
    expenseToDelete: null,
    expenseToConfirm: null,
    filterLabel: 'Maio de 2026',
    defaultYear: 2026
  };

  beforeEach(() => {
    vi.mocked(usePlannedExpensesViewModel).mockReturnValue({
      state: mockState,
      actions: mockActions
    } as any);
  });

  it('renders page header and summary cards correctly', () => {
    render(<PlannedExpensesPage />);
    
    expect(screen.getByText('Planejamento')).toBeInTheDocument();
    
    const allText = document.body.textContent;
    expect(allText).toMatch(/1\.500,00/);
  });

  it('renders expenses in the table', () => {
    render(<PlannedExpensesPage />);
    expect(screen.getAllByText('Aluguel').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pix').length).toBeGreaterThan(0);
  });

  it('calls openNewModal when clicking Planejar', () => {
    render(<PlannedExpensesPage />);
    const buttons = screen.getAllByRole('button');
    const newPlanButton = buttons.find(b => b.textContent?.includes('Planejar'));
    
    if (newPlanButton) {
      fireEvent.click(newPlanButton);
    }
    
    expect(mockActions.openNewModal).toHaveBeenCalled();
  });
});
