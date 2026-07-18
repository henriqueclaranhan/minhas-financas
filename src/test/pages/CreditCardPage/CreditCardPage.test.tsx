import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CreditCardPage } from '../../../pages/CreditCardPage/CreditCardPage';
import { useCreditCardViewModel } from '../../../pages/CreditCardPage/hooks/useCreditCardViewModel';

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
    setSelectedMonthIndex: vi.fn()
  };

  const mockState = {
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
});
