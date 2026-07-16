import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardsProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  formatCurrency: (val: number) => string;
}

export function SummaryCards({ currentBalance, monthlyIncome, monthlyExpense, formatCurrency }: SummaryCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-text-secondary)', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
          <DollarSign size={20} color="var(--clr-primary)" />
          <span>Saldo Atual Estimado</span>
        </div>
        <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 'bold', color: 'var(--clr-text-primary)' }}>
          {formatCurrency(currentBalance)}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-text-secondary)', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
          <TrendingUp size={20} color="var(--clr-success)" />
          <span>Receitas do Mês</span>
        </div>
        <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: 'var(--clr-success)' }}>
          {formatCurrency(monthlyIncome)}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-text-secondary)', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
          <TrendingDown size={20} color="var(--clr-danger)" />
          <span>Despesas do Mês</span>
        </div>
        <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: 'var(--clr-danger)' }}>
          {formatCurrency(Math.abs(monthlyExpense))}
        </div>
      </div>
    </div>
  );
}
