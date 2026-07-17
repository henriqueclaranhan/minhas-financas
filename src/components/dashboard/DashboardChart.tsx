import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    <div className="glass-panel" style={{ padding: 'var(--spacing-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h3 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>{title}</h3>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div style={{ width: '100%', height: '300px' }}>
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
            />
            <Area type="monotone" dataKey="saldo" stroke="var(--clr-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaldo)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 'var(--spacing-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--clr-border)', color: 'var(--clr-text-secondary)' }}>
              <th style={{ padding: 'var(--spacing-md)' }}>Mês</th>
              <th className="hide-on-mobile" style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Entradas</th>
              <th className="hide-on-mobile" style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Saídas</th>
              <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Saldo Final</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} style={{ borderBottom: index < data.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>
                  {item.name}
                  {/* Show summary on mobile */}
                  <div className="hide-on-desktop" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', gap: '8px' }}>
                     {item.income !== undefined && <span style={{ color: 'var(--clr-success)' }}>+{formatCurrency(item.income)}</span>}
                     {item.expense !== undefined && <span style={{ color: 'var(--clr-danger)' }}>-{formatCurrency(item.expense)}</span>}
                  </div>
                </td>
                <td className="hide-on-mobile" style={{ padding: 'var(--spacing-md)', textAlign: 'right', color: 'var(--clr-success)', fontWeight: 600 }}>
                  {item.income !== undefined && item.income > 0 ? `+ ${formatCurrency(item.income)}` : '-'}
                </td>
                <td className="hide-on-mobile" style={{ padding: 'var(--spacing-md)', textAlign: 'right', color: 'var(--clr-danger)', fontWeight: 600 }}>
                  {item.expense !== undefined && item.expense > 0 ? `- ${formatCurrency(item.expense)}` : '-'}
                </td>
                <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', fontWeight: 600, color: item.saldo >= 0 ? 'var(--clr-text-primary)' : 'var(--clr-danger)' }}>
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
