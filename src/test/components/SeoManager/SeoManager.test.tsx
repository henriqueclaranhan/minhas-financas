import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeoManager } from '../../../components/SeoManager';
import { useLocale } from '../../../store/LocaleContext';

vi.mock('../../../store/LocaleContext');

const translations: Record<string, string> = {
  'seo.title': 'Minhas Finanças | Controle Financeiro',
  'seo.description': 'Descrição principal',
  'seo.privacyTitle': 'Política de Privacidade | Minhas Finanças',
  'seo.privacyDescription': 'Descrição da privacidade',
};

describe('SeoManager', () => {
  beforeEach(() => {
    vi.mocked(useLocale).mockReturnValue({
      locale: 'pt-BR',
      t: (key: string) => translations[key] || key,
    } as any);
    window.history.pushState({}, '', '/');
  });

  it('allows indexing on the public home page', async () => {
    render(<SeoManager isAuthenticated={false} />);

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://financas.claranhan.com.br/',
      );
    });
  });

  it('prevents indexing authenticated pages', async () => {
    window.history.pushState({}, '', '/categories');
    render(<SeoManager isAuthenticated={true} />);

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    });
  });

  it('sets dedicated metadata for the privacy policy', async () => {
    window.history.pushState({}, '', '/privacidade');
    render(<SeoManager isAuthenticated={false} />);

    await waitFor(() => {
      expect(document.title).toBe('Política de Privacidade | Minhas Finanças');
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
        'content',
        'Descrição da privacidade',
      );
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://financas.claranhan.com.br/privacidade',
      );
    });
  });
});
