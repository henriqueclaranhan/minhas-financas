import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLocale } from '../../../store/LocaleContext';
import { getCategoryIcon } from '../../../utils/categoryIcons';
import type { CategoryExpenseData } from '../../../utils/categoryExpenseUtils';
import { formatPercentage } from '../../../utils/numberFormatUtils';
import './ExpensesByCategoryChart.css';

interface ExpensesByCategoryChartProps {
  data: CategoryExpenseData[];
  formatCurrency: (val: number) => string;
  headerAction?: React.ReactNode;
  showTotal?: boolean;
  variant?: 'default' | 'expanded';
}

export function ExpensesByCategoryChart({
  data,
  formatCurrency,
  headerAction,
  showTotal = true,
  variant = 'default',
}: ExpensesByCategoryChartProps) {
  const { locale, t } = useLocale();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const isExpanded = variant === 'expanded';
  const panelClassName = `glass-panel chart-panel pie-chart-panel${isExpanded ? ' pie-chart-panel-expanded' : ''} flex flex-col`;
  const getCategoryKey = (translationKey: string) => translationKey.replace('categories.', '');

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="pie-tooltip glass-panel">
          <div className="flex items-center" style={{ gap: '6px', marginBottom: '4px' }}>
            <span className="pie-category-icon" style={{ color: data.color }}>
              {getCategoryIcon(getCategoryKey(data.name))}
            </span>
            <p className="pie-tooltip-label" style={{ margin: 0 }}>{t(data.name)}</p>
          </div>
          <p className="pie-tooltip-value text-danger">{formatCurrency(data.value)}</p>
          <p className="pie-tooltip-percent">{formatPercentage(data.percentage, locale)}</p>
        </div>
      );
    }
    return null;
  };



  if (data.length === 0) {
    return (
      <div className={panelClassName} style={{ height: '100%' }}>
        <div className="pie-chart-header flex justify-between items-center mb-lg">
          <h3 className="chart-header-title m-0">{t('dashboard.expensesByCategory')}</h3>
          {headerAction && <div className="pie-chart-header-meta">{headerAction}</div>}
        </div>
        <div className="text-secondary text-center flex-1 flex items-center justify-center py-xxl">
          <p>{t('dashboard.noExpenses')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={panelClassName} style={{ height: '100%' }}>
      <div className="pie-chart-header flex justify-between items-center mb-lg">
        <h3 className="chart-header-title m-0">{t('dashboard.expensesByCategory')}</h3>
        {(showTotal || headerAction) && (
          <div className="pie-chart-header-meta">
            {showTotal && (
              <span className="text-secondary font-medium" style={{ fontSize: '0.9rem' }}>
                {formatCurrency(total)}
              </span>
            )}
            {headerAction}
          </div>
        )}
      </div>
      
      <div className="pie-chart-container flex-1">
        <div className="pie-chart-graphic">
          <ResponsiveContainer width="100%" height={isExpanded ? 320 : 240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={isExpanded ? 84 : 60}
                outerRadius={isExpanded ? 116 : 80}
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
                <span className="pie-category-icon" style={{ color: entry.color }}>
                  {getCategoryIcon(getCategoryKey(entry.name))}
                </span>
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
