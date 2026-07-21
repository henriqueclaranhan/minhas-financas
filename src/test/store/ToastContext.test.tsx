import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../../store/ToastContext';

vi.mock('../../store/LocaleContext', () => ({
  useLocale: () => ({ t: (key: string) => key }),
}));

function ToastHarness() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Transaction created')}>Success</button>
      <button onClick={() => toast.error('Changes could not be saved')}>Error</button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('announces and automatically dismisses a success toast', () => {
    render(<ToastProvider><ToastHarness /></ToastProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Success' }));
    expect(screen.getByRole('status')).toHaveTextContent('Transaction created');

    act(() => vi.advanceTimersByTime(3_000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('queues notifications and exposes assertive error semantics', () => {
    render(<ToastProvider><ToastHarness /></ToastProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Success' }));
    fireEvent.click(screen.getByRole('button', { name: 'Error' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'notifications.dismiss' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Changes could not be saved');
  });

  it('pauses automatic dismissal while the toast is hovered', () => {
    render(<ToastProvider><ToastHarness /></ToastProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Success' }));
    const toast = screen.getByRole('status');
    fireEvent.mouseEnter(toast);
    act(() => vi.advanceTimersByTime(3_000));
    expect(toast).toBeInTheDocument();

    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(3_000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
