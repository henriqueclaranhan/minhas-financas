import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="pie-legend">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="pie-legend-item">
            <span className="pie-legend-color" style={{ backgroundColor: entry.color }} />
            <span className="pie-legend-text">{t(entry.payload.name)}</span>
            <span className="pie-legend-value">{formatCurrency(entry.payload.value)}</span>
          </li>
        ))}
      </ul>
    );
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
      <h3 className="chart-header-title mb-lg">{t('dashboard.expensesByCategory')}</h3>
      
      <div className="pie-chart-container flex-1">
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
            <Legend content={renderLegend} layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
