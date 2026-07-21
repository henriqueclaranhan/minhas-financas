import { useCallback, useState, useMemo } from 'react';
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { FilterType, TransactionType } from '../../../enums/FinanceEnums';
import type { Transaction } from '../../../types';
import { expandTransactions } from '../../../utils/financeUtils';
import { useFinance } from '../../../store/FinanceContext';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { TemporalFilterMode } from '../../../enums/UIEnums';

export function useTransactionsViewModel() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const temporal = useTemporalFilter(TemporalFilterMode.MONTH);
  const { matchesDate } = temporal.actions;
  
  const location = useLocation();
  const initialFilter = location.state?.filter === FilterType.INCOME ? FilterType.INCOME : location.state?.filter === FilterType.EXPENSE ? FilterType.EXPENSE : FilterType.ALL;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active filters
  const [methodFilter, setMethodFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Temporary filters for modal
  const [tempMethodFilter, setTempMethodFilter] = useState('all');
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const expansionPeriod = useMemo(() => {
    if (temporal.state.mode === TemporalFilterMode.MONTH) {
      const date = new Date(temporal.state.year, temporal.state.month, 1);
      return { startDate: format(startOfMonth(date), 'yyyy-MM-dd'), endDate: format(endOfMonth(date), 'yyyy-MM-dd') };
    }
    if (temporal.state.mode === TemporalFilterMode.YEAR) {
      const date = new Date(temporal.state.year, 0, 1);
      return { startDate: format(startOfYear(date), 'yyyy-MM-dd'), endDate: format(endOfYear(date), 'yyyy-MM-dd') };
    }
    return { startDate: temporal.state.startDate, endDate: temporal.state.endDate };
  }, [temporal.state.endDate, temporal.state.mode, temporal.state.month, temporal.state.startDate, temporal.state.year]);
  const competenceTransactions = useMemo(
    () => expandTransactions(transactions, expansionPeriod),
    [expansionPeriod, transactions],
  );

  const matchesDetailedFilters = useCallback((t: Transaction) => {
    const matchesSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesMethod && matchesCategory;
  }, [categoryFilter, methodFilter, searchQuery]);

  const historyTransactions = useMemo(() => transactions.filter(t => {
    return matchesDate(t.date) && matchesDetailedFilters(t);
  }), [matchesDate, matchesDetailedFilters, transactions]);

  const competenceFiltered = useMemo(
    () => competenceTransactions.filter(matchesDetailedFilters),
    [competenceTransactions, matchesDetailedFilters],
  );

  const filtered = useMemo(
    () => historyTransactions.filter(t => filter === FilterType.ALL || t.type === filter),
    [historyTransactions, filter]
  );

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [filtered]);

  const totalIncome = useMemo(() => competenceFiltered.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0), [competenceFiltered]);
  const totalExpense = useMemo(() => competenceFiltered.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0), [competenceFiltered]);

  const handleAddOrUpdate = async (transaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction?.id) {
      await updateTransaction(editingTransaction.id, transaction);
    } else {
      await addTransaction(transaction);
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

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  const handleOpenFilters = () => {
    setTempMethodFilter(methodFilter);
    setTempCategoryFilter(categoryFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setMethodFilter(tempMethodFilter);
    setCategoryFilter(tempCategoryFilter);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setMethodFilter('all');
    setCategoryFilter('all');
    setTempMethodFilter('all');
    setTempCategoryFilter('all');
    
    setIsFilterModalOpen(false);
  };

  return {
    state: {
      transactions: sorted,
      totalIncome,
      totalExpense,
      isModalOpen,
      isFilterModalOpen,
      filter,
      searchQuery,
      methodFilter,
      categoryFilter,
      tempMethodFilter,
      tempCategoryFilter,
      editingTransaction,
      transactionToDelete,
      filterLabel: temporal.state.label,
      temporal: temporal.state
    },
    actions: {
      setFilter,
      setSearchQuery,
      setIsModalOpen,
      setIsFilterModalOpen,
      setTempMethodFilter,
      setTempCategoryFilter,
      setTransactionToDelete,
      setEditingTransaction,
      handleAddOrUpdate,
      openNewModal,
      openEditModal,
      confirmDelete,
      handleOpenFilters,
      handleApplyFilters,
      handleResetFilters,
      temporal: temporal.actions
    }
  };
}
