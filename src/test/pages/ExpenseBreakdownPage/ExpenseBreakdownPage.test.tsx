import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PaymentMethod } from '../../../enums/FinanceEnums';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { ExpenseBreakdownPage } from '../../../pages/ExpenseBreakdownPage';
import { useExpenseBreakdownViewModel } from '../../../pages/ExpenseBreakdownPage/hooks/useExpenseBreakdownViewModel';

vi.mock('../../../pages/ExpenseBreakdownPage/hooks/useExpenseBreakdownViewModel');

describe('ExpenseBreakdownPage', () => {
  it('shows a reconciled total and the entries that compose it', () => {
    vi.mocked(useExpenseBreakdownViewModel).mockReturnValue({
      state: {
        payments: [{ id: 'pix', description: 'Mercado', amount: 100, competenceDate: '2026-07-12', originalDate: '2026-07-12', paymentMethod: PaymentMethod.PIX, installmentNumber: 1, totalInstallments: 1 }],
        creditInstallments: [{ id: 'credit-inst-1', description: 'Notebook', amount: 300, competenceDate: '2026-07-10', originalDate: '2026-06-10', paymentMethod: PaymentMethod.CREDIT, installmentNumber: 1, totalInstallments: 2 }],
        paymentsTotal: 100,
        creditTotal: 300,
        total: 400,
        paymentsShare: 25,
        filterLabel: 'Julho de 2026',
        temporal: {
          mode: TemporalFilterMode.MONTH, month: 6, year: 2026, startDate: '2026-07-01', endDate: '2026-07-31',
          tempMode: TemporalFilterMode.MONTH, tempMonth: 6, tempYear: 2026, tempStartDate: '2026-07-01', tempEndDate: '2026-07-31',
          isOpen: false, defaultYear: 2026, label: 'Julho de 2026',
        },
      },
      actions: {
        temporal: {
          open: vi.fn(), apply: vi.fn(), reset: vi.fn(), matchesDate: vi.fn(), setIsOpen: vi.fn(),
          setTempMode: vi.fn(), setTempMonth: vi.fn(), setTempYear: vi.fn(), setTempStartDate: vi.fn(), setTempEndDate: vi.fn(),
        },
      },
    } as any);

    render(<BrowserRouter><ExpenseBreakdownPage /></BrowserRouter>);

    expect(screen.getByRole('heading', { level: 1, name: 'Composição das saídas' })).toBeInTheDocument();
    expect(screen.getByText('Julho de 2026')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 400,00').length).toBeGreaterThan(0);
    expect(screen.getByText('Mercado')).toBeInTheDocument();
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    expect(screen.getByText('Parcela 1 de 2 · compra em 10/06/2026')).toBeInTheDocument();
  });

  it('starts both mobile ledgers open and collapses them independently', () => {
    const previousWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });

    render(<BrowserRouter><ExpenseBreakdownPage /></BrowserRouter>);

    const paymentsToggle = screen.getByRole('button', { name: 'Recolher Pagamentos no período' });
    expect(paymentsToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Recolher Parcelas de cartão' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(paymentsToggle);

    expect(screen.getByText('Mercado').closest('.expense-ledger-content')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expandir Pagamentos no período' })).toHaveAttribute('aria-expanded', 'false');

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth });
  });
});
