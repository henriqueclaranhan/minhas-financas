import { useForecastViewModel } from './hooks/useForecastViewModel';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { PageHeader } from '../../components/shared/PageHeader';
import { CustomSelect } from '../../components/shared/CustomSelect/CustomSelect';
import { Modal } from '../../components/Modal';
import { format, parseISO } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useLocale } from '../../store/LocaleContext';
import { PeriodSummaryCards } from '../../components/shared/PeriodSummaryCards';
import '../../components/shared/FilterTabs/FilterTabs.css';
import './ForecastPage.css';
import { ForecastFilterMode } from '../../enums/UIEnums';
import { PeriodContext } from '../../components/shared/PeriodContext';

export function ForecastPage() {
  const { state, actions } = useForecastViewModel();
  const { t } = useLocale();
  const {
    chartData,
    includePlannedIncome,
    includePlannedExpense,
    startDate,
    endDate,
    formatCurrency,
    isFilterModalOpen,
    tempStartDate,
    tempEndDate,
    filterType,
    selectedYear,
    tempFilterType,
    tempSelectedYear,
    totalIncome,
    totalExpense,
  } = state;
  const {
    setIncludePlannedIncome,
    setIncludePlannedExpense,
    setIsFilterModalOpen,
    setTempStartDate,
    setTempEndDate,
    setTempFilterType,
    handleOpenFilters,
    handleApplyFilters,
    handleResetFilters,
    handleSelectYear,
  } = actions;

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear + 1), label: String(currentYear + 1) },
    { value: String(currentYear + 2), label: String(currentYear + 2) },
  ];

  return (
    <div className="animate-fade-in forecast-page">
      <PageHeader
        title={t('forecast.title')}
        description={t('forecast.description')}
        showBackButton={true}
      />

      <PeriodSummaryCards 
        income={totalIncome} 
        expense={totalExpense} 
      />

      <div className="forecast-content">
        <div className="glass-panel filter-tabs-panel">
          <PeriodContext
            label={filterType === ForecastFilterMode.YEAR
              ? String(selectedYear)
              : `${format(startDate, 'MM/yyyy')} – ${format(endDate, 'MM/yyyy')}`}
            onAdjust={handleOpenFilters}
          />

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

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title={t('filters.title')}>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">{t('filters.filterBy', { defaultValue: 'Filtrar por' })}</label>
          <div className="flex gap-sm">
            <button 
              type="button"
              className={`btn flex-1 ${tempFilterType === ForecastFilterMode.YEAR ? 'btn-primary' : 'btn-alt-bg'}`} 
              onClick={() => setTempFilterType(ForecastFilterMode.YEAR)}
            >
              {t('filters.year', { defaultValue: 'Ano' })}
            </button>
            <button 
              type="button"
              className={`btn flex-1 ${tempFilterType === ForecastFilterMode.PERIOD ? 'btn-primary' : 'btn-alt-bg'}`} 
              onClick={() => setTempFilterType(ForecastFilterMode.PERIOD)}
            >
              {t('filters.period', { defaultValue: 'Período' })}
            </button>
          </div>
        </div>

        {tempFilterType === ForecastFilterMode.YEAR ? (
          <div className="form-group">
            <label className="form-label">{t('filters.year', { defaultValue: 'Ano' })}</label>
            <CustomSelect 
              value={String(tempSelectedYear)}
              onChange={handleSelectYear}
              options={yearOptions}
            />
          </div>
        ) : (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('forecast.start')}</label>
              <input 
                type="month" 
                className="form-input" 
                value={format(tempStartDate, 'yyyy-MM')} 
                onChange={(e) => { if (e.target.value) setTempStartDate(parseISO(`${e.target.value}-01`)) }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('forecast.end', { defaultValue: 'Fim' })}</label>
              <input 
                type="month" 
                className="form-input" 
                value={format(tempEndDate, 'yyyy-MM')} 
                onChange={(e) => { if (e.target.value) setTempEndDate(parseISO(`${e.target.value}-01`)) }}
                min={format(tempStartDate, 'yyyy-MM')}
              />
            </div>
          </div>
        )}

        <div className="modal-actions-filters" style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          <button className="btn flex-1 btn-alt-bg" onClick={handleResetFilters}>
            {t('filters.reset')}
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleApplyFilters}>
            {t('filters.apply')}
          </button>
        </div>
      </Modal>
    </div>
  );
}


