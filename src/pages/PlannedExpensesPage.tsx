import { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { Plus } from 'lucide-react';
import { Modal } from '../components/Modal';
import { PlannedExpenseForm } from '../components/PlannedExpenseForm';
import { TransactionForm } from '../components/TransactionForm';
import { parseISO } from 'date-fns';
import type { PlannedExpense } from '../types';
import { FilterType, ExpenseStatus, TransactionType } from '../enums/FinanceEnums';
import { FilterTabs } from '../components/shared/FilterTabs';
import { PlannedExpenseTable } from '../components/planning/PlannedExpenseTable';

export function PlannedExpensesPage() {
  const { plannedExpenses, addPlannedExpense, updatePlannedExpense, confirmPlannedExpense, rejectPlannedExpense, deletePlannedExpense } = useFinance();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultMonth = 'all';
  const defaultYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const [tempSelectedMonth, setTempSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(defaultYear);

  const [editingExpense, setEditingExpense] = useState<PlannedExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [expenseToConfirm, setExpenseToConfirm] = useState<PlannedExpense | null>(null);
  
  const handleAddOrUpdate = (data: any) => {
    if (editingExpense) {
      updatePlannedExpense(editingExpense.id!, data);
    } else {
      addPlannedExpense(data);
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const openNewModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PlannedExpense) => {
    setEditingExpense(p);
    setIsModalOpen(true);
  };

  const handleOpenFilters = () => {
    setTempSelectedMonth(selectedMonth);
    setTempSelectedYear(selectedYear);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedMonth(tempSelectedMonth);
    setSelectedYear(tempSelectedYear);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
    
    setTempSelectedMonth(defaultMonth);
    setTempSelectedYear(defaultYear);
    
    setIsFilterModalOpen(false);
  };

  const filterLabel = selectedMonth === 'all' 
    ? `Ano todo, ${selectedYear}`
    : `${new Date(2000, selectedMonth as number, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())} de ${selectedYear}`;

  const pendingExpenses = plannedExpenses
    .filter(p => {
      const pMonth = parseISO(p.dueDate).getUTCMonth();
      const pYear = parseISO(p.dueDate).getUTCFullYear();
      
      const isPending = p.status === ExpenseStatus.PENDING;
      const matchesFilter = filter === FilterType.ALL || p.type === filter || (!p.type && filter === FilterType.EXPENSE);
      const matchesMonth = selectedMonth === 'all' || pMonth === selectedMonth;
      const matchesYear = pYear === selectedYear;
      const matchesSearch = !searchQuery || p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return isPending && matchesFilter && matchesMonth && matchesYear && matchesSearch;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Planejamento</h1>
          <p style={{ color: 'var(--clr-text-secondary)' }}>Programe suas receitas e despesas futuras.</p>
        </div>
        <button 
          className="btn btn-primary hover-glow hide-on-mobile" 
          onClick={openNewModal}
        >
          <Plus size={18} style={{ marginRight: '8px' }} /> Planejar
        </button>
      </header>

      <FilterTabs 
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFilters={handleOpenFilters}
        activeDateLabel={filterLabel}
      />

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <PlannedExpenseTable 
          expenses={pendingExpenses}
          onConfirm={setExpenseToConfirm}
          onReject={rejectPlannedExpense}
          onEdit={openEditModal}
          onDelete={setExpenseToDelete}
        />
      </div>

      <button className="btn btn-primary fab hide-on-desktop" onClick={openNewModal}>
        <Plus size={28} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingExpense(null); }} title={editingExpense ? "Editar Planejamento" : "Planejar"}>
        <PlannedExpenseForm 
          onSubmit={handleAddOrUpdate} 
          initialData={editingExpense || undefined} 
          defaultType={filter === FilterType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE}
        />
      </Modal>

      <Modal isOpen={!!expenseToConfirm} onClose={() => setExpenseToConfirm(null)} title={expenseToConfirm?.type === 'income' ? "Confirmar Recebimento" : "Confirmar Pagamento"}>
        {expenseToConfirm && (
          <TransactionForm 
            onSubmit={(data) => {
              confirmPlannedExpense(expenseToConfirm.id!, data);
              setExpenseToConfirm(null);
            }} 
            initialData={{
              description: expenseToConfirm.description,
              amount: expenseToConfirm.amount,
              date: expenseToConfirm.dueDate,
              type: expenseToConfirm.type || 'expense',
              paymentMethod: expenseToConfirm.type === 'income' ? 'Pix' : 'Pix',
              installments: 1
            }}
            defaultType={expenseToConfirm.type || 'expense'}
          />
        )}
      </Modal>

      <Modal isOpen={!!expenseToDelete} onClose={() => setExpenseToDelete(null)} title="Confirmar Exclusão">
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--clr-text-primary)' }}>Tem certeza que deseja apagar este planejamento?</p>
          <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>Esta ação não pode ser desfeita.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setExpenseToDelete(null)}>Cancelar</button>
          <button 
            className="btn btn-primary" 
            style={{ background: 'var(--clr-danger)' }} 
            onClick={() => {
              if (expenseToDelete) {
                deletePlannedExpense(expenseToDelete);
                setExpenseToDelete(null);
              }
            }}
          >
            Apagar
          </button>
        </div>
      </Modal>

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtros">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Mês</label>
            <select className="form-select" value={tempSelectedMonth} onChange={(e) => setTempSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
              <option value="all">Ano Todo</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ano</label>
            <select className="form-select" value={tempSelectedYear} onChange={(e) => setTempSelectedYear(Number(e.target.value))}>
              {[defaultYear - 1, defaultYear, defaultYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn" style={{ flex: 1, background: 'var(--clr-surface-alt)' }} onClick={handleResetFilters}>
            Resetar
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleApplyFilters}>
            Aplicar Filtros
          </button>
        </div>
      </Modal>
    </div>
  );
}
