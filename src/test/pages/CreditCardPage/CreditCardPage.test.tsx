import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CreditCardPage } from '../../../pages/CreditCardPage/CreditCardPage';
import { useCreditCardViewModel } from '../../../pages/CreditCardPage/hooks/useCreditCardViewModel';
import { FinanceEntryMode, TemporalFilterMode } from '../../../enums/UIEnums';

vi.mock('../../../pages/CreditCardPage/hooks/useCreditCardViewModel');

// Mock ResizeObserver for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe('CreditCardPage UI', () => {
  const mockActions = {
    setSelectedMonthIndex: vi.fn(),
    setIsModalOpen: vi.fn(),
    setActionType: vi.fn(),
    handleTransactionAdd: vi.fn(),
    handlePlanningAdd: vi.fn(),
    temporal: {
      open: vi.fn(), apply: vi.fn(), reset: vi.fn(), matchesDate: vi.fn(), setIsOpen: vi.fn(),
      setTempMode: vi.fn(), setTempMonth: vi.fn(), setTempYear: vi.fn(), setTempStartDate: vi.fn(), setTempEndDate: vi.fn()
    }
  };

  const mockState = {
    temporal: {
      mode: TemporalFilterMode.YEAR, month: 4, year: 2026, startDate: '2026-01-01', endDate: '2026-12-31',
      tempMode: TemporalFilterMode.YEAR, tempMonth: 4, tempYear: 2026, tempStartDate: '2026-01-01', tempEndDate: '2026-12-31',
      isOpen: false, label: 'Ano todo, 2026', defaultYear: 2026
    },
    isModalOpen: false,
    actionType: FinanceEntryMode.NONE,
    nextMonths: [
      { key: '2026-05', labelFull: 'Maio 2026', labelShort: 'MAI', data: { total: 0, items: [] }, index: 0 },
      { key: '2026-06', labelFull: 'Junho 2026', labelShort: 'JUN', data: { total: 0, items: [] }, index: 1 },
      { key: '2026-07', labelFull: 'Julho 2026', labelShort: 'JUL', data: { total: 0, items: [] }, index: 2 },
      { key: '2026-08', labelFull: 'Agosto 2026', labelShort: 'AGO', data: { total: 0, items: [] }, index: 3 },
      { key: '2026-09', labelFull: 'Setembro 2026', labelShort: 'SET', data: { total: 100, items: [{ id: '1', description: 'Netflix', amount: 100, date: '2026-08-15', paymentMethod: 'Cartão de Crédito', type: 'expense', installments: 1, installmentNumber: 1, installmentValue: 100 }] }, index: 4 }
    ],
    selectedMonthIndex: 4,
    selectedMonthData: {
      key: '2026-09',
      labelFull: 'Setembro 2026',
      labelShort: 'SET',
      data: {
        total: 100,
        items: [{ id: '1', description: 'Netflix', amount: 100, date: '2026-08-15', paymentMethod: 'Cartão de Crédito', type: 'expense', installments: 1, installmentNumber: 1, installmentValue: 100 }]
      },
      index: 4
    },
    isCurrentInvoice: true
  };

  beforeEach(() => {
    vi.mocked(useCreditCardViewModel).mockReturnValue({
      state: mockState,
      actions: mockActions
    } as any);
    
    // Mock scrollRef
    window.HTMLElement.prototype.scrollTo = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders page header and current invoice', () => {
    renderWithRouter(<CreditCardPage />);
    
    expect(screen.getByText('Faturas e previsões')).toBeInTheDocument();
    expect(screen.getByText('Setembro 2026')).toBeInTheDocument();
    
    // Total
    const allText = document.body.textContent;
    expect(allText).toMatch(/100,00/);
    
    // Item
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    vi.mocked(useCreditCardViewModel).mockReturnValue({
      state: {
        ...mockState,
        selectedMonthData: {
          ...mockState.selectedMonthData,
          data: { total: 0, items: [] }
        }
      },
      actions: mockActions
    } as any);

    renderWithRouter(<CreditCardPage />);
    expect(screen.getByText('Nenhuma compra no crédito para este mês.')).toBeInTheDocument();
  });

  it('aligns the current invoice month to the left on mobile', async () => {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get: () => 600,
    });

    renderWithRouter(<CreditCardPage />);

    await waitFor(() => {
      expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
        left: 480,
        behavior: 'auto',
      });
    });
  });
});
