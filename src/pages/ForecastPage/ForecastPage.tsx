import { useForecastViewModel } from './hooks/useForecastViewModel';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { PageHeader } from '../../components/shared/PageHeader';
import { CustomSelect } from '../../components/shared/CustomSelect/CustomSelect';
import './ForecastPage.css';
import { useLocale } from '../../store/LocaleContext';

export function ForecastPage() {
  const { state, actions } = useForecastViewModel();
  const { t } = useLocale();
  const {
    chartData,
    includePlannedIncome,
    includePlannedExpense,
    monthsToProject,
    startMonthOffset,
    formatCurrency,
  } = state;
  const {
    setIncludePlannedIncome,
    setIncludePlannedExpense,
    setMonthsToProject,
    setStartMonthOffset,
  } = actions;

  return (
    <div className="animate-fade-in forecast-page">
      <PageHeader
        title={t('forecast.title')}
        description={t('forecast.description')}
        showBackButton={true}
      />

      <div className="forecast-content">
        <div className="glass-panel p-lg">
          <div className="form-row mb-lg">
            <div className="form-group forecast-form-group">
              <label className="form-label">{t('forecast.start')}</label>
              <CustomSelect
                value={String(startMonthOffset)}
                onChange={(val) => setStartMonthOffset(Number(val))}
                options={[
                  { value: '-3', label: t('forecast.threeMonthsAgo') },
                  { value: '-1', label: t('forecast.oneMonthAgo') },
                  { value: '0', label: t('forecast.currentMonth') },
                  { value: '1', label: t('forecast.nextMonth') }
                ]}
              />
            </div>

            <div className="form-group forecast-form-group">
              <label className="form-label">{t('forecast.visiblePeriod')}</label>
              <CustomSelect
                value={String(monthsToProject)}
                onChange={(val) => setMonthsToProject(Number(val))}
                options={[3, 6, 12, 24].map((count) => ({
                  value: String(count),
                  label: t('forecast.monthCount', { count })
                }))}
              />
            </div>
          </div>

          <div className="forecast-options-section">
            <h3 className="forecast-options-title">{t('forecast.include')}</h3>

            <div className="forecast-options-container">
              <label className="forecast-checkbox-label">
                <input
                  type="checkbox"
                  checked={includePlannedIncome}
                  onChange={(e) => setIncludePlannedIncome(e.target.checked)}
                  className="forecast-checkbox"
                />
                <span>{t('forecast.plannedIncome')}</span>
              </label>

              <label className="forecast-checkbox-label">
                <input
                  type="checkbox"
                  checked={includePlannedExpense}
                  onChange={(e) => setIncludePlannedExpense(e.target.checked)}
                  className="forecast-checkbox"
                />
                <span>{t('forecast.plannedExpense')}</span>
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
    </div>
  );
}
