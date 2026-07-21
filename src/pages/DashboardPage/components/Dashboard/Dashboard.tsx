import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SummaryCards } from '../SummaryCards';
import { DashboardChart } from '../../../../components/dashboard/DashboardChart';
import { DashboardMetrics } from '../DashboardMetrics';
import { useLocale } from '../../../../store/LocaleContext';
import type { CategoryExpenseData } from '../../../../utils/categoryExpenseUtils';
import './Dashboard.css';

interface DashboardProps {
  chartData: {
    data: any[];
    currentBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
  };
  expensesByCategory: CategoryExpenseData[];
  currentInvoice: number;
}

export function Dashboard({ chartData, expensesByCategory, currentInvoice }: DashboardProps) {
  const { formatCurrency, t } = useLocale();

  return (
    <div className="flex flex-col gap-xl">
      <SummaryCards 
        currentBalance={chartData.currentBalance}
        monthlyIncome={chartData.monthlyIncome}
        monthlyExpense={chartData.monthlyExpense}
        currentInvoice={currentInvoice}
        formatCurrency={formatCurrency}
      />

      <DashboardChart 
        data={chartData.data} 
        formatCurrency={formatCurrency} 
        headerAction={
          <Link 
            to="/forecast" 
            className="dashboard-link"
          >
            <span className="hide-on-mobile">{t('dashboard.viewAll')}</span> <ChevronRight size={20} />
          </Link>
        }
      />

      <DashboardMetrics
        expensesByCategory={expensesByCategory}
        formatCurrency={formatCurrency}
        monthlyIncome={chartData.monthlyIncome}
        monthlyExpense={chartData.monthlyExpense}
      />
    </div>
  );
}
