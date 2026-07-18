import { useForecastViewModel } from './hooks/useForecastViewModel';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { PageHeader } from '../../components/shared/PageHeader';
import './ForecastPage.css';

export function ForecastPage() {
  const { state, actions } = useForecastViewModel();
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
        title="Previsões e Cenários"
        description="Simule o futuro do seu saldo baseando-se nos seus planejamentos."
        showBackButton={true}
      />

      <div className="forecast-content">
        <div className="glass-panel p-lg">
          <div className="form-row mb-lg">
            <div className="form-group forecast-form-group">
              <label className="form-label">Início da Projeção</label>
              <select
                className="form-select"
                value={startMonthOffset}
                onChange={(e) => setStartMonthOffset(Number(e.target.value))}
              >
                <option value={-3}>3 meses atrás</option>
                <option value={-1}>1 mês atrás</option>
                <option value={0}>Mês Atual</option>
                <option value={1}>Próximo Mês</option>
              </select>
            </div>

            <div className="form-group forecast-form-group">
              <label className="form-label">Período Visível (Meses)</label>
              <select
                className="form-select"
                value={monthsToProject}
                onChange={(e) => setMonthsToProject(Number(e.target.value))}
              >
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
              </select>
            </div>
          </div>

          <div className="forecast-options-section">
            <h3 className="forecast-options-title">O que incluir no futuro?</h3>

            <div className="forecast-options-container">
              <label className="forecast-checkbox-label">
                <input
                  type="checkbox"
                  checked={includePlannedIncome}
                  onChange={(e) => setIncludePlannedIncome(e.target.checked)}
                  className="forecast-checkbox"
                />
                <span>Entradas Planejadas</span>
              </label>

              <label className="forecast-checkbox-label">
                <input
                  type="checkbox"
                  checked={includePlannedExpense}
                  onChange={(e) => setIncludePlannedExpense(e.target.checked)}
                  className="forecast-checkbox"
                />
                <span>Gastos Planejados</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <DashboardChart
            data={chartData.data}
            formatCurrency={formatCurrency}
            title="Projeção do Saldo"
          />
        </div>
      </div>
    </div>
  );
}
