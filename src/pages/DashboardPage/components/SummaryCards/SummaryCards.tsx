import { ChevronRight, DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SummaryCards.css';
import { useLocale } from '../../../../store/LocaleContext';
import { FilterType } from '../../../../enums/FinanceEnums';

interface SummaryCardsProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  currentInvoice: number;
  formatCurrency: (val: number) => string;
}

export function SummaryCards({ currentBalance, monthlyIncome, monthlyExpense, currentInvoice, formatCurrency }: SummaryCardsProps) {
  const { t } = useLocale();
  return (
    <div className="summary-cards-container">
      <Link to="/transactions" className="glass-panel summary-card summary-card-navigable hover-lift" style={{ textDecoration: 'none' }}>
        <ChevronRight className="summary-card-navigation-arrow" size={20} aria-hidden="true" />
        <div className="summary-card-header">
          <div className="summary-card-icon-wrapper primary">
            <DollarSign size={20} color="var(--clr-primary)" />
          </div>
          <span className="summary-card-title">{t('dashboard.currentBalance')}</span>
        </div>
        <div className={`summary-card-value ${currentBalance < 0 ? 'text-danger' : currentBalance < 500 ? 'text-warning' : ''}`}>
          {formatCurrency(currentBalance)}
        </div>
      </Link>

      <Link to={`/transactions?type=${FilterType.INCOME}`} className="glass-panel summary-card summary-card-navigable hover-lift" style={{ textDecoration: 'none' }}>
        <ChevronRight className="summary-card-navigation-arrow" size={20} aria-hidden="true" />
        <div className="summary-card-header">
          <div className="summary-card-icon-wrapper success">
            <TrendingUp size={20} color="var(--clr-success)" />
          </div>
          <span className="summary-card-title">{t('dashboard.monthlyIncome')}</span>
        </div>
        <div className="summary-card-value value-success">
          {formatCurrency(monthlyIncome)}
        </div>
      </Link>

      <Link to="/expenses/breakdown" className="glass-panel summary-card summary-card-navigable hover-lift" style={{ textDecoration: 'none' }}>
        <ChevronRight className="summary-card-navigation-arrow" size={20} aria-hidden="true" />
        <div className="summary-card-header">
          <div className="summary-card-icon-wrapper danger">
            <TrendingDown size={20} color="var(--clr-danger)" />
          </div>
          <span className="summary-card-title">{t('dashboard.monthlyExpense')}</span>
        </div>
        <div className="summary-card-value value-danger">
          {formatCurrency(Math.abs(monthlyExpense))}
        </div>
      </Link>

      <Link to="/credit" className="glass-panel summary-card summary-card-navigable hover-lift" style={{ textDecoration: 'none' }}>
        <ChevronRight className="summary-card-navigation-arrow" size={20} aria-hidden="true" />
        <div className="summary-card-header">
          <div className="summary-card-icon-wrapper warning">
            <CreditCard size={20} color="var(--clr-warning)" />
          </div>
          <span className="summary-card-title">{t('dashboard.currentInvoice')}</span>
        </div>
        <div className="summary-card-value value-warning">
          {formatCurrency(currentInvoice)}
        </div>
      </Link>
    </div>
  );
}
