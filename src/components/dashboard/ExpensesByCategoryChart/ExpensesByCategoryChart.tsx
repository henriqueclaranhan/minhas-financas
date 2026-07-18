import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLocale } from '../../../store/LocaleContext';
import './ExpensesByCategoryChart.css';

interface CategoryExpense {
  name: string; // The translation key
  value: number;
  color: string;
  percentage: number;
}

interface ExpensesByCategoryChartProps {
  data: CategoryExpense[];
  formatCurrency: (val: number) => string;
}

export function ExpensesByCategoryChart({ data, formatCurrency }: ExpensesByCategoryChartProps) {
  const { t } = useLocale();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="pie-tooltip glass-panel">
          <p className="pie-tooltip-label">{t(data.name)}</p>
          <p className="pie-tooltip-value text-danger">{formatCurrency(data.value)}</p>
          <p className="pie-tooltip-percent">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };



  if (data.length === 0) {
    return (
      <div className="glass-panel chart-panel flex flex-col items-center justify-center py-xxl" style={{ height: '100%' }}>
        <h3 className="chart-header-title mb-lg">{t('dashboard.expensesByCategory')}</h3>
        <div className="text-secondary text-center">
          <p>{t('dashboard.noExpenses')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel chart-panel flex flex-col" style={{ height: '100%' }}>
      <div className="flex justify-between items-center mb-lg">
        <h3 className="chart-header-title m-0">{t('dashboard.expensesByCategory')}</h3>
        <span className="text-secondary font-medium" style={{ fontSize: '0.9rem' }}>
          {formatCurrency(total)}
        </span>
      </div>
      
      <div className="pie-chart-container flex-1">
        <div className="pie-chart-graphic">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="pie-legend-wrapper">
          <ul className="pie-legend">
            {data.map((entry, index) => (
              <li key={`item-${index}`} className="pie-legend-item">
                <span className="pie-legend-color" style={{ backgroundColor: entry.color }} />
                <span className="pie-legend-text" title={t(entry.name)}>{t(entry.name)}</span>
                <span className="pie-legend-value">{formatCurrency(entry.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
