import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageHeader } from '../../../components/shared/PageHeader';

const navigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('../../../store/LocaleContext', () => ({
  useLocale: () => ({ t: (key: string) => key === 'common.back' ? 'Voltar' : key }),
}));

describe('PageHeader safe back navigation', () => {
  beforeEach(() => {
    navigate.mockReset();
  });

  it('returns to the previous React Router entry when one exists', () => {
    window.history.replaceState({ idx: 2 }, '');
    const { container } = render(<PageHeader title="Detalhes" showBackButton forceShowBackButtonOnDesktop />);

    expect(container.querySelector('.page-back-header')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it('replaces a direct or external entry with Home', () => {
    window.history.replaceState({ idx: 0 }, '');
    render(<PageHeader title="Detalhes" showBackButton forceShowBackButtonOnDesktop />);

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(navigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('keeps the title and action together while the description remains outside the sticky row', () => {
    const action = vi.fn();
    const { container } = render(
      <PageHeader
        title="Planejamento"
        description="Organize suas despesas futuras."
        primaryButton={{ label: 'Novo planejamento', onClick: action }}
      />,
    );
    const stickyRow = container.querySelector('.page-header-main');

    expect(stickyRow).toContainElement(screen.getByRole('heading', { name: 'Planejamento' }));
    expect(stickyRow).toContainElement(screen.getByRole('button', { name: 'Novo planejamento' }));
    expect(stickyRow).not.toContainElement(screen.getByText('Organize suas despesas futuras.'));
  });
});
