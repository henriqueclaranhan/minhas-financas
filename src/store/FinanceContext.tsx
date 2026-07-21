import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, PlannedExpense } from '../types';
import { useAuth } from './AuthContext';
import { TransactionService } from '../services/TransactionService';
import { PlannedExpenseService } from '../services/PlannedExpenseService';
import { UserService } from '../services/UserService';
import { DataSyncService } from '../services/DataSyncService';

interface FinanceContextData {
  initialBalance: number | null;
  setInitialBalance: (val: number) => void;
  transactions: Transaction[];
  plannedExpenses: PlannedExpense[];
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addPlannedExpense: (pe: Omit<PlannedExpense, 'id'>) => Promise<void>;
  updatePlannedExpense: (id: string, pe: Partial<PlannedExpense>) => Promise<void>;
  confirmPlannedExpense: (id: string, transactionData: Omit<Transaction, 'id'>) => Promise<void>;
  rejectPlannedExpense: (id: string) => Promise<void>;
  deletePlannedExpense: (id: string) => Promise<void>;
  exportData: () => void;
  importData: (jsonData: string) => Promise<boolean>;
  clearData: () => void;
  isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid || '';

  const [initialBalance, setInitialBalanceState] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setInitialBalanceState(null);
      setTransactions([]);
      setPlannedExpenses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubUser = UserService.subscribeToInitialBalance(uid, (val) => {
      setInitialBalanceState(val);
      setIsLoading(false);
    });

    const unsubTx = TransactionService.subscribeToTransactions(uid, (txs) => {
      setTransactions(txs);
    });

    const unsubPlan = PlannedExpenseService.subscribeToPlannedExpenses(uid, (plans) => {
      setPlannedExpenses(plans);
    });

    return () => {
      unsubUser();
      unsubTx();
      unsubPlan();
    };
  }, [uid]);

  const setInitialBalance = async (val: number) => {
    if (!uid) return;
    await UserService.updateInitialBalance(uid, val);
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!uid) return;
    await TransactionService.addTransaction(uid, t);
  };

  const updateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
    if (!uid) return;
    await TransactionService.updateTransaction(uid, id, updatedData);
  };

  const deleteTransaction = async (id: string) => {
    if (!uid) return;
    await TransactionService.deleteTransaction(uid, id);
  };

  const addPlannedExpense = async (pe: Omit<PlannedExpense, 'id'>) => {
    if (!uid) return;
    await PlannedExpenseService.addPlannedExpense(uid, pe);
  };

  const updatePlannedExpense = async (id: string, updatedData: Partial<PlannedExpense>) => {
    if (!uid) return;
    await PlannedExpenseService.updatePlannedExpense(uid, id, updatedData);
  };

  const confirmPlannedExpense = async (id: string, transactionData: Omit<Transaction, 'id'>) => {
    if (!uid) return;
    await PlannedExpenseService.confirmPlannedExpense(uid, id, transactionData);
  };

  const rejectPlannedExpense = async (id: string) => {
    if (!uid) return;
    await PlannedExpenseService.rejectPlannedExpense(uid, id);
  };

  const deletePlannedExpense = async (id: string) => {
    if (!uid) return;
    await PlannedExpenseService.deletePlannedExpense(uid, id);
  };

  const exportData = () => {
    DataSyncService.exportData(initialBalance, transactions, plannedExpenses);
  };

  const importData = async (jsonData: string) => {
    if (!uid) return false;
    return DataSyncService.importData(uid, jsonData);
  };

  const clearData = async () => {
    if (!uid) return;
    await DataSyncService.clearData(uid, transactions, plannedExpenses);
  };

  return (
    <FinanceContext.Provider value={{
      initialBalance, setInitialBalance, transactions, plannedExpenses,
      addTransaction, updateTransaction, deleteTransaction,
      addPlannedExpense, updatePlannedExpense, confirmPlannedExpense,
      rejectPlannedExpense, deletePlannedExpense, exportData, importData, clearData,
      isLoading
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
