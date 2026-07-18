import { useState, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { FilterType, TransactionType, ExpenseStatus } from '../../../enums/FinanceEnums';
import type { PlannedExpense } from '../../../types';
import { expandPlannedExpenses } from '../../../utils/financeUtils';
import type { ExpandedPlannedExpense } from '../../../utils/financeUtils';
import { useFinance } from '../../../store/FinanceContext';
import { PlannedExpenseService } from '../../../services/PlannedExpenseService';
import { useAuth } from '../../../store/AuthContext';

export function usePlannedExpensesViewModel() {
  const { plannedExpenses, addPlannedExpense, updatePlannedExpense, confirmPlannedExpense, rejectPlannedExpense, deletePlannedExpense } = useFinance();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultMonth = 'all';
  const defaultYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const [tempSelectedMonth, setTempSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(defaultYear);

  const [editingExpense, setEditingExpense] = useState<PlannedExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [expenseToConfirm, setExpenseToConfirm] = useState<PlannedExpense | null>(null);

  const expandedPlannedExpenses = useMemo(() => expandPlannedExpenses(plannedExpenses), [plannedExpenses]);

  const pendingExpenses = useMemo(() => expandedPlannedExpenses
    .filter(p => {
      const pMonth = parseISO(p.dueDate).getUTCMonth();
      const pYear = parseISO(p.dueDate).getUTCFullYear();
      
      const isPending = p.status === ExpenseStatus.PENDING;
      const matchesFilter = filter === FilterType.ALL || p.type === filter || (!p.type && filter === FilterType.EXPENSE);
      const matchesMonth = selectedMonth === 'all' || pMonth === selectedMonth;
      const matchesYear = pYear === selectedYear;
      const matchesSearch = !searchQuery || p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return isPending && matchesFilter && matchesMonth && matchesYear && matchesSearch;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), 
    [expandedPlannedExpenses, filter, selectedMonth, selectedYear, searchQuery]
  );

  const totalIncome = useMemo(() => pendingExpenses.filter(p => p.type === TransactionType.INCOME).reduce((acc, p) => acc + p.amount, 0), [pendingExpenses]);
  const totalExpense = useMemo(() => pendingExpenses.filter(p => p.type === TransactionType.EXPENSE || !p.type).reduce((acc, p) => acc + p.amount, 0), [pendingExpenses]);

  const handleAddOrUpdate = async (data: any) => {
    if (user?.uid) {
      if (editingExpense && editingExpense.id) {
        await PlannedExpenseService.updatePlannedExpense(user.uid, editingExpense.id, data);
      } else {
        await PlannedExpenseService.addPlannedExpense(user.uid, data);
      }
    } else {
      if (editingExpense) {
        updatePlannedExpense(editingExpense.id!, data);
      } else {
        addPlannedExpense(data);
      }
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
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedMonth(tempSelectedMonth);
    setSelectedYear(tempSelectedYear);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
    
    setTempSelectedMonth(defaultMonth);
    setTempSelectedYear(defaultYear);
    
    setIsFilterModalOpen(false);
  };

  const filterLabel = selectedMonth === 'all' 
    ? `Ano todo, ${selectedYear}`
    : `${new Date(2000, selectedMonth as number, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())} de ${selectedYear}`;

  const confirmDelete = async () => {
    if (expenseToDelete) {
      if (user?.uid) {
        await PlannedExpenseService.deletePlannedExpense(user.uid, expenseToDelete);
      } else {
        deletePlannedExpense(expenseToDelete);
      }
      setExpenseToDelete(null);
    }
  };

  const confirmAction = async (data: any) => {
    if (expenseToConfirm && expenseToConfirm.id) {
      if (user?.uid) {
        await PlannedExpenseService.confirmPlannedExpense(user.uid, expenseToConfirm.id, data);
      } else {
        confirmPlannedExpense(expenseToConfirm.id, data);
      }
      setExpenseToConfirm(null);
    }
  };

  const rejectAction = async (id: string) => {
    const originalId = pendingExpenses.find(px => px.id === id)?.originalId || id;
    if (user?.uid) {
      await PlannedExpenseService.rejectPlannedExpense(user.uid, originalId);
    } else {
      rejectPlannedExpense(originalId);
    }
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
      tempSelectedMonth,
      tempSelectedYear,
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
