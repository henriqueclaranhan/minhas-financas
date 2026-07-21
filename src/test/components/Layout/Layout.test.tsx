import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Layout } from '../../../components/Layout';

describe('Layout navigation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes the category analysis in secondary navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div>Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const categoryLinks = screen.getAllByRole('link', { name: /Categorias/i });

    expect(categoryLinks).toHaveLength(2);
    categoryLinks.forEach((link) => expect(link).toHaveAttribute('href', '/categories'));
    expect(document.querySelector('.mobile-header')).toBeInTheDocument();
  });

  it('resets scroll when navigating to another page on mobile', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div>Home</div>} />
            <Route path="transactions" element={<div>Transactions</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    scrollTo.mockClear();
    fireEvent.click(screen.getAllByRole('link', { name: /Transações/i })[0]);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('preserves document scroll behavior on desktop navigation', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div>Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
