import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSyncService } from '../../services/DataSyncService';
import { getDoc, writeBatch } from 'firebase/firestore';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    doc: vi.fn((...args: unknown[]) => {
      const id = String(args.at(-1) ?? 'mock');
      return { id, path: id };
    }),
    collection: vi.fn(() => ({ path: 'mock/collection' })),
    query: vi.fn(ref => ref),
    limit: vi.fn(),
    orderBy: vi.fn(),
    documentId: vi.fn(),
    startAfter: vi.fn(),
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
    getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    setDoc: vi.fn().mockResolvedValue(undefined),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      delete: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined)
    }))
  };
});

describe('DataSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
    
    // Mock URL and createElement for export
    window.URL.createObjectURL = vi.fn();
    window.URL.revokeObjectURL = vi.fn();
    
    const mockElement = { click: vi.fn(), href: '', download: '' };
    window.document.createElement = vi.fn(() => mockElement as any);
  });

  it('resumes a failed import from its persisted checkpoint', async () => {
    const json = JSON.stringify({
      initialBalance: 50,
      transactions: [{ description: 't1', amount: 10, date: '2026-01-01', paymentMethod: 'pix', type: 'expense', installments: 1 }],
      plannedExpenses: [],
    });
    vi.mocked(getDoc)
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ status: 'failed', processed: 1 }) } as any)
      .mockResolvedValue({ exists: () => false } as any);
    const onProgress = vi.fn();

    await expect(DataSyncService.importData('user1', json, onProgress)).resolves.toBe(true);

    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ status: 'validated', processed: 1, total: 2 }));
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'completed', processed: 2, total: 2 }));
  });

  it('exports data correctly', async () => {
    await DataSyncService.exportData('user1', 100);
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.document.createElement).toHaveBeenCalledWith('a');
  });

  it('imports data correctly', async () => {
    const json = JSON.stringify({
      initialBalance: 50,
      transactions: [{ description: 't1', amount: 10, date: '2026-01-01', paymentMethod: 'pix', type: 'expense', installments: 1 }],
      plannedExpenses: [{ description: 'p1', amount: 20, dueDate: '2026-01-01', status: 'pending', type: 'expense', paymentMethod: 'pix', installments: 1, isRecurring: false, recurrenceInterval: 1 }]
    });

    const onProgress = vi.fn();
    const success = await DataSyncService.importData('user1', json, onProgress);
    expect(success).toBe(true);
    expect(writeBatch).toHaveBeenCalled();
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'completed', processed: 3, total: 3 }));
  });

  it('clears data correctly', async () => {
    window.confirm = vi.fn(() => true);
    await DataSyncService.clearData('user1');
    expect(window.confirm).toHaveBeenCalled();
    expect(writeBatch).toHaveBeenCalled();
  });
});
