import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../../services/TransactionService';
import { addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PaymentMethod, TransactionType } from '../../enums/FinanceEnums';

// Mock Firebase config
vi.mock('../../config/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(ref => ref),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn()
}));

describe('TransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    (addDoc as any).mockResolvedValueOnce({ id: 'tx123' });

    const result = await TransactionService.addTransaction(mockUid, mockTransaction);
    
    expect(addDoc).toHaveBeenCalled();
    expect(result).toBe('tx123');
  });

  it('removes undefined optional fields before creating a transaction', async () => {
    (addDoc as any).mockResolvedValueOnce({ id: 'tx123' });

    await TransactionService.addTransaction(mockUid, { ...mockTransaction, category: undefined });

    expect(addDoc).toHaveBeenCalledWith(undefined, mockTransaction);
  });

  it('should throw error if uid is missing when adding', async () => {
    await expect(TransactionService.addTransaction('', mockTransaction)).rejects.toThrow('User ID is required');
  });

  it('should update a transaction successfully', async () => {
    (updateDoc as any).mockResolvedValueOnce(undefined);

    await TransactionService.updateTransaction(mockUid, 'tx123', { amount: 200 });
    
    expect(updateDoc).toHaveBeenCalled();
  });

  it('removes client IDs and undefined fields before updating', async () => {
    (updateDoc as any).mockResolvedValueOnce(undefined);

    await TransactionService.updateTransaction(mockUid, 'tx123', {
      id: 'client-only', category: undefined, description: 'Updated',
    });

    expect(updateDoc).toHaveBeenCalledWith(undefined, { description: 'Updated' });
  });

  it('should delete a transaction successfully', async () => {
    (deleteDoc as any).mockResolvedValueOnce(undefined);

    await TransactionService.deleteTransaction(mockUid, 'tx123');
    
    expect(deleteDoc).toHaveBeenCalled();
  });

});
