import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDoc, getDocs, setDoc, startAfter, writeBatch } from 'firebase/firestore';
import { FINANCE_SCHEMA_VERSION, FinanceMigrationService } from '../../services/FinanceMigrationService';

vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ path: 'transactions' })),
  doc: vi.fn((...args: unknown[]) => ({ id: String(args.at(-1)), path: String(args.at(-1)) })),
  documentId: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(reference => reference),
  setDoc: vi.fn(),
  startAfter: vi.fn(),
  writeBatch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) })),
}));

describe('FinanceMigrationService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('backfills legacy transactions and marks schema version 2', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({ financeSchemaVersion: 1 }) } as any);
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [{
        id: 'tx-1',
        data: () => ({ description: 'Market', amount: 100, date: '2026-07-21', paymentMethod: 'pix', type: 'expense', installments: 1 }),
      }],
    } as any);

    await FinanceMigrationService.ensureCurrentSchema('owner');

    const batch = vi.mocked(writeBatch).mock.results[0].value as any;
    expect(batch.set).toHaveBeenCalledTimes(1);
    expect(setDoc).toHaveBeenLastCalledWith(expect.anything(), {
      financeSchemaVersion: FINANCE_SCHEMA_VERSION,
      financeMigrationCursor: null,
    }, { merge: true });
  });

  it('resumes after the persisted migration cursor', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({ financeMigrationCursor: 'tx-25' }) } as any);
    vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any);

    await FinanceMigrationService.ensureCurrentSchema('owner');

    expect(startAfter).toHaveBeenCalledWith('tx-25');
  });
});
