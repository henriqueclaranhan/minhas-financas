import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal } from '../../components/Modal/Modal';

describe('Modal transitions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('scrollTo', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.removeAttribute('data-scroll-y');
    document.body.style.cssText = '';
    document.documentElement.style.overflow = '';
  });

  it('keeps the portal and scroll lock until the closing animation finishes', () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} title="Filtros"><p>Conteúdo original</p></Modal>,
    );

    expect(document.body.style.position).toBe('fixed');
    rerender(<Modal isOpen={false} onClose={vi.fn()} title="Outro título"><p>Novo conteúdo</p></Modal>);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo original')).toBeInTheDocument();
    expect(document.querySelector('.modal-overlay')).toHaveClass('is-closing');
    expect(document.body.style.position).toBe('fixed');

    act(() => vi.advanceTimersByTime(150));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.position).toBe('');
  });

  it('cancels removal when reopened during the exit animation', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal isOpen onClose={onClose} title="Filtros">Conteúdo</Modal>);

    rerender(<Modal isOpen={false} onClose={onClose} title="Filtros">Conteúdo</Modal>);
    act(() => vi.advanceTimersByTime(75));
    rerender(<Modal isOpen onClose={onClose} title="Filtros">Conteúdo</Modal>);
    act(() => vi.advanceTimersByTime(150));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.querySelector('.modal-overlay')).toHaveClass('is-opening');
  });
});
