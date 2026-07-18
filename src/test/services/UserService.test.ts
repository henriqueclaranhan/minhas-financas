import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../services/UserService';
import { setDoc, onSnapshot } from 'firebase/firestore';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    doc: vi.fn((_db, _col, id) => ({ id })),
    setDoc: vi.fn(),
    onSnapshot: vi.fn((_ref, callback) => {
      callback({
        exists: () => true,
        data: () => ({ initialBalance: 100 })
      });
      return vi.fn();
    })
  };
});

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates initial balance', async () => {
    await UserService.updateInitialBalance('user1', 500);
    expect(setDoc).toHaveBeenCalledWith(
      { id: 'user1' },
      { initialBalance: 500 },
      { merge: true }
    );
  });

  it('subscribes to initial balance', () => {
    const onUpdate = vi.fn();
    const unsub = UserService.subscribeToInitialBalance('user1', onUpdate);
    expect(onSnapshot).toHaveBeenCalled();
    expect(onUpdate).toHaveBeenCalledWith(100);
    expect(typeof unsub).toBe('function');
  });
});
