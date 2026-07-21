import { useState, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { FilterType, TransactionType, ExpenseStatus } from '../../../enums/FinanceEnums';
import type { PlannedExpense, Transaction } from '../../../types';
import { expandPlannedExpenses } from '../../../utils/financeUtils';
import type { ExpandedPlannedExpense } from '../../../utils/financeUtils';
import { useFinance } from '../../../store/FinanceContext';
import { useLocale } from '../../../store/LocaleContext';

export function usePlannedExpensesViewModel() {
  const { plannedExpenses, addPlannedExpense, updatePlannedExpense, confirmPlannedExpense, rejectPlannedExpense, deletePlannedExpense } = useFinance();
  const { locale, t } = useLocale();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultMonth = 'all';
  const defaultYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [tempSelectedMonth, setTempSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(defaultYear);
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');

  const [editingExpense, setEditingExpense] = useState<PlannedExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [expenseToConfirm, setExpenseToConfirm] = useState<PlannedExpense | null>(null);

  const expandedPlannedExpenses = useMemo(() => expandPlannedExpenses(plannedExpenses), [plannedExpenses]);

  const periodPendingExpenses = useMemo(() => expandedPlannedExpenses
    .filter(p => {
      const pMonth = parseISO(p.dueDate).getUTCMonth();
      const pYear = parseISO(p.dueDate).getUTCFullYear();
      
      const isPending = p.status === ExpenseStatus.PENDING;
      const matchesMonth = selectedMonth === 'all' || pMonth === selectedMonth;
      const matchesYear = pYear === selectedYear;
      const matchesSearch = !searchQuery || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return isPending && matchesMonth && matchesYear && matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), 
    [expandedPlannedExpenses, selectedMonth, selectedYear, searchQuery, categoryFilter]
  );

  const pendingExpenses = useMemo(
    () => periodPendingExpenses.filter(p => filter === FilterType.ALL || p.type === filter || (!p.type && filter === FilterType.EXPENSE)),
    [periodPendingExpenses, filter]
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
    setTempSelectedMonth(selectedMonth);
    setTempSelectedYear(selectedYear);
    setTempCategoryFilter(categoryFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedMonth(tempSelectedMonth);
    setSelectedYear(tempSelectedYear);
    setCategoryFilter(tempCategoryFilter);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
    setCategoryFilter('all');
    
    setTempSelectedMonth(defaultMonth);
    setTempSelectedYear(defaultYear);
    setTempCategoryFilter('all');
    
    setIsFilterModalOpen(false);
  };

  const filterLabel = selectedMonth === 'all' 
    ? t('filters.fullYearOf', { year: selectedYear })
    : t('filters.monthOfYear', { month: new Date(2000, selectedMonth as number, 1).toLocaleString(locale, { month: 'long' }).replace(/^\w/, c => c.toUpperCase()), year: selectedYear });

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
      selectedMonth,
      selectedYear,
      categoryFilter,
      tempSelectedMonth,
      tempSelectedYear,
      tempCategoryFilter,
      editingExpense,
      expenseToDelete,
      expenseToConfirm,
      filterLabel,
      defaultYear
    },
    actions: {
      setFilter,
      setSearchQuery,
      setIsModalOpen,
      setIsFilterModalOpen,
      setTempSelectedMonth,
      setTempSelectedYear,
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
      handleDeletePrompt
    }
  };
}
