import { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { TransactionForm } from '../components/TransactionForm';
import { Modal } from '../components/Modal';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Pencil, Trash2, Filter, ArrowUpCircle, ArrowDownCircle, List } from 'lucide-react';
import type { Transaction } from '../types';

export function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const filtered = transactions.filter(t => {
    const tMonth = parseISO(t.date).getUTCMonth();
    const tYear = parseISO(t.date).getUTCFullYear();
    
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesMonth = selectedMonth === 'all' || tMonth === selectedMonth;
    const matchesYear = tYear === selectedYear;
    
    const matchesSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;

    return matchesFilter && matchesMonth && matchesYear && matchesSearch && matchesMethod;
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddOrUpdate = (t: any) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id!, t);
    } else {
      addTransaction(t);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const openNewModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Histórico de Transações</h1>
          <p style={{ color: 'var(--clr-text-secondary)' }}>Todas as suas entradas e saídas.</p>
        </div>
        {/* Desktop Button */}
        <button 
          className="btn btn-primary hover-glow hide-on-mobile" 
          onClick={openNewModal}
        >
          <Plus size={18} style={{ marginRight: '8px' }} /> Nova Transação
        </button>
      </header>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="filter-tabs-container">
          <button onClick={() => setFilter('all')} className="btn filter-tab-btn" style={{ background: filter === 'all' ? 'var(--clr-primary)' : 'var(--clr-surface-alt)', color: filter === 'all' ? '#fff' : 'var(--clr-text-secondary)' }}><List size={16} /> Todas</button>
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
        {sorted.length === 0 ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            Nenhuma transação registrada ainda.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)' }}>
                  <th style={{ padding: 'var(--spacing-md)' }}>Data</th>
                  <th style={{ padding: 'var(--spacing-md)' }}>Descrição</th>
                  <th style={{ padding: 'var(--spacing-md)' }}>Método</th>
                  <th style={{ padding: 'var(--spacing-md)' }}>Valor</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--clr-text-secondary)', whiteSpace: 'nowrap' }}>
                      <span className="hide-on-mobile">{format(parseISO(t.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <span className="hide-on-desktop">{format(parseISO(t.date), 'dd/MM', { locale: ptBR })}</span>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>
                      {t.description}
                      {t.installments > 1 && (
                        <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                          {t.installments}x
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--clr-text-secondary)' }}>{t.paymentMethod}</td>
                    <td style={{ padding: 'var(--spacing-md)', color: t.type === 'income' ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 600 }}>
                      {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => openEditModal(t)}
                        className="btn"
                        style={{ padding: '8px', background: 'transparent', color: 'var(--clr-primary)' }}
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => setTransactionToDelete(t.id!)}
                        className="btn"
                        style={{ padding: '8px', background: 'transparent', color: 'var(--clr-danger)' }}
                        title="Apagar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button className="btn btn-primary fab hide-on-desktop" onClick={openNewModal}>
        <Plus size={28} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} title={editingTransaction ? "Editar Transação" : "Nova Transação"}>
        <TransactionForm 
          onSubmit={handleAddOrUpdate} 
          initialData={editingTransaction || undefined} 
          defaultType={filter === 'income' ? 'income' : 'expense'}
        />
      </Modal>

      <Modal isOpen={!!transactionToDelete} onClose={() => setTransactionToDelete(null)} title="Confirmar Exclusão">
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--clr-text-primary)' }}>Tem certeza que deseja apagar esta transação?</p>
          <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>Esta ação não pode ser desfeita.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setTransactionToDelete(null)}>Cancelar</button>
          <button 
            className="btn btn-primary" 
            style={{ background: 'var(--clr-danger)' }} 
            onClick={() => {
              if (transactionToDelete) {
                deleteTransaction(transactionToDelete);
                setTransactionToDelete(null);
              }
            }}
          >
            Apagar
          </button>
        </div>
      </Modal>

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtros">
        <div className="form-group">
          <label className="form-label">Método de Pagamento</label>
          <select className="form-select" value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
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
