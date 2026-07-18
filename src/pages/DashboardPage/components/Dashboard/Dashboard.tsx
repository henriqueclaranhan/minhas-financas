import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SummaryCards } from '../SummaryCards';
import { DashboardChart } from '../../../../components/dashboard/DashboardChart';
import './Dashboard.css';

interface DashboardProps {
  chartData: {
    data: any[];
    currentBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
  };
}

export function Dashboard({ chartData }: DashboardProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex flex-col gap-xl">
      <SummaryCards 
        currentBalance={chartData.currentBalance}
        monthlyIncome={chartData.monthlyIncome}
        monthlyExpense={chartData.monthlyExpense}
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
            <span className="hide-on-mobile">Ver todas</span> <ChevronRight size={20} />
          </Link>
        }
      />
    </div>
  );
}
