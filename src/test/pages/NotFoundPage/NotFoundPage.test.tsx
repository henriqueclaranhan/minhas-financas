import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from '../../../pages/NotFoundPage/NotFoundPage';

describe('NotFoundPage', () => {
  it('explains the invalid route and links back to home', () => {
    render(
      <MemoryRouter initialEntries={['/missing-page']}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Este caminho não existe' })).toBeInTheDocument();
    expect(screen.getByText('O endereço pode estar incorreto ou a página pode ter sido movida.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar ao início/i })).toHaveAttribute('href', '/');
  });
});
