import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { TransactionsPage } from '../../../pages/TransactionsPage/TransactionsPage';
import { useTransactionsViewModel } from '../../../pages/TransactionsPage/hooks/useTransactionsViewModel';
import { PaymentMethod } from '../../../enums/FinanceEnums';
import { TemporalFilterMode } from '../../../enums/UIEnums';

vi.mock('../../../pages/TransactionsPage/hooks/useTransactionsViewModel');

describe('TransactionsPage UI', () => {
  const mockActions = {
    temporal: {
      open: vi.fn(), apply: vi.fn(), reset: vi.fn(), matchesDate: vi.fn(), setIsOpen: vi.fn(),
      setTempMode: vi.fn(), setTempMonth: vi.fn(), setTempYear: vi.fn(), setTempStartDate: vi.fn(), setTempEndDate: vi.fn()
    },
    setFilter: vi.fn(),
    setSearchQuery: vi.fn(),
    openNewModal: vi.fn(),
    handleOpenFilters: vi.fn(),
    setIsModalOpen: vi.fn(),
    setIsFilterModalOpen: vi.fn(),
    setTempMethodFilter: vi.fn(),
    setTempCategoryFilter: vi.fn(),
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
    temporal: {
      mode: TemporalFilterMode.MONTH, month: 4, year: 2026, startDate: '2026-05-01', endDate: '2026-05-31',
      tempMode: TemporalFilterMode.MONTH, tempMonth: 4, tempYear: 2026, tempStartDate: '2026-05-01', tempEndDate: '2026-05-31',
      isOpen: false, label: 'Maio de 2026', defaultYear: 2026
    },
    transactions: [
      { id: '1', description: 'Mercado', amount: 150, type: 'expense', date: '2026-05-10', paymentMethod: PaymentMethod.CREDIT, installments: 3 }
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
    categoryFilter: 'all',
    tempMethodFilter: 'all',
    tempCategoryFilter: 'all',
    tempSelectedMonth: 4,
    tempSelectedYear: 2026,
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
    
    expect(screen.getByText('Histórico de transações')).toBeInTheDocument();
    
    const allText = document.body.textContent;
    expect(allText).toMatch(/1\.000,00/);
    expect(allText).toMatch(/150,00/);
  });

  it('renders transactions in the table', () => {
    renderWithRouter(<TransactionsPage />);
    expect(screen.getAllByText('Mercado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Crédito').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3x de R$ 50,00').length).toBeGreaterThan(0);
  });

  it('calls openNewModal when clicking Nova transação', () => {
    renderWithRouter(<TransactionsPage />);
    const buttons = screen.getAllByRole('button');
    const newTxButton = buttons.find(b => b.textContent?.includes('Nova transação'));
    
    if (newTxButton) {
      fireEvent.click(newTxButton);
    }
    
    expect(mockActions.openNewModal).toHaveBeenCalled();
  });

  it('renders the category filter in the filters modal', () => {
    vi.mocked(useTransactionsViewModel).mockReturnValue({
      state: { ...mockState, isFilterModalOpen: true },
      actions: mockActions
    } as any);

    renderWithRouter(<TransactionsPage />);

    expect(screen.getByText('Categoria', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByText('Todas as categorias')).toBeInTheDocument();
  });
});
