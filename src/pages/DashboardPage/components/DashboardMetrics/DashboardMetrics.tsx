import { ExpensesByCategoryChart } from '../../../../components/dashboard/ExpensesByCategoryChart';
import { useLocale } from '../../../../store/LocaleContext';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CategoryExpenseData } from '../../../../utils/categoryExpenseUtils';
import './DashboardMetrics.css';

interface DashboardMetricsProps {
  expensesByCategory: CategoryExpenseData[];
  formatCurrency: (val: number) => string;
  monthlyIncome: number;
  monthlyExpense: number;
}

export function DashboardMetrics({ expensesByCategory, formatCurrency, monthlyIncome, monthlyExpense }: DashboardMetricsProps) {
  const { t } = useLocale();
  
  const balance = monthlyIncome - monthlyExpense;


  return (
    <div className="dashboard-metrics-grid animate-fade-in">
      <ExpensesByCategoryChart
        data={expensesByCategory}
        formatCurrency={formatCurrency}
        headerAction={
          <Link to="/categories" className="category-details-link">
            <span className="hide-on-mobile">{t('dashboard.viewAll')}</span>
            <ChevronRight size={20} aria-hidden="true" />
          </Link>
        }
      />
      
      <div className="glass-panel chart-panel flex flex-col justify-between" style={{ height: '100%' }}>
        <h3 className="chart-header-title mb-lg">{t('dashboard.incomeVsExpense')}</h3>
          
          <div className="metrics-summary-content">
            <div className="metric-row">
              <div className="metric-label">
                <TrendingUp size={20} className="text-success" />
                <span>{t('dashboard.monthlyIncome')}</span>
              </div>
              <div className="metric-value text-success">{formatCurrency(monthlyIncome)}</div>
            </div>

            <div className="metric-row">
              <div className="metric-label">
                <TrendingDown size={20} className="text-danger" />
                <span>{t('dashboard.monthlyExpense')}</span>
              </div>
              <div className="metric-value text-danger">{formatCurrency(monthlyExpense)}</div>
            </div>

            <div className="metric-divider" />

            <div className="metric-row metric-total">
              <div className="metric-label">
                {balance < 0 ? <TrendingDown size={24} className="text-danger" /> : balance < 500 ? <TrendingUp size={24} className="text-warning" /> : <TrendingUp size={24} />}
                <span>{t('chart.balance')}</span>
              </div>
              <div className={`metric-value ${balance < 0 ? 'text-danger' : balance < 500 ? 'text-warning' : ''}`}>
                {formatCurrency(balance)}
              </div>
            </div>
          </div>
          
        <div className="metric-footer text-secondary">
          <p>{t('dashboard.metrics.description')}</p>
        </div>
      </div>
    </div>
  );
}
