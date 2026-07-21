import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FinanceContentSkeleton } from '../../components/shared/FinanceContentSkeleton';

describe('FinanceContentSkeleton', () => {
  it.each(['dashboard', 'list', 'report', 'details'] as const)('renders an accessible %s placeholder', (variant) => {
    const { container } = render(<FinanceContentSkeleton variant={variant} />);

    expect(screen.getByRole('status', { name: 'Carregando conteúdo financeiro' })).toBeInTheDocument();
    expect(container.querySelectorAll('.finance-skeleton-block').length).toBeGreaterThan(0);
  });
});
