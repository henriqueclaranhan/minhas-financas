import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../../store/LocaleContext';
import './PeriodSummaryCards.css';

interface PeriodSummaryCardsProps {
  income: number;
  expense: number;
  expenseHref?: string;
}

export function PeriodSummaryCards({ income, expense, expenseHref }: PeriodSummaryCardsProps) {
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

      {expenseHref ? (
        <Link to={expenseHref} className="glass-panel summary-card period-summary-link hover-lift">
          <ChevronRight className="summary-card-navigation-arrow" size={20} aria-hidden="true" />
          <div className="summary-card-header">
            <div className="summary-card-icon-wrapper danger">
              <TrendingDown size={20} color="var(--clr-danger)" />
            </div>
            <span className="summary-card-title">{t('transactions.expensePeriod')}</span>
          </div>
          <div className="summary-card-value value-danger">
            {formatCurrency(Math.abs(expense))}
          </div>
        </Link>
      ) : (
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
      )}
    </div>
  );
}
