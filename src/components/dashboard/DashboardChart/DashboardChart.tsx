import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './DashboardChart.css';
import { useLocale } from '../../../store/LocaleContext';
import { calculateCurrencyAxisWidth, createCompactCurrencyFormatter } from '../../../utils/chartAxisUtils';

interface ChartDataPoint {
  name: string;
  saldo: number;
  income?: number;
  expense?: number;
}

interface DashboardChartProps {
  data: ChartDataPoint[];
  formatCurrency: (val: number) => string;
  title?: string;
  headerAction?: React.ReactNode;
}

export function DashboardChart({ data, formatCurrency, title, headerAction }: DashboardChartProps) {
  const { currency, locale, t } = useLocale();
  
  const [isTableExpanded, setIsTableExpanded] = useState(() => {
    const saved = localStorage.getItem('dashboardTableExpanded');
    return saved !== null ? saved === 'true' : false; // Default to false (collapsed) for better UX? Or true? Let's use false, wait prompt didn't specify. I'll default to true.
  });

  useEffect(() => {
    localStorage.setItem('dashboardTableExpanded', String(isTableExpanded));
  }, [isTableExpanded]);

  const max = Math.max(...data.map(d => d.saldo), 0);
  const min = Math.min(...data.map(d => d.saldo), 0);
  const range = max - min;
  const formatAxisCurrency = useMemo(
    () => createCompactCurrencyFormatter(locale, currency),
    [currency, locale],
  );
  const axisWidth = useMemo(
    () => calculateCurrencyAxisWidth(data.map(point => point.saldo), formatAxisCurrency),
    [data, formatAxisCurrency],
  );

  const getOffset = (val: number) => {
    if (range === 0) {
      return max < val ? 0 : 1;
    }
    const offset = (max - val) / range;
    return Math.max(0, Math.min(1, offset));
  };

  const off500 = getOffset(500);
  const off0 = getOffset(0);

  const getBalanceColorClass = (saldo: number) => {
    if (saldo < 0) return 'text-danger';
    if (saldo < 500) return 'text-warning';
    return ''; // default text color
  };

  return (
    <div className="glass-panel chart-panel">
      <div className="flex justify-between items-center mb-xl">
        <h3 className="chart-header-title">{title ?? t('dashboard.balanceProjection')}</h3>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSaldoStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--clr-text-primary)" />
                <stop offset={`${off500 * 100}%`} stopColor="var(--clr-text-primary)" />
                <stop offset={`${off500 * 100}%`} stopColor="var(--clr-warning)" />
                <stop offset={`${off0 * 100}%`} stopColor="var(--clr-warning)" />
                <stop offset={`${off0 * 100}%`} stopColor="var(--clr-danger)" />
                <stop offset="100%" stopColor="var(--clr-danger)" />
              </linearGradient>
              <linearGradient id="colorSaldoFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--clr-text-primary)" stopOpacity={0.3} />
                <stop offset={`${off500 * 100}%`} stopColor="var(--clr-text-primary)" stopOpacity={0.15} />
                <stop offset={`${off500 * 100}%`} stopColor="var(--clr-warning)" stopOpacity={0.3} />
                <stop offset={`${off0 * 100}%`} stopColor="var(--clr-warning)" stopOpacity={0.15} />
                <stop offset={`${off0 * 100}%`} stopColor="var(--clr-danger)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--clr-danger)" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--clr-text-secondary)', fontSize: 12 }} dy={10} />
            <YAxis 
              width={axisWidth}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--clr-text-secondary)', fontSize: 12 }}
              tickFormatter={(val) => formatAxisCurrency(Number(val))}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--clr-surface)', borderColor: 'var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text-primary)' }}
              formatter={(value: any) => [formatCurrency(Number(value)), t('chart.balance')]}
              wrapperClassName="hide-on-mobile"
            />
            <Area type="monotone" dataKey="saldo" stroke="url(#colorSaldoStroke)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaldoFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-table-toggle-container">
        <button 
          className="btn btn-ghost chart-table-toggle"
          onClick={() => setIsTableExpanded(!isTableExpanded)}
        >
          <span>{t('dashboard.toggleTable')}</span>
          {isTableExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className={`chart-table-wrapper ${isTableExpanded ? 'expanded' : ''}`}>
        <div className="chart-table-inner">
          <div className="chart-table-container">
            <table className="data-table chart-table">
              <thead>
                <tr>
                  <th>{t('chart.month')}</th>
                  <th className="hide-on-mobile text-right">{t('chart.income')}</th>
                  <th className="hide-on-mobile text-right">{t('chart.expense')}</th>
                  <th className="text-right">{t('chart.balance')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="chart-table-month">
                      {item.name}
                      {/* Show summary on mobile */}
                      <div className="hide-on-desktop flex gap-sm chart-table-mobile-summary">
                         {item.income !== undefined && <span className="text-success">+{formatCurrency(item.income)}</span>}
                         {item.expense !== undefined && <span className="text-danger">-{formatCurrency(item.expense)}</span>}
                      </div>
                    </td>
                    <td className="hide-on-mobile chart-table-income">
                      {item.income !== undefined && item.income > 0 ? `+ ${formatCurrency(item.income)}` : '-'}
                    </td>
                    <td className="hide-on-mobile chart-table-expense">
                      {item.expense !== undefined && item.expense > 0 ? `- ${formatCurrency(item.expense)}` : '-'}
                    </td>
                    <td className={`chart-table-balance ${getBalanceColorClass(item.saldo)}`}>
                      {formatCurrency(item.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
