import { Plus } from 'lucide-react';
import { CustomSelect } from '../../components/shared/CustomSelect/CustomSelect';
import { Modal } from '../../components/Modal';
import { PlannedExpenseForm } from '../../components/PlannedExpenseForm';
import { TransactionForm } from '../../components/TransactionForm';
import type { PlannedExpense } from '../../types';
import { ExpenseCategory, FilterType, IncomeCategory, PaymentMethod, TransactionType } from '../../enums/FinanceEnums';
import { FilterTabs } from '../../components/shared/FilterTabs';
import { PlannedExpenseTable } from './components/PlannedExpenseTable';
import { usePlannedExpensesViewModel } from './hooks/usePlannedExpensesViewModel';
import { PageHeader } from '../../components/shared/PageHeader';
import { useLocale } from '../../store/LocaleContext';
import { PeriodSummaryCards } from '../../components/shared/PeriodSummaryCards';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { FilterTypeTabs } from '../../components/shared/FilterTypeTabs';
import './PlannedExpensesPage.css';

export function PlannedExpensesPage() {
  const { state, actions } = usePlannedExpensesViewModel();
  const { locale, t } = useLocale();
  const categoryOptions = [...new Set([...Object.values(ExpenseCategory), ...Object.values(IncomeCategory)])];

  return (
    <div className="animate-fade-in planned-expenses-page">
      <PageHeader 
        title={t('planning.title')}
        description={t('planning.description')}
        primaryButton={{
          label: t('planning.new'),
          icon: <Plus size={18} className="mr-sm" />,
          onClick: actions.openNewModal
        }}
      />

      <FilterTypeTabs filter={state.filter} setFilter={actions.setFilter} />

      <FilterTabs
        searchQuery={state.searchQuery}
        setSearchQuery={actions.setSearchQuery}
        onOpenFilters={actions.handleOpenFilters}
        activeDateLabel={state.filterLabel}
        activeCategoryLabel={state.categoryFilter !== 'all' ? t(`categories.${state.categoryFilter}`) : undefined}
      />

      <PeriodSummaryCards
        income={state.totalIncome}
        expense={state.totalExpense}
      />


      <div className="glass-panel panel-no-padding">
        <PlannedExpenseTable 
          expenses={state.pendingExpenses as PlannedExpense[]}
          onConfirm={actions.handleConfirmPrompt}
          onReject={actions.rejectAction}
          onEdit={actions.openEditModal}
          onDelete={actions.handleDeletePrompt}
        />
      </div>

      <button className="btn btn-primary fab hide-on-desktop" onClick={actions.openNewModal}>
        <Plus size={28} />
      </button>

      <Modal isOpen={state.isModalOpen} onClose={() => { actions.setIsModalOpen(false); actions.setEditingExpense(null); }} title={state.editingExpense ? t('common.edit') : t('planning.new')}>
        <PlannedExpenseForm 
          onSubmit={actions.handleAddOrUpdate} 
          initialData={state.editingExpense || undefined} 
          defaultType={state.filter === FilterType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE}
        />
      </Modal>

      <Modal isOpen={!!state.expenseToConfirm} onClose={() => actions.setExpenseToConfirm(null)} title={state.expenseToConfirm?.type === TransactionType.INCOME ? t('planning.confirmReceipt') : t('planning.confirmPayment')}>
        {state.expenseToConfirm && (
          <TransactionForm 
            onSubmit={actions.confirmAction} 
            initialData={{
              description: state.expenseToConfirm.description,
              amount: state.expenseToConfirm.amount,
              date: state.expenseToConfirm.dueDate,
              type: state.expenseToConfirm.type || TransactionType.EXPENSE,
              paymentMethod: PaymentMethod.PIX,
              installments: 1
            }}
            defaultType={state.expenseToConfirm.type || TransactionType.EXPENSE}
          />
        )}
      </Modal>

      <Modal isOpen={!!state.expenseToDelete} onClose={() => actions.setExpenseToDelete(null)} title={t('transactions.deleteTitle')}>
        <div className="delete-modal-content">
          <p className="delete-modal-text">{t('planning.deleteQuestion')}</p>
          <p className="delete-modal-subtext">{t('common.irreversible')}</p>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => actions.setExpenseToDelete(null)}>{t('common.cancel')}</button>
          <button 
            className="btn btn-primary btn-danger-bg" 
            onClick={actions.confirmDelete}
          >
            {t('common.delete')}
          </button>
        </div>
      </Modal>

      <Modal isOpen={state.isFilterModalOpen} onClose={() => actions.setIsFilterModalOpen(false)} title={t('filters.title')}>
        <div className="form-group">
          <label className="form-label">{t('form.category')}</label>
          <CustomSelect
            value={state.tempCategoryFilter}
            onChange={actions.setTempCategoryFilter}
            options={[
              { value: 'all', label: t('filters.allCategories') },
              ...categoryOptions.map(category => ({
                value: category,
                label: t(`categories.${category}`),
                icon: getCategoryIcon(category)
              }))
            ]}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('filters.month')}</label>
            <CustomSelect
              value={String(state.tempSelectedMonth)}
              onChange={(val) => actions.setTempSelectedMonth(val === 'all' ? 'all' : Number(val))}
              options={[
                { value: 'all', label: t('filters.fullYear') },
                ...Array.from({ length: 12 }).map((_, i) => ({
                  value: String(i),
                  label: new Date(2000, i, 1).toLocaleString(locale, { month: 'long' }).replace(/^\w/, c => c.toUpperCase())
                }))
              ]}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('filters.year')}</label>
            <CustomSelect
              value={String(state.tempSelectedYear)}
              onChange={(val) => actions.setTempSelectedYear(Number(val))}
              options={[
                state.defaultYear - 1,
                state.defaultYear,
                state.defaultYear + 1
              ].map(y => ({ value: String(y), label: String(y) }))}
            />
          </div>
        </div>

        <div className="modal-actions-filters">
          <button className="btn flex-1 btn-alt-bg" onClick={actions.handleResetFilters}>
            {t('filters.reset')}
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={actions.handleApplyFilters}>
            {t('filters.apply')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
