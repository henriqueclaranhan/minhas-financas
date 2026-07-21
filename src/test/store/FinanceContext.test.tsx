import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceProvider, useFinance } from '../../store/FinanceContext';
import { TransactionService } from '../../services/TransactionService';

const { success, error } = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('../../store/AuthContext', () => ({ useAuth: () => ({ user: { uid: 'user-1' } }) }));
vi.mock('../../store/LocaleContext', () => ({ useLocale: () => ({ t: (key: string) => key }) }));
vi.mock('../../store/ToastContext', () => ({ useToast: () => ({ success, error, dismiss: vi.fn() }) }));
vi.mock('../../services/TransactionService', () => ({
  TransactionService: {
    subscribeToTransactions: vi.fn((_uid, onUpdate) => {
      onUpdate([]);
      return vi.fn();
    }),
    addTransaction: vi.fn(),
  },
}));
vi.mock('../../services/PlannedExpenseService', () => ({
  PlannedExpenseService: {
    subscribeToPlannedExpenses: vi.fn((_uid, onUpdate) => {
      onUpdate([]);
      return vi.fn();
    }),
  },
}));
vi.mock('../../services/UserService', () => ({
  UserService: {
    subscribeToInitialBalance: vi.fn((_uid, onUpdate) => {
      onUpdate(0);
      return vi.fn();
    }),
  },
}));
vi.mock('../../services/DataSyncService', () => ({ DataSyncService: {} }));

function FinanceHarness() {
  const { addTransaction } = useFinance();
  const submit = () => void addTransaction({
    description: 'Groceries', amount: 100, paymentMethod: 'pix', installments: 1,
    date: '2026-07-21', type: 'expense',
  }).catch(() => undefined);
  return (
    <div>
      <button onClick={submit}>Create transaction</button>
    </div>
  );
}

describe('FinanceContext mutation feedback', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows action-specific success feedback after the write resolves', async () => {
    vi.mocked(TransactionService.addTransaction).mockResolvedValue('transaction-1');
    render(<FinanceProvider><FinanceHarness /></FinanceProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Create transaction' }));

    await waitFor(() => expect(success).toHaveBeenCalledWith('notifications.transactionCreated'));
    expect(error).not.toHaveBeenCalled();
  });

  it('shows error feedback when the write rejects', async () => {
    vi.mocked(TransactionService.addTransaction).mockRejectedValue(new Error('offline'));
    render(<FinanceProvider><FinanceHarness /></FinanceProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Create transaction' }));

    await waitFor(() => expect(error).toHaveBeenCalledWith('notifications.saveFailed'));
    expect(success).not.toHaveBeenCalled();
  });

});
