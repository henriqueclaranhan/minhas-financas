import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSyncService } from '../../services/DataSyncService';
import { writeBatch } from 'firebase/firestore';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    doc: vi.fn((_db, _col, id) => {
      if (!id) return { path: 'mock/path' };
      return { id };
    }),
    collection: vi.fn(),
    query: vi.fn(ref => ref),
    limit: vi.fn(),
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
    getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
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
    
    // Mock URL and createElement for export
    window.URL.createObjectURL = vi.fn();
    window.URL.revokeObjectURL = vi.fn();
    
    const mockElement = { click: vi.fn(), href: '', download: '' };
    window.document.createElement = vi.fn(() => mockElement as any);
  });

  it('exports data correctly', () => {
    DataSyncService.exportData(100, [], []);
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.document.createElement).toHaveBeenCalledWith('a');
  });

  it('imports data correctly', async () => {
    const json = JSON.stringify({
      initialBalance: 50,
      transactions: [{ description: 't1', amount: 10, date: '2026-01-01', paymentMethod: 'pix', type: 'expense', installments: 1 }],
      plannedExpenses: [{ description: 'p1', amount: 20, dueDate: '2026-01-01', status: 'pending', type: 'expense', paymentMethod: 'pix', installments: 1, isRecurring: false, recurrenceInterval: 1 }]
    });

    const success = await DataSyncService.importData('user1', json);
    expect(success).toBe(true);
    expect(writeBatch).toHaveBeenCalled();
  });

  it('clears data correctly', async () => {
    window.confirm = vi.fn(() => true);
    await DataSyncService.clearData('user1');
    expect(window.confirm).toHaveBeenCalled();
    expect(writeBatch).toHaveBeenCalled();
  });
});
