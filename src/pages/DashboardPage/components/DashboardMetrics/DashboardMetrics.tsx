import { ExpensesByCategoryChart } from '../../../../components/dashboard/ExpensesByCategoryChart';
import { useLocale } from '../../../../store/LocaleContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './DashboardMetrics.css';

interface CategoryExpense {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface DashboardMetricsProps {
  expensesByCategory: CategoryExpense[];
  formatCurrency: (val: number) => string;
  monthlyIncome: number;
  monthlyExpense: number;
}

export function DashboardMetrics({ expensesByCategory, formatCurrency, monthlyIncome, monthlyExpense }: DashboardMetricsProps) {
  const { t } = useLocale();
  
  const balance = monthlyIncome - monthlyExpense;
  const isPositive = balance > 0;
  const isNegative = balance < 0;

  return (
    <div className="dashboard-metrics-grid animate-fade-in">
      <ExpensesByCategoryChart data={expensesByCategory} formatCurrency={formatCurrency} />
      
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
                {isPositive ? <TrendingUp size={24} className="text-primary" /> : isNegative ? <TrendingDown size={24} className="text-danger" /> : <Minus size={24} className="text-secondary" />}
                <span>{t('chart.balance')}</span>
              </div>
              <div className={`metric-value ${isPositive ? 'text-primary' : isNegative ? 'text-danger' : 'text-secondary'}`}>
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
