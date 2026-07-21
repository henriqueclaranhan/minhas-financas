import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PullToRefresh } from '../../components/shared/PullToRefresh';
import { useLocale } from '../../store/LocaleContext';

vi.mock('../../store/LocaleContext');

function touchEvent(type: string, x: number, y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [{ clientX: x, clientY: y }],
  });
  return event;
}

function pull(target: Document | Element = document, distance = 160) {
  target.dispatchEvent(touchEvent('touchstart', 20, 10));
  document.dispatchEvent(touchEvent('touchmove', 20, 10 + distance));
  document.dispatchEvent(touchEvent('touchend', 20, 10 + distance));
}

describe('PullToRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useLocale).mockReturnValue({ t: (key: string) => key } as never);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('refreshes after crossing the threshold in standalone mode', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const onRefresh = vi.fn();
    render(<PullToRefresh onRefresh={onRefresh} />);

    act(() => pull());
    expect(screen.getByRole('status')).toHaveTextContent('pullToRefresh.refreshing');
    act(() => vi.advanceTimersByTime(180));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('does not activate outside standalone mode', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    const onRefresh = vi.fn();
    render(<PullToRefresh onRefresh={onRefresh} />);

    act(() => pull());
    act(() => vi.runAllTimers());
    expect(onRefresh).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('ignores gestures that start inside a modal', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const onRefresh = vi.fn();
    const { container } = render(
      <>
        <div className="modal-overlay"><button type="button">Edit</button></div>
        <PullToRefresh onRefresh={onRefresh} />
      </>,
    );

    act(() => pull(container.querySelector('button')!));
    act(() => vi.runAllTimers());
    expect(onRefresh).not.toHaveBeenCalled();
  });
});
