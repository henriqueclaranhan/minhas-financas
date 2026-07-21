import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLongPressActions } from '../../hooks/useLongPressActions';

describe('useLongPressActions', () => {
  const vibrate = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vibrate.mockReset();
  });

  it('provides haptic feedback when a press starts and when it completes', () => {
    const item = { id: 'transaction-1' };
    const { result } = renderHook(() => useLongPressActions<typeof item>());

    act(() => result.current.startPress(item));

    expect(result.current.pressingId).toBe(item.id);
    expect(vibrate).toHaveBeenCalledWith(10);

    act(() => vi.advanceTimersByTime(500));

    expect(vibrate).toHaveBeenLastCalledWith(30);
    expect(result.current.actionItem).toBe(item);
    expect(result.current.pressingId).toBeNull();
  });
});
