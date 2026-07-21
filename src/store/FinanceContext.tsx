import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Transaction, PlannedExpense } from '../types';
import { useAuth } from './AuthContext';
import { TransactionService } from '../services/TransactionService';
import { PlannedExpenseService } from '../services/PlannedExpenseService';
import { UserService } from '../services/UserService';
import { DataSyncService } from '../services/DataSyncService';
import { useLocale } from './LocaleContext';
import { useToast } from './ToastContext';
import { FinanceMigrationService } from '../services/FinanceMigrationService';
import type { ImportProgress } from '../services/DataSyncService';

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
  exportData: () => Promise<void>;
  importData: (jsonData: string, onProgress?: (progress: ImportProgress) => void) => Promise<boolean>;
  clearData: () => Promise<void>;
  isLoading: boolean;
  error: FinanceError | null;
  retry: () => void;
  isSchemaReady: boolean;
}

export interface FinanceError {
  source: 'user' | 'transactions' | 'plannedExpenses' | 'migration';
  message: string;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t } = useLocale();
  const toast = useToast();
  const uid = user?.uid || '';

  const [initialBalance, setInitialBalanceState] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<FinanceError | null>(null);
  const [retryGeneration, setRetryGeneration] = useState(0);
  const [isSchemaReady, setIsSchemaReady] = useState(false);

  useEffect(() => {
    if (!uid) {
      setIsSchemaReady(true);
      return;
    }
    let active = true;
    setIsSchemaReady(false);
    setError(current => current?.source === 'migration' ? null : current);
    FinanceMigrationService.ensureCurrentSchema(uid)
      .then(() => { if (active) setIsSchemaReady(true); })
      .catch(migrationError => {
        if (!active) return;
        setError({ source: 'migration', message: (migrationError as Error).message });
      });
    return () => { active = false; };
  }, [retryGeneration, uid]);

  const runMutation = useCallback(async <T,>(
    operation: () => Promise<T>,
    successKey: string,
    errorKey: string,
  ): Promise<T> => {
    try {
      const result = await operation();
      toast.success(t(successKey));
      return result;
    } catch (mutationError) {
      toast.error(t(errorKey));
      throw mutationError;
    }
  }, [t, toast]);

  useEffect(() => {
    if (!uid) {
      setInitialBalanceState(null);
      setLoadingUser(false);
      setError(current => current?.source === 'user' ? null : current);
      return;
    }

    setLoadingUser(true);
    setError(current => current?.source === 'user' ? null : current);

    const unsubUser = UserService.subscribeToInitialBalance(uid, (val) => {
      setInitialBalanceState(val);
      setLoadingUser(false);
      setError(current => current?.source === 'user' ? null : current);
    }, listenerError => {
      setError({ source: 'user', message: listenerError.message });
      setLoadingUser(false);
    });

    return unsubUser;
  }, [retryGeneration, uid]);

  useEffect(() => {
    if (!uid) {
      setTransactions([]);
      setLoadingTransactions(false);
      setError(current => current?.source === 'transactions' ? null : current);
      return;
    }

    setLoadingTransactions(true);
    setError(current => current?.source === 'transactions' ? null : current);

    const unsubTx = TransactionService.subscribeToTransactions(uid, (txs) => {
      setTransactions(txs);
      setLoadingTransactions(false);
      setError(current => current?.source === 'transactions' ? null : current);
    }, listenerError => {
      setError({ source: 'transactions', message: listenerError.message });
      setLoadingTransactions(false);
    });

    return unsubTx;
  }, [retryGeneration, uid]);

  useEffect(() => {
    if (!uid) {
      setPlannedExpenses([]);
      setLoadingPlans(false);
      setError(current => current?.source === 'plannedExpenses' ? null : current);
      return;
    }

    setLoadingPlans(true);
    setError(current => current?.source === 'plannedExpenses' ? null : current);

    const unsubPlan = PlannedExpenseService.subscribeToPlannedExpenses(uid, (plans) => {
      setPlannedExpenses(plans);
      setLoadingPlans(false);
      setError(current => current?.source === 'plannedExpenses' ? null : current);
    }, listenerError => {
      setError({ source: 'plannedExpenses', message: listenerError.message });
      setLoadingPlans(false);
    });

    return unsubPlan;
  }, [retryGeneration, uid]);

  const setInitialBalance = useCallback(async (val: number) => {
    if (!uid) return;
    await UserService.updateInitialBalance(uid, val);
  }, [uid]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    if (!uid) return;
    await runMutation(
      () => TransactionService.addTransaction(uid, t),
      'notifications.transactionCreated',
      'notifications.saveFailed',
    );
  }, [runMutation, uid]);

  const updateTransaction = useCallback(async (id: string, updatedData: Partial<Transaction>) => {
    if (!uid) return;
    await runMutation(
      () => TransactionService.updateTransaction(uid, id, updatedData),
      'notifications.transactionUpdated',
      'notifications.saveFailed',
    );
  }, [runMutation, uid]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!uid) return;
    await runMutation(
      () => TransactionService.deleteTransaction(uid, id),
      'notifications.transactionDeleted',
      'notifications.deleteFailed',
    );
  }, [runMutation, uid]);

  const addPlannedExpense = useCallback(async (pe: Omit<PlannedExpense, 'id'>) => {
    if (!uid) return;
    await runMutation(
      () => PlannedExpenseService.addPlannedExpense(uid, pe),
      'notifications.planningCreated',
      'notifications.saveFailed',
    );
  }, [runMutation, uid]);

  const updatePlannedExpense = useCallback(async (id: string, updatedData: Partial<PlannedExpense>) => {
    if (!uid) return;
    await runMutation(
      () => PlannedExpenseService.updatePlannedExpense(uid, id, updatedData),
      'notifications.planningUpdated',
      'notifications.saveFailed',
    );
  }, [runMutation, uid]);

  const confirmPlannedExpense = useCallback(async (id: string, transactionData: Omit<Transaction, 'id'>) => {
    if (!uid) return;
    await runMutation(
      () => PlannedExpenseService.confirmPlannedExpense(uid, id, transactionData),
      'notifications.planningConfirmed',
      'notifications.confirmFailed',
    );
  }, [runMutation, uid]);

  const rejectPlannedExpense = useCallback(async (id: string) => {
    if (!uid) return;
    await runMutation(
      () => PlannedExpenseService.rejectPlannedExpense(uid, id),
      'notifications.planningCancelled',
      'notifications.confirmFailed',
    );
  }, [runMutation, uid]);

  const deletePlannedExpense = useCallback(async (id: string) => {
    if (!uid) return;
    await runMutation(
      () => PlannedExpenseService.deletePlannedExpense(uid, id),
      'notifications.planningDeleted',
      'notifications.deleteFailed',
    );
  }, [runMutation, uid]);

  const exportData = useCallback(() => {
    return DataSyncService.exportData(uid, initialBalance);
  }, [initialBalance, uid]);

  const importData = useCallback(async (jsonData: string, onProgress?: (progress: ImportProgress) => void) => {
    if (!uid) return false;
    return DataSyncService.importData(uid, jsonData, onProgress);
  }, [uid]);

  const clearData = useCallback(async () => {
    if (!uid) return;
    await DataSyncService.clearData(uid);
  }, [uid]);

  const retry = useCallback(() => setRetryGeneration(generation => generation + 1), []);
  const isLoading = loadingUser || loadingTransactions || loadingPlans || !isSchemaReady;

  const value = useMemo<FinanceContextData>(() => ({
    initialBalance, setInitialBalance, transactions, plannedExpenses,
    addTransaction, updateTransaction, deleteTransaction,
    addPlannedExpense, updatePlannedExpense, confirmPlannedExpense,
    rejectPlannedExpense, deletePlannedExpense, exportData, importData, clearData,
    isLoading, error, retry, isSchemaReady,
  }), [
    addPlannedExpense, addTransaction, clearData, confirmPlannedExpense, deletePlannedExpense,
    deleteTransaction, error, exportData, importData,
    initialBalance, isLoading, isSchemaReady, plannedExpenses,
    rejectPlannedExpense, retry, setInitialBalance, transactions, updatePlannedExpense, updateTransaction,
  ]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

// Kept with the provider to preserve the stable context module consumed by the application and tests.
// oxlint-disable-next-line react/only-export-components
export const useFinance = () => useContext(FinanceContext);
