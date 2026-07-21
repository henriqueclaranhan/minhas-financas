import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FilterType, TransactionType } from '../../../enums/FinanceEnums';
import type { Transaction } from '../../../types';
import { expandTransactions } from '../../../utils/financeUtils';
import type { ExpandedTransaction } from '../../../utils/financeUtils';
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

  const expandedTransactions = useMemo(() => expandTransactions(transactions), [transactions]);

  const periodFiltered = useMemo(() => expandedTransactions.filter(t => {
    const matchesPeriod = matchesDate(t.date);
    const matchesSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesPeriod && matchesSearch && matchesMethod && matchesCategory;
  }), [expandedTransactions, matchesDate, searchQuery, methodFilter, categoryFilter]);

  const filtered = useMemo(
    () => periodFiltered.filter(t => filter === FilterType.ALL || t.type === filter),
    [periodFiltered, filter]
  );

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [filtered]);

  const totalIncome = useMemo(() => periodFiltered.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0), [periodFiltered]);
  const totalExpense = useMemo(() => periodFiltered.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0), [periodFiltered]);

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

  const openEditModal = (t: ExpandedTransaction) => {
    const originalTx = t.originalId ? transactions.find(tx => tx.id === t.originalId) : t;
    setEditingTransaction(originalTx as Transaction);
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
