import { useState } from 'react';
import { useFinance } from '../../store/FinanceContext';
import { TransactionForm } from '../../components/TransactionForm';
import { Modal } from '../../components/Modal';
import { parseISO } from 'date-fns';
import { Plus } from 'lucide-react';
import type { Transaction } from '../../types';
import { FilterType } from '../../enums/FinanceEnums';
import { FilterTabs } from '../../components/shared/FilterTabs';
import { TransactionTable } from './components/TransactionTable';
import { expandTransactions } from '../../utils/financeUtils';
import type { ExpandedTransaction } from '../../utils/financeUtils';
import './TransactionsPage.css';

export function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  
  const defaultMonth = new Date().getMonth();
  const defaultYear = new Date().getFullYear();

  // Active filters
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Temporary filters for modal
  const [tempMethodFilter, setTempMethodFilter] = useState('all');
  const [tempSelectedMonth, setTempSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(defaultYear);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const expandedTransactions = expandTransactions(transactions);

  const filtered = expandedTransactions.filter(t => {
    const tMonth = parseISO(t.date).getUTCMonth();
    const tYear = parseISO(t.date).getUTCFullYear();
    
    const matchesFilter = filter === FilterType.ALL || t.type === filter;
    const matchesMonth = selectedMonth === 'all' || tMonth === selectedMonth;
    const matchesYear = tYear === selectedYear;
    
    const matchesSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;

    return matchesFilter && matchesMonth && matchesYear && matchesSearch && matchesMethod;
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = filtered.filter(t => t.type === FilterType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === FilterType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);

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

  const openEditModal = (t: ExpandedTransaction) => {
    const originalTx = t.originalId ? transactions.find(tx => tx.id === t.originalId) : t;
    setEditingTransaction(originalTx as Transaction);
    setIsModalOpen(true);
  };

  const handleOpenFilters = () => {
    setTempMethodFilter(methodFilter);
    setTempSelectedMonth(selectedMonth);
    setTempSelectedYear(selectedYear);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setMethodFilter(tempMethodFilter);
    setSelectedMonth(tempSelectedMonth);
    setSelectedYear(tempSelectedYear);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setMethodFilter('all');
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);

    setTempMethodFilter('all');
    setTempSelectedMonth(defaultMonth);
    setTempSelectedYear(defaultYear);
    
    setIsFilterModalOpen(false);
  };

  const filterLabel = selectedMonth === 'all' 
    ? `Ano todo, ${selectedYear}`
    : `${new Date(2000, selectedMonth as number, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())} de ${selectedYear}`;

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
          onClick={openNewModal}
        >
          <Plus size={18} className="mr-sm" /> Nova Transação
        </button>
      </header>

      <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--clr-success)' }}>
          <p className="text-secondary" style={{ margin: '0 0 4px 0', fontSize: '0.875rem' }}>Entradas no Período</p>
          <h3 style={{ margin: 0, color: 'var(--clr-success)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--clr-danger)' }}>
          <p className="text-secondary" style={{ margin: '0 0 4px 0', fontSize: '0.875rem' }}>Saídas no Período</p>
          <h3 style={{ margin: 0, color: 'var(--clr-danger)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
          </h3>
        </div>
      </div>

      <FilterTabs 
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFilters={handleOpenFilters}
        activeDateLabel={filterLabel}
        activeMethodLabel={methodFilter !== 'all' ? methodFilter : undefined}
      />
      
      <div className="glass-panel panel-no-padding">
        <TransactionTable 
          transactions={sorted as Transaction[]}
          onEdit={openEditModal}
          onDelete={(id) => {
            const t = sorted.find(tx => tx.id === id);
            setTransactionToDelete(t?.originalId || id);
          }}
        />
      </div>

      {/* Mobile FAB */}
      <button className="btn btn-primary fab hide-on-desktop" onClick={openNewModal}>
        <Plus size={28} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} title={editingTransaction ? "Editar Transação" : "Nova Transação"}>
        <TransactionForm 
          onSubmit={handleAddOrUpdate} 
          initialData={editingTransaction || undefined} 
          defaultType={filter === FilterType.INCOME ? 'income' : 'expense'}
        />
      </Modal>

      <Modal isOpen={!!transactionToDelete} onClose={() => setTransactionToDelete(null)} title="Confirmar Exclusão">
        <div className="delete-modal-content">
          <p className="delete-modal-text">Tem certeza que deseja apagar esta transação?</p>
          <p className="delete-modal-subtext">Esta ação não pode ser desfeita.</p>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setTransactionToDelete(null)}>Cancelar</button>
          <button 
            className="btn btn-primary btn-danger-bg" 
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
          <select className="form-select" value={tempMethodFilter} onChange={e => setTempMethodFilter(e.target.value)}>
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

        <div className="modal-actions-filters">
          <button className="btn flex-1 btn-alt-bg" onClick={handleResetFilters}>
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
