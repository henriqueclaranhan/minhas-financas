import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLocale } from '../../../store/LocaleContext';
import './PeriodSummaryCards.css';

interface PeriodSummaryCardsProps {
  income: number;
  expense: number;
}

export function PeriodSummaryCards({ income, expense }: PeriodSummaryCardsProps) {
  const { formatCurrency, t } = useLocale();

  return (
    <div className="period-summary-cards">
      <div className="glass-panel summary-card">
        <div className="summary-card-header">
          <div className="summary-card-icon-wrapper success">
            <TrendingUp size={20} color="var(--clr-success)" />
          </div>
          <span className="summary-card-title">{t('transactions.incomePeriod')}</span>
        </div>
        <div className="summary-card-value value-success">
          {formatCurrency(income)}
        </div>
      </div>

      <div className="glass-panel summary-card">
        <div className="summary-card-header">
          <div className="summary-card-icon-wrapper danger">
            <TrendingDown size={20} color="var(--clr-danger)" />
          </div>
          <span className="summary-card-title">{t('transactions.expensePeriod')}</span>
        </div>
        <div className="summary-card-value value-danger">
          {formatCurrency(Math.abs(expense))}
        </div>
      </div>
    </div>
  );
}
