import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlannedExpenseService } from '../../services/PlannedExpenseService';
import { addDoc, updateDoc, deleteDoc, writeBatch, getDoc, onSnapshot } from 'firebase/firestore';
import { TransactionType, ExpenseStatus } from '../../enums/FinanceEnums';

vi.mock('../../config/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => {
  const batchMock = {
    update: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined)
  };
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDoc: vi.fn(),
    writeBatch: vi.fn(() => batchMock),
    onSnapshot: vi.fn((_ref, callback) => {
      callback({ forEach: vi.fn() });
      return vi.fn();
    })
  };
});

describe('PlannedExpenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUid = 'user123';
  const mockExpense = {
    description: 'Rent',
    amount: 1000,
    dueDate: '2026-05-10',
    paymentMethod: 'Pix',
    type: TransactionType.EXPENSE,
    status: ExpenseStatus.PENDING,
    installments: 1,
    isRecurring: true,
    recurrenceInterval: 1
  };

  it('should add a planned expense successfully', async () => {
    (addDoc as any).mockResolvedValueOnce({ id: 'pe123' });
    const result = await PlannedExpenseService.addPlannedExpense(mockUid, mockExpense);
    expect(addDoc).toHaveBeenCalled();
    expect(result).toBe('pe123');
  });

  it('should update a planned expense', async () => {
    (updateDoc as any).mockResolvedValueOnce(undefined);
    await PlannedExpenseService.updatePlannedExpense(mockUid, 'pe123', { amount: 1200 });
    expect(updateDoc).toHaveBeenCalled();
  });

  it('should delete a planned expense', async () => {
    (deleteDoc as any).mockResolvedValueOnce(undefined);
    await PlannedExpenseService.deletePlannedExpense(mockUid, 'pe123');
    expect(deleteDoc).toHaveBeenCalled();
  });

  it('subscribes to planned expenses', () => {
    const onUpdate = vi.fn();
    const unsub = PlannedExpenseService.subscribeToPlannedExpenses('user1', onUpdate);
    expect(onSnapshot).toHaveBeenCalled();
    expect(typeof unsub).toBe('function');
  });

  it('should confirm a planned expense and create recurrence if applicable', async () => {
    (getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      data: () => mockExpense
    });

    const mockTransactionData = {
      description: 'Rent',
      amount: 1000,
      date: '2026-05-10',
      paymentMethod: 'Pix',
      type: TransactionType.EXPENSE,
      installments: 1
    };

    await PlannedExpenseService.confirmPlannedExpense(mockUid, 'pe123', mockTransactionData);
    
    expect(getDoc).toHaveBeenCalled();
    const batch = writeBatch({} as any);
    expect(batch.update).toHaveBeenCalled();
    expect(batch.set).toHaveBeenCalledTimes(2); // One for new transaction, one for recurring plan
    expect(batch.commit).toHaveBeenCalled();
  });

  it('should reject a planned expense and create recurrence if applicable', async () => {
    (getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      data: () => mockExpense
    });

    await PlannedExpenseService.rejectPlannedExpense(mockUid, 'pe123');
    
    expect(getDoc).toHaveBeenCalled();
    const batch = writeBatch({} as any);
    expect(batch.update).toHaveBeenCalled();
    expect(batch.set).toHaveBeenCalledTimes(1); // One for recurring plan
    expect(batch.commit).toHaveBeenCalled();
  });
});
