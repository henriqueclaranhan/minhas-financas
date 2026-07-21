import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../../services/TransactionService';
import { getDocs, writeBatch } from 'firebase/firestore';
import { PaymentMethod, TransactionType } from '../../enums/FinanceEnums';

const { transactionMock } = vi.hoisted(() => ({
  transactionMock: { get: vi.fn(), set: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

// Mock Firebase config
vi.mock('../../config/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ path: 'transactions' })),
  doc: vi.fn((...args: unknown[]) => ({ id: args.length === 1 ? 'tx123' : args.at(-1), path: String(args.at(-1) ?? 'tx123') })),
  getDocs: vi.fn(),
  runTransaction: vi.fn(async (_db, callback) => callback(transactionMock)),
  writeBatch: vi.fn(() => ({ set: vi.fn(), update: vi.fn(), delete: vi.fn(), commit: vi.fn() })),
  query: vi.fn(ref => ref),
  where: vi.fn(),
  orderBy: vi.fn(),
  documentId: vi.fn(),
  startAfter: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn()
}));

describe('TransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.get.mockResolvedValue({ exists: () => true, data: () => mockTransaction });
  });

  const mockUid = 'user123';
  const mockTransaction = {
    description: 'Test',
    amount: 100,
    date: '2026-01-01',
    paymentMethod: PaymentMethod.PIX,
    type: TransactionType.EXPENSE,
    installments: 1
  };

  it('should add a transaction successfully', async () => {
    const result = await TransactionService.addTransaction(mockUid, mockTransaction);
    
    expect(writeBatch).toHaveBeenCalled();
    expect(result).toBe('tx123');
  });

  it('removes undefined optional fields before creating a transaction', async () => {
    await TransactionService.addTransaction(mockUid, { ...mockTransaction, category: undefined });

    const batch = vi.mocked(writeBatch).mock.results[0].value as any;
    expect(batch.set).toHaveBeenCalledWith(expect.anything(), mockTransaction);
  });

  it('should throw error if uid is missing when adding', async () => {
    await expect(TransactionService.addTransaction('', mockTransaction)).rejects.toThrow('User ID is required');
  });

  it('returns a cursor for a full lazy-loaded history page', async () => {
    const docs = Array.from({ length: TransactionService.HISTORY_PAGE_SIZE }, (_, index) => ({
      id: `tx-${index}`,
      data: () => ({ ...mockTransaction, date: '2026-01-01' }),
    }));
    vi.mocked(getDocs).mockResolvedValue({ docs } as any);

    const page = await TransactionService.getHistoryPage(mockUid, { startDate: '2026-01-01', endDate: '2026-12-31' });

    expect(page.hasMore).toBe(true);
    expect(page.transactions).toHaveLength(TransactionService.HISTORY_PAGE_SIZE);
    expect(page.cursor).toEqual({ date: '2026-01-01', id: 'tx-39' });
  });

  it('should update a transaction successfully', async () => {
    await TransactionService.updateTransaction(mockUid, 'tx123', { amount: 200 });
    
    expect(transactionMock.update).toHaveBeenCalled();
  });

  it('removes client IDs and undefined fields before updating', async () => {
    await TransactionService.updateTransaction(mockUid, 'tx123', {
      id: 'client-only', category: undefined, description: 'Updated',
    });

    expect(transactionMock.update).toHaveBeenCalledWith(expect.anything(), { description: 'Updated' });
  });

  it('should delete a transaction successfully', async () => {
    await TransactionService.deleteTransaction(mockUid, 'tx123');
    
    expect(transactionMock.delete).toHaveBeenCalledTimes(2);
  });

});
