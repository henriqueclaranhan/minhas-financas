import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlannedExpenseService } from '../../services/PlannedExpenseService';
import { addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { TransactionType, ExpenseStatus, PaymentMethod } from '../../enums/FinanceEnums';

const { transactionMock } = vi.hoisted(() => ({
  transactionMock: {
    get: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('../../config/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(ref => ref),
    orderBy: vi.fn(),
    limit: vi.fn(),
    runTransaction: vi.fn(async (_db, callback) => callback(transactionMock)),
    onSnapshot: vi.fn((_ref, callback) => {
      callback({ forEach: vi.fn(), size: 0 });
      return vi.fn();
    })
  };
});

describe('PlannedExpenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.get.mockResolvedValue({ exists: () => true, data: () => mockExpense });
  });

  const mockUid = 'user123';
  const mockExpense = {
    description: 'Rent',
    amount: 1000,
    dueDate: '2026-05-10',
    paymentMethod: PaymentMethod.PIX,
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
    const unsub = PlannedExpenseService.subscribeToPlannedExpenses('user1', 250, onUpdate, vi.fn());
    expect(onSnapshot).toHaveBeenCalled();
    expect(typeof unsub).toBe('function');
  });

  it('should confirm a planned expense and create recurrence if applicable', async () => {
    const mockTransactionData = {
      description: 'Rent',
      amount: 1000,
      date: '2026-05-10',
      paymentMethod: PaymentMethod.PIX,
      type: TransactionType.EXPENSE,
      installments: 1
    };

    await PlannedExpenseService.confirmPlannedExpense(mockUid, 'pe123', mockTransactionData);
    
    expect(transactionMock.get).toHaveBeenCalled();
    expect(transactionMock.update.mock.calls[0][1]).toEqual({ status: ExpenseStatus.CONFIRMED });
    expect(transactionMock.set).toHaveBeenCalledTimes(2);
    expect(transactionMock.set.mock.calls[0][1]).toMatchObject({ sourceKey: 'plannedExpense:pe123:confirmation' });
  });

  it('should reject a planned expense and create recurrence if applicable', async () => {
    await PlannedExpenseService.rejectPlannedExpense(mockUid, 'pe123');
    
    expect(transactionMock.get).toHaveBeenCalled();
    expect(transactionMock.update.mock.calls[0][1]).toEqual({ status: ExpenseStatus.CANCELLED });
    expect(transactionMock.set).toHaveBeenCalledTimes(1);
  });
});
