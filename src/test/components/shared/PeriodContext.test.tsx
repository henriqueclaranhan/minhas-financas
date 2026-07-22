import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PeriodContext } from '../../../components/shared/PeriodContext';

vi.mock('../../../store/LocaleContext', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'filters.displayedPeriod': 'Período exibido',
      'filters.changePeriod': 'Alterar período',
    })[key] ?? key,
  }),
}));

describe('PeriodContext', () => {
  it('renders a compact unframed context bar with a direct period action', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PeriodContext
        label="Julho de 2026"
        description="Totais calculados por competência."
        onChange={onChange}
      />,
    );

    expect(container.querySelectorAll('.glass-panel')).toHaveLength(0);
    expect(screen.getByText('Julho de 2026')).toBeInTheDocument();
    expect(screen.getByText('Totais calculados por competência.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Alterar período' }));
    expect(onChange).toHaveBeenCalledOnce();
  });
});
