import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { parseISO } from 'date-fns';
import { FilterType, TransactionType } from '../../../enums/FinanceEnums';
import type { Transaction } from '../../../types';
import { expandTransactions } from '../../../utils/financeUtils';
import type { ExpandedTransaction } from '../../../utils/financeUtils';
import { useFinance } from '../../../store/FinanceContext';
import { useLocale } from '../../../store/LocaleContext';

export function useTransactionsViewModel() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { locale, t } = useLocale();
  
  const location = useLocation();
  const initialFilter = location.state?.filter === FilterType.INCOME ? FilterType.INCOME : location.state?.filter === FilterType.EXPENSE ? FilterType.EXPENSE : FilterType.ALL;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  
  const defaultMonth = new Date().getMonth();
  const defaultYear = new Date().getFullYear();

  // Active filters
  const [methodFilter, setMethodFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Temporary filters for modal
  const [tempMethodFilter, setTempMethodFilter] = useState('all');
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');
  const [tempSelectedMonth, setTempSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(defaultYear);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const expandedTransactions = useMemo(() => expandTransactions(transactions), [transactions]);

  const periodFiltered = useMemo(() => expandedTransactions.filter(t => {
    const tMonth = parseISO(t.date).getUTCMonth();
    const tYear = parseISO(t.date).getUTCFullYear();
    const matchesMonth = selectedMonth === 'all' || tMonth === selectedMonth;
    const matchesYear = tYear === selectedYear;
    
    const matchesSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesMonth && matchesYear && matchesSearch && matchesMethod && matchesCategory;
  }), [expandedTransactions, selectedMonth, selectedYear, searchQuery, methodFilter, categoryFilter]);

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
    setTempSelectedMonth(selectedMonth);
    setTempSelectedYear(selectedYear);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setMethodFilter(tempMethodFilter);
    setCategoryFilter(tempCategoryFilter);
    setSelectedMonth(tempSelectedMonth);
    setSelectedYear(tempSelectedYear);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setMethodFilter('all');
    setCategoryFilter('all');
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);

    setTempMethodFilter('all');
    setTempCategoryFilter('all');
    setTempSelectedMonth(defaultMonth);
    setTempSelectedYear(defaultYear);
    
    setIsFilterModalOpen(false);
  };

  const filterLabel = selectedMonth === 'all' 
    ? t('filters.fullYearOf', { year: selectedYear })
    : t('filters.monthOfYear', { month: new Date(2000, selectedMonth as number, 1).toLocaleString(locale, { month: 'long' }).replace(/^\w/, c => c.toUpperCase()), year: selectedYear });

  return {
    state: {
      transactions: sorted,
      totalIncome,
      totalExpense,
      isModalOpen,
      isFilterModalOpen,
      filter,
      searchQuery,
      selectedMonth,
      selectedYear,
      methodFilter,
      categoryFilter,
      tempMethodFilter,
      tempCategoryFilter,
      tempSelectedMonth,
      tempSelectedYear,
      editingTransaction,
      transactionToDelete,
      filterLabel,
      defaultYear
    },
    actions: {
      setFilter,
      setSearchQuery,
      setIsModalOpen,
      setIsFilterModalOpen,
      setTempMethodFilter,
      setTempCategoryFilter,
      setTempSelectedMonth,
      setTempSelectedYear,
      setTransactionToDelete,
      setEditingTransaction,
      handleAddOrUpdate,
      openNewModal,
      openEditModal,
      confirmDelete,
      handleOpenFilters,
      handleApplyFilters,
      handleResetFilters
    }
  };
}
