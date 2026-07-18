import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import './SummaryCards.css';
import { useLocale } from '../../../../store/LocaleContext';

interface SummaryCardsProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  formatCurrency: (val: number) => string;
}

export function SummaryCards({ currentBalance, monthlyIncome, monthlyExpense, formatCurrency }: SummaryCardsProps) {
  const { t } = useLocale();
  return (
    <div className="summary-cards-container">
      <div className="glass-panel summary-card">
        <div className="summary-card-header">
          <DollarSign size={20} color="var(--clr-primary)" />
          <span>{t('dashboard.currentBalance')}</span>
        </div>
        <div className="summary-card-value summary-card-value-primary">
          {formatCurrency(currentBalance)}
        </div>
      </div>

      <div className="glass-panel summary-card">
        <div className="summary-card-header">
          <TrendingUp size={20} color="var(--clr-success)" />
          <span>{t('dashboard.monthlyIncome')}</span>
        </div>
        <div className="summary-card-value summary-card-value-success">
          {formatCurrency(monthlyIncome)}
        </div>
      </div>

      <div className="glass-panel summary-card">
        <div className="summary-card-header">
          <TrendingDown size={20} color="var(--clr-danger)" />
          <span>{t('dashboard.monthlyExpense')}</span>
        </div>
        <div className="summary-card-value summary-card-value-danger">
          {formatCurrency(Math.abs(monthlyExpense))}
        </div>
      </div>
    </div>
  );
}
