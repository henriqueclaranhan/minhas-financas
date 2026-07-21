import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { FilterType } from '../../../enums/FinanceEnums';
import type { Transaction } from '../../../types';
import { useFinance } from '../../../store/FinanceContext';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { useAuth } from '../../../store/AuthContext';
import { TransactionService } from '../../../services/TransactionService';
import { useCompetenceEntries } from '../../../hooks/useCompetenceEntries';
import { aggregateCompetenceEntries } from '../../../utils/financeAggregationUtils';
import { useQueryParamState } from '../../../hooks/useQueryParamState';
import { ExpenseCategory, IncomeCategory, PaymentMethod } from '../../../enums/FinanceEnums';

export function useTransactionsViewModel() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, isLoading: isFinanceLoading } = useFinance();
  const { user } = useAuth();
  const [, setSearchParams] = useSearchParams();
  const temporal = useTemporalFilter(TemporalFilterMode.MONTH);
  const { matchesDate } = temporal.actions;
  
  const [queryFilter, setQueryFilter] = useQueryParamState(
    'type',
    FilterType.ALL,
    value => Object.values(FilterType).includes(value as FilterType) ? value as FilterType : undefined,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const filter = queryFilter;
  const setFilter = useCallback((value: FilterType) => {
    setQueryFilter(value);
  }, [setQueryFilter]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active filters
  const [methodFilter] = useQueryParamState(
    'method',
    'all',
    value => value && Object.values(PaymentMethod).includes(value as PaymentMethod) ? value : undefined,
  );
  const [categoryFilter] = useQueryParamState(
    'category',
    'all',
    value => value && [...Object.values(ExpenseCategory), ...Object.values(IncomeCategory)].includes(value as ExpenseCategory) ? value : undefined,
  );

  // Temporary filters for modal
  const [tempMethodFilter, setTempMethodFilter] = useState('all');
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [historyWindow, setHistoryWindow] = useState<Transaction[]>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyGeneration, setHistoryGeneration] = useState(0);
  const requestGeneration = useRef(0);
  const historyCursorRef = useRef<{ date: string; id: string } | undefined>(undefined);
  const hasMoreHistoryRef = useRef(true);
  const isLoadingHistoryRef = useRef(false);

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
  const { entries: competenceEntries, isLoading: isCompetenceLoading } = useCompetenceEntries(
    expansionPeriod.startDate,
    expansionPeriod.endDate,
    transactions,
  );

  const loadHistoryPage = useCallback(async (reset = false) => {
    if (!user?.uid || (!reset && (isLoadingHistoryRef.current || !hasMoreHistoryRef.current))) return;
    const generation = reset ? requestGeneration.current + 1 : requestGeneration.current;
    if (reset) requestGeneration.current = generation;
    setIsLoadingHistory(true);
    isLoadingHistoryRef.current = true;
    setHistoryError(false);
    try {
      const page = await TransactionService.getHistoryPage(
        user.uid,
        expansionPeriod,
        reset ? undefined : historyCursorRef.current,
      );
      if (generation !== requestGeneration.current) return;
      setHistoryWindow(current => reset ? page.transactions : [...current, ...page.transactions]);
      setHasMoreHistory(page.hasMore);
      historyCursorRef.current = page.cursor;
      hasMoreHistoryRef.current = page.hasMore;
    } catch {
      if (generation === requestGeneration.current) setHistoryError(true);
    } finally {
      if (generation === requestGeneration.current) {
        setIsLoadingHistory(false);
        isLoadingHistoryRef.current = false;
      }
    }
  }, [expansionPeriod, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    setHistoryWindow([]);
    setHasMoreHistory(true);
    historyCursorRef.current = undefined;
    hasMoreHistoryRef.current = true;
    void loadHistoryPage(true);
  }, [historyGeneration, loadHistoryPage, user?.uid]);

  const matchesDetailedFilters = useCallback((t: Pick<Transaction, 'description' | 'paymentMethod' | 'category'>) => {
    const matchesSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesMethod && matchesCategory;
  }, [categoryFilter, methodFilter, searchQuery]);

  const historySource = user?.uid ? historyWindow : transactions;
  const historyTransactions = useMemo(() => historySource.filter(t => {
    return matchesDate(t.date) && matchesDetailedFilters(t);
  }), [historySource, matchesDate, matchesDetailedFilters]);

  const competenceFiltered = useMemo(
    () => competenceEntries.filter(matchesDetailedFilters),
    [competenceEntries, matchesDetailedFilters],
  );

  const filtered = useMemo(
    () => historyTransactions.filter(t => filter === FilterType.ALL || t.type === filter),
    [historyTransactions, filter]
  );

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [filtered]);

  const competenceAggregate = useMemo(() => aggregateCompetenceEntries(competenceFiltered), [competenceFiltered]);
  const totalIncome = competenceAggregate.income;
  const totalExpense = competenceAggregate.expense;

  const handleAddOrUpdate = async (transaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction?.id) {
      await updateTransaction(editingTransaction.id, transaction);
    } else {
      await addTransaction(transaction);
    }
    
    setIsModalOpen(false);
    setEditingTransaction(null);
    setHistoryGeneration(generation => generation + 1);
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
      setHistoryGeneration(generation => generation + 1);
    }
  };

  const handleOpenFilters = () => {
    setTempMethodFilter(methodFilter);
    setTempCategoryFilter(categoryFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      if (tempMethodFilter === 'all') next.delete('method');
      else next.set('method', tempMethodFilter);
      if (tempCategoryFilter === 'all') next.delete('category');
      else next.set('category', tempCategoryFilter);
      return next;
    }, { replace: true });
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      next.delete('method');
      next.delete('category');
      return next;
    }, { replace: true });
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
      hasMoreHistory,
      isLoadingHistory,
      isLoading: isFinanceLoading || isCompetenceLoading || (isLoadingHistory && historyWindow.length === 0),
      historyError,
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
      loadMoreHistory: () => loadHistoryPage(false),
      temporal: temporal.actions
    }
  };
}
