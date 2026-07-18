import { useState, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { FilterType, TransactionType } from '../../../enums/FinanceEnums';
import type { Transaction } from '../../../types';
import { expandTransactions } from '../../../utils/financeUtils';
import type { ExpandedTransaction } from '../../../utils/financeUtils';
import { useFinance } from '../../../store/FinanceContext';
import { TransactionService } from '../../../services/TransactionService';
import { useAuth } from '../../../store/AuthContext';
import { useLocale } from '../../../store/LocaleContext';

export function useTransactionsViewModel() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { user } = useAuth();
  const { locale, t } = useLocale();
  
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

  const expandedTransactions = useMemo(() => expandTransactions(transactions), [transactions]);

  const filtered = useMemo(() => expandedTransactions.filter(t => {
    const tMonth = parseISO(t.date).getUTCMonth();
    const tYear = parseISO(t.date).getUTCFullYear();
    
    const matchesFilter = filter === FilterType.ALL || t.type === filter;
    const matchesMonth = selectedMonth === 'all' || tMonth === selectedMonth;
    const matchesYear = tYear === selectedYear;
    
    const matchesSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;

    return matchesFilter && matchesMonth && matchesYear && matchesSearch && matchesMethod;
  }), [expandedTransactions, filter, selectedMonth, selectedYear, searchQuery, methodFilter]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [filtered]);

  const totalIncome = useMemo(() => filtered.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0), [filtered]);

  const handleAddOrUpdate = async (t: any) => {
    if (user?.uid) {
      if (editingTransaction && editingTransaction.id) {
        await TransactionService.updateTransaction(user.uid, editingTransaction.id, t);
        // We still call Context to trigger any needed global side effects if we haven't decoupled fully, 
        // or just let context's real-time listener pick it up!
        // Actually, since Context has a real-time listener, TransactionService mutation is enough!
      } else {
        await TransactionService.addTransaction(user.uid, t);
      }
    } else {
      // Fallback to context for now if not using real-time
      if (editingTransaction) {
        updateTransaction(editingTransaction.id!, t);
      } else {
        addTransaction(t);
      }
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
      if (user?.uid) {
        await TransactionService.deleteTransaction(user.uid, transactionToDelete);
      } else {
        deleteTransaction(transactionToDelete);
      }
      setTransactionToDelete(null);
    }
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
      tempMethodFilter,
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
