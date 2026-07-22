import { Tags } from 'lucide-react';
import { ExpensesByCategoryChart } from '../../components/dashboard/ExpensesByCategoryChart';
import { DateInput } from '../../components/DateInput';
import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/shared/CustomSelect/CustomSelect';
import { PageHeader } from '../../components/shared/PageHeader';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { useLocale } from '../../store/LocaleContext';
import { useCategoryExpensesViewModel } from './hooks/useCategoryExpensesViewModel';
import { formatPercentage } from '../../utils/numberFormatUtils';
import { CategoryExpenseSummaryCards } from './components/CategoryExpenseSummaryCards';
import './CategoryExpensesPage.css';
import { CategoryExpenseFilterMode } from '../../enums/UIEnums';
import { PeriodContext } from '../../components/shared/PeriodContext';
import { FinanceContentSkeleton } from '../../components/shared/FinanceContentSkeleton';

export function CategoryExpensesPage() {
  const { t, locale } = useLocale();
  const { state, actions } = useCategoryExpensesViewModel();

  if (state.isLoading) {
    return (
      <div className="animate-fade-in category-expenses-page">
        <PageHeader title={t('categoryExpenses.title')} description={t('categoryExpenses.description')} showBackButton={true} />
        <FinanceContentSkeleton variant="categories" />
      </div>
    );
  }

  const monthOptions = Array.from({ length: 12 }, (_, month) => ({
    value: String(month),
    label: new Intl.DateTimeFormat(locale, { month: 'long' })
      .format(new Date(2000, month, 1))
      .replace(/^\p{L}/u, (letter) => letter.toUpperCase()),
  }));
  const yearOptions = [
    state.defaultYear - 2,
    state.defaultYear - 1,
    state.defaultYear,
    state.defaultYear + 1,
    state.defaultYear + 2,
  ].map((year) => ({ value: String(year), label: String(year) }));

  return (
    <div className="animate-fade-in category-expenses-page">
      <PageHeader
        title={t('categoryExpenses.title')}
        description={t('categoryExpenses.description')}
        showBackButton={true}
      />

      <div className="page-section-stack">
        <div className="glass-panel category-expenses-filter-panel">
          <PeriodContext label={state.periodLabel} onAdjust={actions.handleOpenFilters} />
        </div>

        <CategoryExpenseSummaryCards
          formattedTotalExpense={state.formattedTotalExpense}
          formatCurrency={state.formatCurrency}
          topCategory={state.topCategory}
          secondCategory={state.secondCategory}
        />

        {state.categoryData.length === 0 ? (
          <div className="glass-panel category-expenses-empty">
            <Tags size={36} aria-hidden="true" />
            <p>{t('categoryExpenses.empty')}</p>
          </div>
        ) : (
          <div className="category-expenses-grid">
            <ExpensesByCategoryChart
              data={state.categoryData}
              formatCurrency={state.formatCurrency}
              showTotal={false}
              variant="expanded"
            />

            <section className="glass-panel category-expenses-breakdown">
              <h2 className="category-expenses-section-title">{t('categoryExpenses.breakdown')}</h2>
              <ol className="category-expenses-list">
                {state.categoryData.map((category) => (
                  <li key={category.category} className="category-expenses-item">
                    <div className="category-expenses-item-icon" style={{ color: category.color }}>
                      {getCategoryIcon(category.category)}
                    </div>
                    <div className="category-expenses-item-copy">
                      <span className="category-expenses-item-name">{t(category.name)}</span>
                      <span className="category-expenses-item-percent">
                        {formatPercentage(category.percentage, locale)}
                      </span>
                    </div>
                    <span className="category-expenses-item-value">
                      {state.formatCurrency(category.value)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </div>

      <Modal
        isOpen={state.isFilterModalOpen}
        onClose={actions.handleCloseFilters}
        title={t('filters.title')}
      >
        <div className="form-group">
          <label className="form-label">{t('filters.filterBy')}</label>
          <div className="category-expenses-mode-options">
            <button
              type="button"
              className={`btn flex-1 ${state.tempFilterMode === CategoryExpenseFilterMode.MONTH ? 'btn-primary' : 'btn-alt-bg'}`}
              onClick={() => actions.setTempFilterMode(CategoryExpenseFilterMode.MONTH)}
            >
              {t('categoryExpenses.monthMode')}
            </button>
            <button
              type="button"
              className={`btn flex-1 ${state.tempFilterMode === CategoryExpenseFilterMode.RANGE ? 'btn-primary' : 'btn-alt-bg'}`}
              onClick={() => actions.setTempFilterMode(CategoryExpenseFilterMode.RANGE)}
            >
              {t('categoryExpenses.rangeMode')}
            </button>
          </div>
        </div>

        {state.tempFilterMode === CategoryExpenseFilterMode.MONTH ? (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('filters.month')}</label>
              <CustomSelect
                value={String(state.tempSelectedMonth)}
                onChange={(value) => actions.setTempSelectedMonth(Number(value))}
                options={monthOptions}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('filters.year')}</label>
              <CustomSelect
                value={String(state.tempSelectedYear)}
                onChange={(value) => actions.setTempSelectedYear(Number(value))}
                options={yearOptions}
              />
            </div>
          </div>
        ) : (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="category-expenses-start-date">
                {t('categoryExpenses.startDate')}
              </label>
              <DateInput
                id="category-expenses-start-date"
                className="form-input"
                value={state.startDateValue}
                onChangeValue={actions.setTempStartDateValue}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="category-expenses-end-date">
                {t('categoryExpenses.endDate')}
              </label>
              <DateInput
                id="category-expenses-end-date"
                className="form-input"
                value={state.endDateValue}
                onChangeValue={actions.setTempEndDateValue}
                required
              />
            </div>
          </div>
        )}

        {state.filterErrorKey && (
          <p className="category-expenses-filter-error" role="alert">
            {t(state.filterErrorKey)}
          </p>
        )}

        <div className="modal-actions-filters category-expenses-filter-actions">
          <button type="button" className="btn flex-1 btn-alt-bg" onClick={actions.handleResetFilters}>
            {t('filters.reset')}
          </button>
          <button type="button" className="btn btn-primary category-expenses-apply" onClick={actions.handleApplyFilters}>
            {t('filters.apply')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
