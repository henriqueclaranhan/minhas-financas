import { FilterType } from '../../enums/FinanceEnums';
import { FilterTabs } from '../../components/shared/FilterTabs';
import { TransactionTable } from './components/TransactionTable';
import { TransactionForm } from '../../components/TransactionForm';
import { Modal } from '../../components/Modal';
import { Plus } from 'lucide-react';
import type { Transaction } from '../../types';
import { useTransactionsViewModel } from './hooks/useTransactionsViewModel';
import './TransactionsPage.css';

export function TransactionsPage() {
  const { state, actions } = useTransactionsViewModel();

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Histórico de Transações</h1>
          <p className="text-secondary">Todas as suas entradas e saídas.</p>
        </div>
        {/* Desktop Button */}
        <button 
          className="btn btn-primary hover-glow hide-on-mobile" 
          onClick={actions.openNewModal}
        >
          <Plus size={18} className="mr-sm" /> Nova Transação
        </button>
      </header>

      <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--clr-success)' }}>
          <p className="text-secondary" style={{ margin: '0 0 4px 0', fontSize: '0.875rem' }}>Entradas no Período</p>
          <h3 style={{ margin: 0, color: 'var(--clr-success)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.totalIncome)}
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--clr-danger)' }}>
          <p className="text-secondary" style={{ margin: '0 0 4px 0', fontSize: '0.875rem' }}>Saídas no Período</p>
          <h3 style={{ margin: 0, color: 'var(--clr-danger)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.totalExpense)}
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
        activeMethodLabel={state.methodFilter !== 'all' ? state.methodFilter : undefined}
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

      <Modal isOpen={state.isModalOpen} onClose={() => { actions.setIsModalOpen(false); actions.setEditingTransaction(null); }} title={state.editingTransaction ? "Editar Transação" : "Nova Transação"}>
        <TransactionForm 
          onSubmit={actions.handleAddOrUpdate} 
          initialData={state.editingTransaction || undefined} 
          defaultType={state.filter === FilterType.INCOME ? 'income' : 'expense'}
        />
      </Modal>

      <Modal isOpen={!!state.transactionToDelete} onClose={() => actions.setTransactionToDelete(null)} title="Confirmar Exclusão">
        <div className="delete-modal-content">
          <p className="delete-modal-text">Tem certeza que deseja apagar esta transação?</p>
          <p className="delete-modal-subtext">Esta ação não pode ser desfeita.</p>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => actions.setTransactionToDelete(null)}>Cancelar</button>
          <button 
            className="btn btn-primary btn-danger-bg" 
            onClick={actions.confirmDelete}
          >
            Apagar
          </button>
        </div>
      </Modal>

      <Modal isOpen={state.isFilterModalOpen} onClose={() => actions.setIsFilterModalOpen(false)} title="Filtros">
        <div className="form-group">
          <label className="form-label">Método de Pagamento</label>
          <select className="form-select" value={state.tempMethodFilter} onChange={e => actions.setTempMethodFilter(e.target.value)}>
            <option value="all">Todos os Métodos</option>
            <option value="Crédito">Crédito</option>
            <option value="Débito">Débito</option>
            <option value="Pix">Pix</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Transferência">Transferência</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Mês</label>
            <select className="form-select" value={state.tempSelectedMonth} onChange={(e) => actions.setTempSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
              <option value="all">Ano Todo</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ano</label>
            <select className="form-select" value={state.tempSelectedYear} onChange={(e) => actions.setTempSelectedYear(Number(e.target.value))}>
              {[state.defaultYear - 1, state.defaultYear, state.defaultYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions-filters">
          <button className="btn flex-1 btn-alt-bg" onClick={actions.handleResetFilters}>
            Resetar
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={actions.handleApplyFilters}>
            Aplicar Filtros
          </button>
        </div>
      </Modal>
    </div>
  );
}
