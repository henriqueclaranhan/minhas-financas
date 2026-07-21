import { FilterType } from '../../enums/FinanceEnums';
import { FilterTabs } from '../../components/shared/FilterTabs';
import { TransactionTable } from './components/TransactionTable';
import { TransactionForm } from '../../components/TransactionForm';
import { Modal } from '../../components/Modal';
import { Plus } from 'lucide-react';
import { CustomSelect } from '../../components/shared/CustomSelect/CustomSelect';
import { getCategoryIcon, getPaymentMethodIcon } from '../../utils/categoryIcons';
import type { Transaction } from '../../types';
import { ExpenseCategory, IncomeCategory, PaymentMethod } from '../../enums/FinanceEnums';
import { useTransactionsViewModel } from './hooks/useTransactionsViewModel';
import { PageHeader } from '../../components/shared/PageHeader';
import { useLocale } from '../../store/LocaleContext';
import { PeriodSummaryCards } from '../../components/shared/PeriodSummaryCards';
import './TransactionsPage.css';

export function TransactionsPage() {
  const { state, actions } = useTransactionsViewModel();
  const { locale, t } = useLocale();
  const categoryOptions = [...new Set([...Object.values(ExpenseCategory), ...Object.values(IncomeCategory)])];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={t('transactions.title')}
        description={t('transactions.description')}
        primaryButton={{
          label: t('transactions.new'),
          icon: <Plus size={18} className="mr-sm" />,
          onClick: actions.openNewModal
        }}
      />

      <PeriodSummaryCards 
        income={state.totalIncome} 
        expense={state.totalExpense} 
      />

      <FilterTabs 
        filter={state.filter}
        setFilter={actions.setFilter}
        searchQuery={state.searchQuery}
        setSearchQuery={actions.setSearchQuery}
        onOpenFilters={actions.handleOpenFilters}
        activeDateLabel={state.filterLabel}
        activeMethodLabel={state.methodFilter !== 'all' ? state.methodFilter : undefined}
        activeCategoryLabel={state.categoryFilter !== 'all' ? t(`categories.${state.categoryFilter}`) : undefined}
      />
      
      <div className="glass-panel panel-no-padding">
        <TransactionTable 
          transactions={state.transactions as Transaction[]}
          onEdit={actions.openEditModal}
          onDelete={(id) => {
            const t = state.transactions.find(tx => tx.id === id);
            actions.setTransactionToDelete(t?.originalId || id);
          }}
        />
      </div>

      {/* Mobile FAB */}
      <button className="btn btn-primary fab hide-on-desktop" onClick={actions.openNewModal}>
        <Plus size={28} />
      </button>

      <Modal isOpen={state.isModalOpen} onClose={() => { actions.setIsModalOpen(false); actions.setEditingTransaction(null); }} title={state.editingTransaction ? `${t('common.edit')} ${t('nav.transactions')}` : t('transactions.new')}>
        <TransactionForm 
          onSubmit={actions.handleAddOrUpdate} 
          initialData={state.editingTransaction || undefined} 
          defaultType={state.filter === FilterType.INCOME ? 'income' : 'expense'}
        />
      </Modal>

      <Modal isOpen={!!state.transactionToDelete} onClose={() => actions.setTransactionToDelete(null)} title={t('transactions.deleteTitle')}>
        <div className="delete-modal-content">
          <p className="delete-modal-text">{t('transactions.deleteQuestion')}</p>
          <p className="delete-modal-subtext">{t('common.irreversible')}</p>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => actions.setTransactionToDelete(null)}>{t('common.cancel')}</button>
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

        <div className="form-group">
            <label className="form-label">{t('common.paymentMethod')}</label>
            <CustomSelect
              value={state.tempMethodFilter}
              onChange={actions.setTempMethodFilter}
              options={[
                { value: 'all', label: t('filters.allMethods') },
                { value: PaymentMethod.CREDIT, label: t('form.credit'), icon: getPaymentMethodIcon(PaymentMethod.CREDIT) },
                { value: PaymentMethod.DEBIT, label: t('form.debit'), icon: getPaymentMethodIcon(PaymentMethod.DEBIT) },
                { value: PaymentMethod.PIX, label: t('form.pix'), icon: getPaymentMethodIcon(PaymentMethod.PIX) },
                { value: PaymentMethod.CASH, label: t('form.cash'), icon: getPaymentMethodIcon(PaymentMethod.CASH) },
                { value: PaymentMethod.TRANSFER, label: t('form.transfer'), icon: getPaymentMethodIcon(PaymentMethod.TRANSFER) },
                { value: PaymentMethod.BOLETO, label: t('form.boleto'), icon: getPaymentMethodIcon(PaymentMethod.BOLETO) },
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
