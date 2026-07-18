import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { TransactionsPage } from '../../../pages/TransactionsPage/TransactionsPage';
import { useTransactionsViewModel } from '../../../pages/TransactionsPage/hooks/useTransactionsViewModel';

vi.mock('../../../pages/TransactionsPage/hooks/useTransactionsViewModel');

describe('TransactionsPage UI', () => {
  const mockActions = {
    setFilter: vi.fn(),
    setSearchQuery: vi.fn(),
    openNewModal: vi.fn(),
    handleOpenFilters: vi.fn(),
    setIsModalOpen: vi.fn(),
    setIsFilterModalOpen: vi.fn(),
    setTempMethodFilter: vi.fn(),
    setTempSelectedMonth: vi.fn(),
    setTempSelectedYear: vi.fn(),
    setTransactionToDelete: vi.fn(),
    setEditingTransaction: vi.fn(),
    handleAddOrUpdate: vi.fn(),
    openEditModal: vi.fn(),
    confirmDelete: vi.fn(),
    handleApplyFilters: vi.fn(),
    handleResetFilters: vi.fn()
  };

  const mockState = {
    transactions: [
      { id: '1', description: 'Mercado', amount: 150, type: 'expense', date: '2026-05-10', paymentMethod: 'Crédito' }
    ],
    totalIncome: 1000,
    totalExpense: 150,
    isModalOpen: false,
    isFilterModalOpen: false,
    filter: 'all',
    searchQuery: '',
    selectedMonth: 4,
    selectedYear: 2026,
    methodFilter: 'all',
    filterLabel: 'Maio de 2026',
    defaultYear: 2026
  };

  beforeEach(() => {
    vi.mocked(useTransactionsViewModel).mockReturnValue({
      state: mockState,
      actions: mockActions
    } as any);
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders page header and summary cards correctly', () => {
    renderWithRouter(<TransactionsPage />);
    
    expect(screen.getByText('Histórico de Transações')).toBeInTheDocument();
    
    const allText = document.body.textContent;
    expect(allText).toMatch(/1\.000,00/);
    expect(allText).toMatch(/150,00/);
  });

  it('renders transactions in the table', () => {
    renderWithRouter(<TransactionsPage />);
    expect(screen.getAllByText('Mercado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Crédito').length).toBeGreaterThan(0);
  });

  it('calls openNewModal when clicking Nova Transação', () => {
    renderWithRouter(<TransactionsPage />);
    const buttons = screen.getAllByRole('button');
    const newTxButton = buttons.find(b => b.textContent?.includes('Nova Transação'));
    
    if (newTxButton) {
      fireEvent.click(newTxButton);
    }
    
    expect(mockActions.openNewModal).toHaveBeenCalled();
  });
});
