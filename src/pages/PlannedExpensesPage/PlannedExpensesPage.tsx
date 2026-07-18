import { Plus } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { PlannedExpenseForm } from '../../components/PlannedExpenseForm';
import { TransactionForm } from '../../components/TransactionForm';
import type { PlannedExpense } from '../../types';
import { FilterType, TransactionType } from '../../enums/FinanceEnums';
import { FilterTabs } from '../../components/shared/FilterTabs';
import { PlannedExpenseTable } from './components/PlannedExpenseTable';
import { usePlannedExpensesViewModel } from './hooks/usePlannedExpensesViewModel';
import { PageHeader } from '../../components/shared/PageHeader';
import { useLocale } from '../../store/LocaleContext';
import './PlannedExpensesPage.css';

export function PlannedExpensesPage() {
  const { state, actions } = usePlannedExpensesViewModel();
  const { formatCurrency, locale, t } = useLocale();

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={t('planning.title')}
        description={t('planning.description')}
        primaryButton={{
          label: t('planning.new'),
          icon: <Plus size={18} className="mr-sm" />,
          onClick: actions.openNewModal
        }}
      />

      <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--clr-success)' }}>
          <p className="text-secondary" style={{ margin: '0 0 4px 0', fontSize: '0.875rem' }}>{t('transactions.incomePeriod')}</p>
          <h3 style={{ margin: 0, color: 'var(--clr-success)' }}>
            {formatCurrency(state.totalIncome)}
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--clr-danger)' }}>
          <p className="text-secondary" style={{ margin: '0 0 4px 0', fontSize: '0.875rem' }}>{t('transactions.expensePeriod')}</p>
          <h3 style={{ margin: 0, color: 'var(--clr-danger)' }}>
            {formatCurrency(state.totalExpense)}
          </h3>
        </div>
      </div>

      <FilterTabs 
        filter={state.filter}
        setFilter={actions.setFilter}
        searchQuery={state.searchQuery}
        setSearchQuery={actions.setSearchQuery}
        onOpenFilters={actions.handleOpenFilters}
        activeDateLabel={state.filterLabel}
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

      <Modal isOpen={!!state.expenseToConfirm} onClose={() => actions.setExpenseToConfirm(null)} title={state.expenseToConfirm?.type === 'income' ? t('planning.confirmReceipt') : t('planning.confirmPayment')}>
        {state.expenseToConfirm && (
          <TransactionForm 
            onSubmit={actions.confirmAction} 
            initialData={{
              description: state.expenseToConfirm.description,
              amount: state.expenseToConfirm.amount,
              date: state.expenseToConfirm.dueDate,
              type: state.expenseToConfirm.type || 'expense',
              paymentMethod: state.expenseToConfirm.type === 'income' ? 'Pix' : 'Pix',
              installments: 1
            }}
            defaultType={state.expenseToConfirm.type || 'expense'}
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
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('filters.month')}</label>
            <select className="form-select" value={state.tempSelectedMonth} onChange={(e) => actions.setTempSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
              <option value="all">{t('filters.fullYear')}</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString(locale, { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('filters.year')}</label>
            <select className="form-select" value={state.tempSelectedYear} onChange={(e) => actions.setTempSelectedYear(Number(e.target.value))}>
              {[state.defaultYear - 1, state.defaultYear, state.defaultYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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
