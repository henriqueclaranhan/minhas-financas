import { useMemo, useState, useEffect, useRef } from 'react';
import { useFinance } from '../store/FinanceContext';
import { parseISO, addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../types';
import './CreditCardPage.css';

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
        <div className="glass-panel hide-on-mobile p-md">
          <p className="font-bold credit-card-tooltip-title">{payload[0].payload.labelFull}</p>
          <p className="text-danger credit-card-tooltip-value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-lg">
        <h1>Faturas e Previsões</h1>
        <p className="text-secondary">Acompanhe os gastos no cartão de crédito nos próximos meses.</p>
      </header>

      {/* Chart Section */}
      <div className="glass-panel p-lg mb-lg">
        <h3 className="credit-card-chart-title mb-md">Evolução das Faturas</h3>
        <div ref={scrollRef} className="w-full credit-card-scroll-wrapper">
          <div className="credit-card-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
              data={nextMonths} 
              className="credit-card-interactive"
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
                        className="credit-card-label"
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
              <Tooltip content={<CustomTooltip />} cursor={false} wrapperClassName="hide-on-mobile" />
              <Bar 
                dataKey="data.total" 
                barSize={56}
                className="credit-card-interactive"
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
                      className="credit-card-interactive"
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
      <div className="glass-panel invoice-details-panel">
        <div className="invoice-header-panel">
          <h3 className="invoice-header-title">
            <Calendar className="invoice-icon" />
            <span>{selectedMonthData.labelFull}</span>
            {isCurrentInvoice && (
              <span className="badge-installments credit-card-badge-current">Atual</span>
            )}
          </h3>
          <div className="invoice-header-total">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedMonthData.data.total)}
          </div>
        </div>
        
        <div className="invoice-table-wrapper">
          {selectedMonthData.data.items.length === 0 ? (
            <div className="text-muted text-center credit-card-empty-state">
              Nenhuma compra no crédito para este mês.
            </div>
          ) : (
            <div className="credit-card-table-wrapper">
              <table className="data-table credit-card-table">
                <thead>
                  <tr>
                    <th className="col-desc">Descrição</th>
                    <th className="col-amount text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthData.data.items.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`}>
                      <td className="td-bold td-flex-center">
                        <CreditCard size={16} className="icon-secondary-shrink" />
                        <span>{item.description}</span>
                        {item.installments > 1 && (
                          <span className="badge-installments">
                            {item.installmentNumber}/{item.installments}x
                          </span>
                        )}
                      </td>
                      <td className="td-amount-expense text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.installmentValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
