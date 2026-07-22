import { useForecastViewModel } from './hooks/useForecastViewModel';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { PageHeader } from '../../components/shared/PageHeader';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useLocale } from '../../store/LocaleContext';
import { PeriodSummaryCards } from '../../components/shared/PeriodSummaryCards';
import '../../components/shared/FilterTabs/FilterTabs.css';
import './ForecastPage.css';
import { PeriodContext } from '../../components/shared/PeriodContext';
import { TemporalFilterModal } from '../../components/shared/TemporalFilterModal';
import { FinanceContentSkeleton } from '../../components/shared/FinanceContentSkeleton';

export function ForecastPage() {
  const { state, actions } = useForecastViewModel();
  const { t } = useLocale();
  const {
    chartData,
    includePlannedIncome,
    includePlannedExpense,
    formatCurrency,
    temporal,
    totalIncome,
    totalExpense,
    isLoading,
  } = state;
  const {
    setIncludePlannedIncome,
    setIncludePlannedExpense,
    temporal: temporalActions,
  } = actions;

  if (isLoading) {
    return (
      <div className="animate-fade-in forecast-page">
        <PageHeader title={t('forecast.title')} description={t('forecast.description')} showBackButton={true} />
        <FinanceContentSkeleton variant="forecast" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in forecast-page">
      <PageHeader
        title={t('forecast.title')}
        description={t('forecast.description')}
        showBackButton={true}
      />

      <div className="forecast-content page-section-stack">
        <div className="glass-panel filter-tabs-panel temporal-filter-panel">
          <PeriodContext
            label={temporal.label}
            onAdjust={temporalActions.open}
          />
        </div>

        <PeriodSummaryCards
          income={totalIncome}
          expense={totalExpense}
        />

        <div className="glass-panel filter-tabs-panel forecast-projection-filters">
          <div className="filter-tabs-container">
            <div className="btn filter-tab-btn filter-tab-btn-inactive" style={{ padding: '8px 16px', cursor: 'default' }}>
              <label className="forecast-checkbox-label" style={{ margin: 0, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includePlannedIncome}
                  onChange={(e) => setIncludePlannedIncome(e.target.checked)}
                  className="forecast-checkbox"
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpCircle size={16} /> {t('forecast.plannedIncome')}
                </span>
              </label>
            </div>
            
            <div className="btn filter-tab-btn filter-tab-btn-inactive" style={{ padding: '8px 16px', cursor: 'default' }}>
              <label className="forecast-checkbox-label" style={{ margin: 0, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includePlannedExpense}
                  onChange={(e) => setIncludePlannedExpense(e.target.checked)}
                  className="forecast-checkbox"
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowDownCircle size={16} /> {t('forecast.plannedExpense')}
                </span>
              </label>
            </div>
          </div>

        </div>

        <div>
          <DashboardChart
            data={chartData.data}
            formatCurrency={formatCurrency}
            title={t('forecast.balanceProjection')}
          />
        </div>
      </div>

      <TemporalFilterModal
        isOpen={temporal.isOpen}
        onClose={() => temporalActions.setIsOpen(false)}
        mode={temporal.tempMode}
        setMode={temporalActions.setTempMode}
        month={temporal.tempMonth}
        setMonth={temporalActions.setTempMonth}
        year={temporal.tempYear}
        setYear={temporalActions.setTempYear}
        startDate={temporal.tempStartDate}
        setStartDate={temporalActions.setTempStartDate}
        endDate={temporal.tempEndDate}
        setEndDate={temporalActions.setTempEndDate}
        defaultYear={temporal.defaultYear}
        onReset={temporalActions.reset}
        onApply={temporalActions.apply}
      />
    </div>
  );
}
