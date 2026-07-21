import { useEffect, useRef } from 'react';
import { CreditCard, Calendar, Plus } from 'lucide-react';
import { CreateFinanceEntryModal } from '../../components/shared/CreateFinanceEntryModal';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCreditCardViewModel } from './hooks/useCreditCardViewModel';
import { PageHeader } from '../../components/shared/PageHeader';
import { useLocale } from '../../store/LocaleContext';
import './CreditCardPage.css';
import { FinanceEntryMode } from '../../enums/UIEnums';
import { PeriodContext } from '../../components/shared/PeriodContext';
import { TemporalFilterModal } from '../../components/shared/TemporalFilterModal';
import { FinanceContentSkeleton } from '../../components/shared/FinanceContentSkeleton';

export function CreditCardPage() {
  const { state, actions } = useCreditCardViewModel();
  const { formatCurrency, t } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 120, behavior: 'smooth' });
    }
  }, []);

  if (state.isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={t('invoices.title')} description={t('invoices.description')} />
        <FinanceContentSkeleton variant="credit" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel hide-on-mobile p-md">
          <p className="font-bold credit-card-tooltip-title">{payload[0].payload.labelFull}</p>
          <p className="text-danger credit-card-tooltip-value">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={t('invoices.title')}
        description={t('invoices.description')}
      />

      <div className="glass-panel filter-tabs-panel temporal-filter-panel">
        <PeriodContext label={state.temporal.label} onAdjust={actions.temporal.open} />
      </div>

      <div className="glass-panel p-lg mb-lg">
        <h3 className="credit-card-chart-title mb-md">{t('invoices.chartTitle')}</h3>
        <div ref={scrollRef} className="w-full credit-card-scroll-wrapper">
          <div className="credit-card-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={state.nextMonths} 
                className="credit-card-interactive"
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload.length > 0) {
                    actions.setSelectedMonthIndex(data.activePayload[0].payload.index);
                  } else if (data && typeof data.activeTooltipIndex === 'number') {
                    actions.setSelectedMonthIndex(data.activeTooltipIndex);
                  }
                }}
              >
                <XAxis 
                  dataKey="labelShort" 
                  axisLine={false}
                  tickLine={false}
                  tick={(props: any) => {
                    const { x, y, payload, index } = props;
                    const isSelected = index === state.selectedMonthIndex;
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
                            actions.setSelectedMonthIndex(index);
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
                      actions.setSelectedMonthIndex(index);
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
                        fill={index === state.selectedMonthIndex ? 'var(--clr-primary)' : 'var(--clr-border)'} 
                        rx={4} 
                        ry={4} 
                        className="credit-card-interactive"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.setSelectedMonthIndex(index);
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

      <div className="glass-panel invoice-details-panel">
        <div className="invoice-header-panel">
          <h3 className="invoice-header-title">
            <Calendar className="invoice-icon" />
            <span>{state.selectedMonthData?.labelFull}</span>
            {state.isCurrentInvoice && (
              <span className="badge-installments credit-card-badge-current">{t('invoices.current')}</span>
            )}
          </h3>
          <div className="invoice-header-total">
            {formatCurrency(state.selectedMonthData?.data.total || 0)}
          </div>
        </div>
        
        <div className="invoice-table-wrapper">
          {!state.selectedMonthData || state.selectedMonthData.data.items.length === 0 ? (
            <div className="text-muted text-center credit-card-empty-state">
              {t('invoices.empty')}
            </div>
          ) : (
            <div className="credit-card-table-wrapper">
              <table className="data-table credit-card-table">
                <thead>
                  <tr>
                    <th className="col-desc">{t('common.description')}</th>
                    <th className="col-amount text-right">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.selectedMonthData.data.items.map((item, idx) => (
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
                        {formatCurrency(item.installmentValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <button 
        className="btn btn-primary fab hide-on-desktop" 
        onClick={() => { actions.setIsModalOpen(true); actions.setActionType(FinanceEntryMode.NONE); }}
      >
        <Plus size={28} />
      </button>

      <CreateFinanceEntryModal
        isOpen={state.isModalOpen} 
        onClose={() => { actions.setIsModalOpen(false); setTimeout(() => actions.setActionType(FinanceEntryMode.NONE), 300); }} 
        mode={state.actionType}
        onModeChange={actions.setActionType}
        onTransactionSubmit={actions.handleTransactionAdd}
        onPlanningSubmit={actions.handlePlanningAdd}
      />

      <TemporalFilterModal
        isOpen={state.temporal.isOpen}
        onClose={() => actions.temporal.setIsOpen(false)}
        mode={state.temporal.tempMode}
        setMode={actions.temporal.setTempMode}
        month={state.temporal.tempMonth}
        setMonth={actions.temporal.setTempMonth}
        year={state.temporal.tempYear}
        setYear={actions.temporal.setTempYear}
        startDate={state.temporal.tempStartDate}
        setStartDate={actions.temporal.setTempStartDate}
        endDate={state.temporal.tempEndDate}
        setEndDate={actions.temporal.setTempEndDate}
        defaultYear={state.temporal.defaultYear}
        onReset={actions.temporal.reset}
        onApply={actions.temporal.apply}
      />
    </div>
  );
}
