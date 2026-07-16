import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, PlannedExpense } from '../types';
import { addMonths, parseISO, format } from 'date-fns';
import { useAuth } from './AuthContext';

interface FinanceContextData {
  initialBalance: number | null;
  setInitialBalance: (val: number) => void;
  transactions: Transaction[];
  plannedExpenses: PlannedExpense[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addPlannedExpense: (pe: Omit<PlannedExpense, 'id'>) => void;
  updatePlannedExpense: (id: string, pe: Partial<PlannedExpense>) => void;
  confirmPlannedExpense: (id: string, transactionData: Omit<Transaction, 'id'>) => void;
  rejectPlannedExpense: (id: string) => void;
  deletePlannedExpense: (id: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  clearData: () => void;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid || 'guest';
  const BALANCE_KEY = `@financas:initialBalance:${uid}`;
  const TX_KEY = `@financas:transactions:${uid}`;
  const PLANNED_KEY = `@financas:planned:${uid}`;

  const [initialBalance, setInitialBalanceState] = useState<number | null>(() => {
    const localIB = localStorage.getItem(BALANCE_KEY);
    return localIB ? JSON.parse(localIB) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const localT = localStorage.getItem(TX_KEY);
    return localT ? JSON.parse(localT) : [];
  });
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>(() => {
    const localP = localStorage.getItem(PLANNED_KEY);
    return localP ? JSON.parse(localP) : [];
  });

  // Re-initialize state when user changes
  useEffect(() => {
    const localIB = localStorage.getItem(BALANCE_KEY);
    setInitialBalanceState(localIB ? JSON.parse(localIB) : null);
    
    const localT = localStorage.getItem(TX_KEY);
    setTransactions(localT ? JSON.parse(localT) : []);
    
    const localP = localStorage.getItem(PLANNED_KEY);
    setPlannedExpenses(localP ? JSON.parse(localP) : []);
  }, [uid]);

  // Sync to local storage
  const setInitialBalance = (val: number) => {
    setInitialBalanceState(val);
    localStorage.setItem(BALANCE_KEY, JSON.stringify(val));
  };

  useEffect(() => {
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
  }, [transactions, uid]);

  useEffect(() => {
    localStorage.setItem(PLANNED_KEY, JSON.stringify(plannedExpenses));
  }, [plannedExpenses, uid]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...t, id: Date.now().toString() }]);
  };

  const updateTransaction = (id: string, updatedData: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addPlannedExpense = (pe: Omit<PlannedExpense, 'id'>) => {
    setPlannedExpenses(prev => [...prev, { ...pe, id: Date.now().toString() }]);
  };

  const updatePlannedExpense = (id: string, updatedData: Partial<PlannedExpense>) => {
    setPlannedExpenses(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const confirmPlannedExpense = (id: string, transactionData: Omit<Transaction, 'id'>) => {
    setPlannedExpenses(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      const expense = prev[idx];
      const newList = [...prev];
      
      // Update status to confirmed
      newList[idx] = { ...expense, status: 'confirmed' };
      
      // Create actual transaction
      addTransaction({
        ...transactionData,
        plannedExpenseId: expense.id
      });

      // Handle recurrence
      if (expense.isRecurring) {
        const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
        newList.push({
          ...expense,
          id: (Date.now() + 1).toString(),
          dueDate: format(nextDate, 'yyyy-MM-dd'),
          status: 'pending'
        });
      }

      return newList;
    });
  };

  const rejectPlannedExpense = (id: string) => {
    setPlannedExpenses(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      const expense = prev[idx];
      const newList = [...prev];
      
      // Update status to cancelled
      newList[idx] = { ...expense, status: 'cancelled' };
      
      // Handle recurrence
      if (expense.isRecurring) {
        const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
        newList.push({
          ...expense,
          id: (Date.now() + 1).toString(),
          dueDate: format(nextDate, 'yyyy-MM-dd'),
          status: 'pending'
        });
      }

      return newList;
    });
  };

  const deletePlannedExpense = (id: string) => {
    setPlannedExpenses(prev => prev.filter(p => p.id !== id));
  };

  const exportData = () => {
    const data = {
      initialBalance,
      transactions,
      plannedExpenses
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minhas-financas-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.initialBalance !== undefined) setInitialBalanceState(data.initialBalance);
      if (data.transactions) setTransactions(data.transactions);
      if (data.plannedExpenses) setPlannedExpenses(data.plannedExpenses);
      
      // Update local storage directly for initialBalance since setInitialBalanceState doesn't do it
      if (data.initialBalance !== undefined) {
        localStorage.setItem(BALANCE_KEY, JSON.stringify(data.initialBalance));
      }
      return true;
    } catch (e) {
      console.error("Failed to import data", e);
      return false;
    }
  };

  const clearData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os seus dados? Esta ação não pode ser desfeita.')) {
      setInitialBalanceState(0);
      localStorage.setItem(BALANCE_KEY, JSON.stringify(0));
      setTransactions([]);
      setPlannedExpenses([]);
    }
  };

  return (
    <FinanceContext.Provider value={{
      initialBalance,
      setInitialBalance,
      transactions,
      plannedExpenses,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addPlannedExpense,
      updatePlannedExpense,
      confirmPlannedExpense,
      rejectPlannedExpense,
      deletePlannedExpense,
      exportData,
      importData,
      clearData
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
