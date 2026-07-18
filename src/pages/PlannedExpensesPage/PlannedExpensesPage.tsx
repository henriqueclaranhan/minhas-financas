import { Plus } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { PlannedExpenseForm } from '../../components/PlannedExpenseForm';
import { TransactionForm } from '../../components/TransactionForm';
import type { PlannedExpense } from '../../types';
import { FilterType, TransactionType } from '../../enums/FinanceEnums';
import { FilterTabs } from '../../components/shared/FilterTabs';
import { PlannedExpenseTable } from './components/PlannedExpenseTable';
import { usePlannedExpensesViewModel } from './hooks/usePlannedExpensesViewModel';
import './PlannedExpensesPage.css';

export function PlannedExpensesPage() {
  const { state, actions } = usePlannedExpensesViewModel();

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Planejamento</h1>
          <p className="text-secondary">Programe suas receitas e despesas futuras.</p>
        </div>
        <button 
          className="btn btn-primary hover-glow hide-on-mobile" 
          onClick={actions.openNewModal}
        >
          <Plus size={18} className="mr-sm" /> Planejar
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

      <Modal isOpen={state.isModalOpen} onClose={() => { actions.setIsModalOpen(false); actions.setEditingExpense(null); }} title={state.editingExpense ? "Editar Planejamento" : "Planejar"}>
        <PlannedExpenseForm 
          onSubmit={actions.handleAddOrUpdate} 
          initialData={state.editingExpense || undefined} 
          defaultType={state.filter === FilterType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE}
        />
      </Modal>

      <Modal isOpen={!!state.expenseToConfirm} onClose={() => actions.setExpenseToConfirm(null)} title={state.expenseToConfirm?.type === 'income' ? "Confirmar Recebimento" : "Confirmar Pagamento"}>
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

      <Modal isOpen={!!state.expenseToDelete} onClose={() => actions.setExpenseToDelete(null)} title="Confirmar Exclusão">
        <div className="delete-modal-content">
          <p className="delete-modal-text">Tem certeza que deseja apagar este planejamento?</p>
          <p className="delete-modal-subtext">Esta ação não pode ser desfeita.</p>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => actions.setExpenseToDelete(null)}>Cancelar</button>
          <button 
            className="btn btn-primary btn-danger-bg" 
            onClick={actions.confirmDelete}
          >
            Apagar
          </button>
        </div>
      </Modal>

      <Modal isOpen={state.isFilterModalOpen} onClose={() => actions.setIsFilterModalOpen(false)} title="Filtros">
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
