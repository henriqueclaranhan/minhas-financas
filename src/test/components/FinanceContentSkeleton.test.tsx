import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FinanceContentSkeleton } from '../../components/shared/FinanceContentSkeleton';

describe('FinanceContentSkeleton', () => {
  it.each(['dashboard', 'transactions', 'planned', 'credit', 'forecast', 'categories', 'expenseBreakdown'] as const)('renders an accessible %s placeholder', (variant) => {
    const { container } = render(<FinanceContentSkeleton variant={variant} />);

    expect(screen.getByRole('status', { name: 'Carregando conteúdo financeiro' })).toBeInTheDocument();
    expect(container.querySelectorAll('.finance-skeleton-block').length).toBeGreaterThan(0);
  });

  it('matches the unframed three-tab control used by transaction lists', () => {
    const { container } = render(<FinanceContentSkeleton variant="transactions" />);
    const tabs = container.querySelector('.finance-skeleton-controls-bare');

    expect(tabs).toBeInTheDocument();
    expect(tabs).not.toHaveClass('glass-panel');
    expect(tabs?.querySelectorAll('.finance-skeleton-pill')).toHaveLength(3);
  });
});
