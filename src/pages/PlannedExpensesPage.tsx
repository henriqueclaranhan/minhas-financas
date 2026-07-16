import { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { CheckCircle, Trash2, Plus, Pencil, Filter, XCircle, ArrowUpCircle, ArrowDownCircle, List } from 'lucide-react';
import { Modal } from '../components/Modal';
import { PlannedExpenseForm } from '../components/PlannedExpenseForm';
import { TransactionForm } from '../components/TransactionForm';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PlannedExpense } from '../types';

export function PlannedExpensesPage() {
  const { plannedExpenses, addPlannedExpense, updatePlannedExpense, confirmPlannedExpense, rejectPlannedExpense, deletePlannedExpense } = useFinance();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const pendingExpenses = plannedExpenses
    .filter(p => {
      const pMonth = parseISO(p.dueDate).getUTCMonth();
      const pYear = parseISO(p.dueDate).getUTCFullYear();
      
      const isPending = p.status === 'pending';
      const matchesFilter = filter === 'all' || p.type === filter || (!p.type && filter === 'expense');
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

      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="filter-tabs-container">
          <button onClick={() => setFilter('all')} className="btn filter-tab-btn" style={{ background: filter === 'all' ? 'var(--clr-primary)' : 'var(--clr-surface-alt)', color: filter === 'all' ? '#fff' : 'var(--clr-text-secondary)' }}><List size={16} /> Todos</button>
          <button onClick={() => setFilter('income')} className="btn filter-tab-btn" style={{ background: filter === 'income' ? 'var(--clr-success)' : 'var(--clr-surface-alt)', color: filter === 'income' ? '#fff' : 'var(--clr-text-secondary)' }}><ArrowUpCircle size={16} /> Receitas</button>
          <button onClick={() => setFilter('expense')} className="btn filter-tab-btn" style={{ background: filter === 'expense' ? 'var(--clr-danger)' : 'var(--clr-surface-alt)', color: filter === 'expense' ? '#fff' : 'var(--clr-text-secondary)' }}><ArrowDownCircle size={16} /> Despesas</button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="search" 
            placeholder="Buscar por nome..." 
            className="form-input"
            style={{ flex: 1 }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button 
            className="btn" 
            style={{ background: 'var(--clr-surface-alt)', color: 'var(--clr-primary)', padding: '10px 14px' }} 
            onClick={() => setIsFilterModalOpen(true)}
            title="Filtros"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {pendingExpenses.length === 0 ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            Nenhum gasto planejado pendente.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
              <thead>
                <tr style={{ background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)' }}>
                  <th style={{ padding: 'var(--spacing-md)' }}>Vencimento</th>
                  <th style={{ padding: 'var(--spacing-md)' }}>Descrição</th>
                  <th style={{ padding: 'var(--spacing-md)' }}>Valor</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendingExpenses.map(p => {
                  const pDate = parseISO(p.dueDate);
                  const isCurrent = pDate.getUTCMonth() === new Date().getMonth() && pDate.getUTCFullYear() === new Date().getFullYear();

                  return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                    <td style={{ padding: 'var(--spacing-md)', color: p.type === 'income' ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      <span className="hide-on-mobile">{format(pDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <span className="hide-on-desktop">{format(pDate, 'dd/MM', { locale: ptBR })}</span>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>
                      {p.description}
                      {p.isRecurring && (
                        <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--clr-surface-alt)', color: 'var(--clr-text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                          Recorrente ({p.recurrenceInterval}m)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', color: p.type === 'income' ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 600 }}>
                      {p.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {isCurrent && (
                        <>
                          <button 
                            onClick={() => setExpenseToConfirm(p)}
                            className="btn"
                            style={{ padding: '8px', background: 'transparent', color: 'var(--clr-success)' }}
                            title="Confirmar"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => rejectPlannedExpense(p.id!)}
                            className="btn"
                            style={{ padding: '8px', background: 'transparent', color: 'var(--clr-warning)' }}
                            title="Recusar/Pular"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => openEditModal(p)}
                        className="btn"
                        style={{ padding: '8px', background: 'transparent', color: 'var(--clr-primary)' }}
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => setExpenseToDelete(p.id!)}
                        className="btn"
                        style={{ padding: '8px', background: 'transparent', color: 'var(--clr-danger)' }}
                        title="Apagar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button className="btn btn-primary fab hide-on-desktop" onClick={openNewModal}>
        <Plus size={28} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingExpense(null); }} title={editingExpense ? "Editar Planejamento" : "Planejar"}>
        <PlannedExpenseForm 
          onSubmit={handleAddOrUpdate} 
          initialData={editingExpense || undefined} 
          defaultType={filter === 'income' ? 'income' : 'expense'}
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
            <select className="form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
              <option value="all">Ano Todo</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ano</label>
            <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px' }} onClick={() => setIsFilterModalOpen(false)}>
          Aplicar Filtros
        </button>
      </Modal>
    </div>
  );
}
