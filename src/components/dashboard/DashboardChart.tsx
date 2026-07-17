import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardChart.css';

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

export function DashboardChart({ data, formatCurrency, title = 'Evolução e Previsão do Saldo', headerAction }: DashboardChartProps) {
  return (
    <div className="glass-panel chart-panel">
      <div className="flex justify-between items-center mb-xl">
        <h3 className="chart-header-title">{title}</h3>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--clr-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--clr-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--clr-text-secondary)', fontSize: 12 }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--clr-text-secondary)', fontSize: 12 }}
              tickFormatter={(val) => `R$ ${val}`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--clr-surface)', borderColor: 'var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text-primary)' }}
              formatter={(value: any) => [formatCurrency(Number(value)), 'Saldo']}
              wrapperClassName="hide-on-mobile"
            />
            <Area type="monotone" dataKey="saldo" stroke="var(--clr-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaldo)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-table-container">
        <table className="data-table chart-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th className="hide-on-mobile text-right">Entradas</th>
              <th className="hide-on-mobile text-right">Saídas</th>
              <th className="text-right">Saldo Final</th>
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
                <td className={`chart-table-balance ${item.saldo >= 0 ? 'text-primary' : 'text-danger'}`}>
                  {formatCurrency(item.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
