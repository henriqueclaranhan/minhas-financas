import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { addMonths, endOfMonth, endOfYear, format, parseISO, startOfMonth, startOfYear } from 'date-fns';
import { FilterType, TransactionType, ExpenseStatus, ExpenseCategory, IncomeCategory } from '../../../enums/FinanceEnums';
import type { PlannedExpense, Transaction } from '../../../types';
import { expandPlannedExpenses } from '../../../utils/financeUtils';
import type { ExpandedPlannedExpense } from '../../../utils/financeUtils';
import { useFinance } from '../../../store/FinanceContext';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { useQueryParamState } from '../../../hooks/useQueryParamState';
import { useAuth } from '../../../store/AuthContext';
import { PlannedExpenseService } from '../../../services/PlannedExpenseService';

export function usePlannedExpensesViewModel() {
  const { plannedExpenses, addPlannedExpense, updatePlannedExpense, confirmPlannedExpense, rejectPlannedExpense, deletePlannedExpense, isLoading } = useFinance();
  const { user } = useAuth();
  const temporal = useTemporalFilter(TemporalFilterMode.YEAR);
  const { matchesDate } = temporal.actions;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useQueryParamState(
    'type',
    FilterType.ALL,
    value => Object.values(FilterType).includes(value as FilterType) ? value as FilterType : undefined,
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [categoryFilter, setCategoryFilter] = useQueryParamState(
    'category',
    'all',
    value => value && [...Object.values(ExpenseCategory), ...Object.values(IncomeCategory)].includes(value as ExpenseCategory) ? value : undefined,
  );

  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');

  const [editingExpense, setEditingExpense] = useState<PlannedExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [expenseToConfirm, setExpenseToConfirm] = useState<PlannedExpense | null>(null);
  const [historyWindow, setHistoryWindow] = useState<PlannedExpense[]>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyGeneration, setHistoryGeneration] = useState(0);
  const requestGeneration = useRef(0);
  const historyCursorRef = useRef<{ dueDate: string; id: string } | undefined>(undefined);
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
  const aggregateExpandedExpenses = useMemo(
    () => expandPlannedExpenses(plannedExpenses, expansionPeriod),
    [expansionPeriod, plannedExpenses],
  );

  const historyQueryPeriod = useMemo(() => ({
    startDate: format(addMonths(parseISO(expansionPeriod.startDate), -360), 'yyyy-MM-dd'),
    endDate: expansionPeriod.endDate,
  }), [expansionPeriod]);

  const loadHistoryPage = useCallback(async (reset = false) => {
    if (!user?.uid || (!reset && (isLoadingHistoryRef.current || !hasMoreHistoryRef.current))) return;
    const generation = reset ? requestGeneration.current + 1 : requestGeneration.current;
    if (reset) requestGeneration.current = generation;
    setIsLoadingHistory(true);
    isLoadingHistoryRef.current = true;
    setHistoryError(false);
    try {
      const page = await PlannedExpenseService.getHistoryPage(
        user.uid,
        historyQueryPeriod,
        reset ? undefined : historyCursorRef.current,
      );
      if (generation !== requestGeneration.current) return;
      setHistoryWindow(current => reset ? page.plannedExpenses : [...current, ...page.plannedExpenses]);
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
  }, [historyQueryPeriod, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    setHistoryWindow([]);
    setHasMoreHistory(true);
    historyCursorRef.current = undefined;
    hasMoreHistoryRef.current = true;
    void loadHistoryPage(true);
  }, [historyGeneration, loadHistoryPage, user?.uid]);

  const expandedHistory = useMemo(
    () => expandPlannedExpenses(user?.uid ? historyWindow : plannedExpenses, expansionPeriod),
    [expansionPeriod, historyWindow, plannedExpenses, user?.uid],
  );

  const periodPendingExpenses = useMemo(() => expandedHistory
    .filter(p => {
      const isPending = p.status === ExpenseStatus.PENDING;
      const matchesPeriod = matchesDate(p.dueDate);
      const matchesSearch = !searchQuery || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return isPending && matchesPeriod && matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), 
    [expandedHistory, matchesDate, searchQuery, categoryFilter]
  );

  const aggregatePeriodExpenses = useMemo(() => aggregateExpandedExpenses.filter(p => {
    const isPending = p.status === ExpenseStatus.PENDING;
    const matchesPeriod = matchesDate(p.dueDate);
    const matchesSearch = !searchQuery || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return isPending && matchesPeriod && matchesSearch && matchesCategory;
  }), [aggregateExpandedExpenses, categoryFilter, matchesDate, searchQuery]);

  const filteredPendingExpenses = useMemo(
    () => periodPendingExpenses.filter(p => filter === FilterType.ALL || p.type === filter || (!p.type && filter === FilterType.EXPENSE)),
    [periodPendingExpenses, filter]
  );
  const pendingExpenses = filteredPendingExpenses;

  const totalIncome = useMemo(() => aggregatePeriodExpenses.filter(p => p.type === TransactionType.INCOME).reduce((acc, p) => acc + p.amount, 0), [aggregatePeriodExpenses]);
  const totalExpense = useMemo(() => aggregatePeriodExpenses.filter(p => p.type === TransactionType.EXPENSE || !p.type).reduce((acc, p) => acc + p.amount, 0), [aggregatePeriodExpenses]);

  const handleAddOrUpdate = async (data: Omit<PlannedExpense, 'id'>) => {
    if (editingExpense?.id) {
      await updatePlannedExpense(editingExpense.id, data);
    } else {
      await addPlannedExpense(data);
    }
    
    setIsModalOpen(false);
    setEditingExpense(null);
    setHistoryGeneration(generation => generation + 1);
  };

  const openNewModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ExpandedPlannedExpense) => {
    const originalP = p.originalId ? historyWindow.find(px => px.id === p.originalId) : p;
    setEditingExpense(originalP as PlannedExpense);
    setIsModalOpen(true);
  };

  const handleOpenFilters = () => {
    setTempCategoryFilter(categoryFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setCategoryFilter(tempCategoryFilter);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setCategoryFilter('all');
    
    setTempCategoryFilter('all');
    
    setIsFilterModalOpen(false);
  };

  const confirmDelete = async () => {
    if (expenseToDelete) {
      await deletePlannedExpense(expenseToDelete);
      setExpenseToDelete(null);
      setHistoryGeneration(generation => generation + 1);
    }
  };

  const confirmAction = async (data: Omit<Transaction, 'id'>) => {
    if (expenseToConfirm && expenseToConfirm.id) {
      await confirmPlannedExpense(expenseToConfirm.id, data);
      setExpenseToConfirm(null);
      setHistoryGeneration(generation => generation + 1);
    }
  };

  const rejectAction = async (id: string) => {
    const originalId = pendingExpenses.find(px => px.id === id)?.originalId || id;
    await rejectPlannedExpense(originalId);
    setHistoryGeneration(generation => generation + 1);
  };

  const handleConfirmPrompt = (id: string) => {
    const p = pendingExpenses.find(px => px.id === id);
    setExpenseToConfirm(historyWindow.find(px => px.id === (p?.originalId || id)) || null);
  };

  const handleDeletePrompt = (id: string) => {
    const p = pendingExpenses.find(px => px.id === id);
    setExpenseToDelete(p?.originalId || id);
  };

  return {
    state: {
      pendingExpenses,
      totalIncome,
      totalExpense,
      isModalOpen,
      isFilterModalOpen,
      filter,
      searchQuery,
      categoryFilter,
      tempCategoryFilter,
      editingExpense,
      expenseToDelete,
      expenseToConfirm,
      hasMoreHistory,
      isLoadingHistory,
      historyError,
      isLoading: isLoading || (isLoadingHistory && historyWindow.length === 0),
      filterLabel: temporal.state.label,
      temporal: temporal.state
    },
    actions: {
      setFilter,
      setSearchQuery,
      setIsModalOpen,
      setIsFilterModalOpen,
      setTempCategoryFilter,
      setExpenseToDelete,
      setExpenseToConfirm,
      setEditingExpense,
      handleAddOrUpdate,
      openNewModal,
      openEditModal,
      handleOpenFilters,
      handleApplyFilters,
      handleResetFilters,
      confirmDelete,
      confirmAction,
      rejectAction,
      handleConfirmPrompt,
      handleDeletePrompt,
      loadMoreHistory: () => loadHistoryPage(false),
      temporal: temporal.actions
    }
  };
}
