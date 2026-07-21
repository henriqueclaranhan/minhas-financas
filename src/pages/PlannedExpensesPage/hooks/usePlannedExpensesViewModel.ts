import { useEffect, useState, useMemo } from 'react';
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';
import { FilterType, TransactionType, ExpenseStatus, ExpenseCategory, IncomeCategory } from '../../../enums/FinanceEnums';
import type { PlannedExpense, Transaction } from '../../../types';
import { expandPlannedExpenses } from '../../../utils/financeUtils';
import type { ExpandedPlannedExpense } from '../../../utils/financeUtils';
import { useFinance } from '../../../store/FinanceContext';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { useQueryParamState } from '../../../hooks/useQueryParamState';

export function usePlannedExpensesViewModel() {
  const { plannedExpenses, addPlannedExpense, updatePlannedExpense, confirmPlannedExpense, rejectPlannedExpense, deletePlannedExpense, isLoading } = useFinance();
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
  const [visibleCount, setVisibleCount] = useState(40);

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
  const expandedPlannedExpenses = useMemo(
    () => expandPlannedExpenses(plannedExpenses, expansionPeriod),
    [expansionPeriod, plannedExpenses],
  );

  const periodPendingExpenses = useMemo(() => expandedPlannedExpenses
    .filter(p => {
      const isPending = p.status === ExpenseStatus.PENDING;
      const matchesPeriod = matchesDate(p.dueDate);
      const matchesSearch = !searchQuery || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return isPending && matchesPeriod && matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), 
    [expandedPlannedExpenses, matchesDate, searchQuery, categoryFilter]
  );

  const filteredPendingExpenses = useMemo(
    () => periodPendingExpenses.filter(p => filter === FilterType.ALL || p.type === filter || (!p.type && filter === FilterType.EXPENSE)),
    [periodPendingExpenses, filter]
  );
  useEffect(() => setVisibleCount(40), [categoryFilter, expansionPeriod, filter, searchQuery]);
  const pendingExpenses = useMemo(
    () => filteredPendingExpenses.slice(0, visibleCount),
    [filteredPendingExpenses, visibleCount],
  );

  const totalIncome = useMemo(() => periodPendingExpenses.filter(p => p.type === TransactionType.INCOME).reduce((acc, p) => acc + p.amount, 0), [periodPendingExpenses]);
  const totalExpense = useMemo(() => periodPendingExpenses.filter(p => p.type === TransactionType.EXPENSE || !p.type).reduce((acc, p) => acc + p.amount, 0), [periodPendingExpenses]);

  const handleAddOrUpdate = async (data: Omit<PlannedExpense, 'id'>) => {
    if (editingExpense?.id) {
      await updatePlannedExpense(editingExpense.id, data);
    } else {
      await addPlannedExpense(data);
    }
    
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const openNewModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ExpandedPlannedExpense) => {
    const originalP = p.originalId ? plannedExpenses.find(px => px.id === p.originalId) : p;
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
    }
  };

  const confirmAction = async (data: Omit<Transaction, 'id'>) => {
    if (expenseToConfirm && expenseToConfirm.id) {
      await confirmPlannedExpense(expenseToConfirm.id, data);
      setExpenseToConfirm(null);
    }
  };

  const rejectAction = async (id: string) => {
    const originalId = pendingExpenses.find(px => px.id === id)?.originalId || id;
    await rejectPlannedExpense(originalId);
  };

  const handleConfirmPrompt = (id: string) => {
    const p = pendingExpenses.find(px => px.id === id);
    setExpenseToConfirm(plannedExpenses.find(px => px.id === (p?.originalId || id)) || null);
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
      hasMoreHistory: visibleCount < filteredPendingExpenses.length,
      isLoadingHistory: false,
      historyError: false,
      isLoading,
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
      loadMoreHistory: () => setVisibleCount(count => count + 40),
      temporal: temporal.actions
    }
  };
}
