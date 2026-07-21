import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Layout } from '../../../components/Layout';

describe('Layout navigation', () => {
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
  });
});
