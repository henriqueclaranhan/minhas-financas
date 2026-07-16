import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, PlannedExpense } from '../types';
import { addMonths, parseISO, format } from 'date-fns';

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
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [initialBalance, setInitialBalanceState] = useState<number | null>(() => {
    const localIB = localStorage.getItem('@financas:initialBalance');
    return localIB ? JSON.parse(localIB) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const localT = localStorage.getItem('@financas:transactions');
    return localT ? JSON.parse(localT) : [];
  });
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>(() => {
    const localP = localStorage.getItem('@financas:planned');
    return localP ? JSON.parse(localP) : [];
  });

  // Sync to local storage
  const setInitialBalance = (val: number) => {
    setInitialBalanceState(val);
    localStorage.setItem('@financas:initialBalance', JSON.stringify(val));
  };

  useEffect(() => {
    localStorage.setItem('@financas:transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('@financas:planned', JSON.stringify(plannedExpenses));
  }, [plannedExpenses]);

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
      deletePlannedExpense
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
