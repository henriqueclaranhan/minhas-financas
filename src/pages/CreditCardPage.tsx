import { useMemo, useState, useEffect, useRef } from 'react';
import { useFinance } from '../store/FinanceContext';
import { parseISO, addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../types';

export function CreditCardPage() {
  const { transactions } = useFinance();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Auto-scroll slightly so the current invoice (index 4) is well-positioned on mobile
      scrollRef.current.scrollTo({ left: 120, behavior: 'smooth' });
    }
  }, []);

  // Calculate credit card bills
  const bills = useMemo(() => {
    const monthlyBills: Record<string, { total: number; items: (Transaction & { installmentNumber: number; installmentValue: number })[] }> = {};

    transactions.forEach(t => {
      if (t.type === 'expense' && t.paymentMethod?.toLowerCase().includes('crédito')) {
        const installments = t.installments || 1;
        const installmentValue = t.amount / installments;
        const baseDate = parseISO(t.date);

        for (let i = 1; i <= installments; i++) {
          const installmentDate = addMonths(baseDate, i);
          const monthKey = format(installmentDate, 'yyyy-MM');

          if (!monthlyBills[monthKey]) {
            monthlyBills[monthKey] = { total: 0, items: [] };
          }

          monthlyBills[monthKey].total += installmentValue;
          monthlyBills[monthKey].items.push({
            ...t,
            installmentNumber: i,
            installmentValue
          });
        }
      }
    });

    return monthlyBills;
  }, [transactions]);

  // Generate an array of the next 12 months starting from current month
  const nextMonths = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const date = addMonths(new Date(), i - 3);
      const key = format(date, 'yyyy-MM');
      const labelFull = format(date, 'MMMM yyyy', { locale: ptBR });
      const labelShort = format(date, 'MMM', { locale: ptBR }).toUpperCase();
      return {
        key,
        labelFull: labelFull.charAt(0).toUpperCase() + labelFull.slice(1),
        labelShort,
        data: bills[key] || { total: 0, items: [] },
        index: i
      };
    });
  }, [bills]);

  const selectedMonthData = nextMonths[selectedMonthIndex];
  const isCurrentInvoice = selectedMonthIndex === 4;

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{payload[0].payload.labelFull}</p>
          <p style={{ margin: 0, color: 'var(--clr-danger)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1>Faturas e Previsões</h1>
        <p style={{ color: 'var(--clr-text-secondary)' }}>Acompanhe os gastos no cartão de crédito nos próximos meses.</p>
      </header>

      {/* Chart Section */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-lg)', fontSize: '1.125rem' }}>Evolução das Faturas</h3>
        <div ref={scrollRef} style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ height: 200, minWidth: '600px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
              data={nextMonths} 
              style={{ cursor: 'pointer', outline: 'none' }}
              onClick={(data: any) => {
                if (data && data.activePayload && data.activePayload.length > 0) {
                  setSelectedMonthIndex(data.activePayload[0].payload.index);
                } else if (data && typeof data.activeTooltipIndex === 'number') {
                  setSelectedMonthIndex(data.activeTooltipIndex);
                }
              }}
            >
              <XAxis 
                dataKey="labelShort" 
                axisLine={false}
                tickLine={false}
                tick={(props: any) => {
                  const { x, y, payload, index } = props;
                  const isSelected = index === selectedMonthIndex;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="middle"
                        fill={isSelected ? 'var(--clr-primary)' : 'var(--clr-text-secondary)'}
                        fontSize={12}
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMonthIndex(index);
                        }}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar 
                dataKey="data.total" 
                barSize={36}
                style={{ outline: 'none', cursor: 'pointer' }}
                background={{ fill: 'transparent', cursor: 'pointer' }}
                onClick={(_, index: number) => {
                  if (typeof index === 'number') {
                    setSelectedMonthIndex(index);
                  }
                }}
                shape={(props: any) => {
                  const { x, y, width, height, index } = props;
                  return (
                    <rect 
                      x={x} 
                      y={y} 
                      width={width} 
                      height={height} 
                      fill={index === selectedMonthIndex ? 'var(--clr-primary)' : 'var(--clr-border)'} 
                      rx={4} 
                      ry={4} 
                      style={{ outline: 'none', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMonthIndex(index);
                      }}
                    />
                  );
                }}
              />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Selected Invoice Details */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ 
          background: isCurrentInvoice ? 'var(--clr-primary)' : 'var(--clr-surface-alt)', 
          color: isCurrentInvoice ? '#fff' : 'var(--clr-text-primary)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--clr-border)'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: isCurrentInvoice ? '#fff' : 'var(--clr-text-primary)' }}>
            <Calendar size={20} color={isCurrentInvoice ? '#fff' : 'currentColor'} />
            {isCurrentInvoice ? `Fatura Atual (${selectedMonthData.labelFull})` : selectedMonthData.labelFull}
          </h3>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedMonthData.data.total)}
          </div>
        </div>
        
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
          {selectedMonthData.data.items.length === 0 ? (
            <div style={{ color: 'var(--clr-text-muted)', textAlign: 'center', padding: 'var(--spacing-md) 0' }}>
              Nenhuma compra no crédito para este mês.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                {selectedMonthData.data.items.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} style={{ borderBottom: idx < selectedMonthData.data.items.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                    <td style={{ padding: 'var(--spacing-sm) 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={16} style={{ color: 'var(--clr-text-secondary)' }} />
                      {item.description}
                      {item.installments > 1 && (
                        <span style={{ fontSize: '0.75rem', background: 'var(--clr-surface-alt)', color: 'var(--clr-text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.installmentNumber}/{item.installments}x
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--spacing-sm) 0', textAlign: 'right', color: 'var(--clr-danger)', fontWeight: 600 }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.installmentValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
