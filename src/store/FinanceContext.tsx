import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, PlannedExpense } from '../types';
import { addMonths, parseISO, format } from 'date-fns';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase';
import { 
  collection, doc, setDoc, updateDoc, deleteDoc, 
  onSnapshot, addDoc, writeBatch
} from 'firebase/firestore';

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

    const unsubUser = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.initialBalance !== undefined) {
          setInitialBalanceState(data.initialBalance);
        }
      }
      setIsLoading(false);
    });

    const unsubTx = onSnapshot(collection(db, 'users', uid, 'transactions'), (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach(d => txs.push({ ...d.data(), id: d.id } as Transaction));
      setTransactions(txs);
    });

    const unsubPlan = onSnapshot(collection(db, 'users', uid, 'plannedExpenses'), (snapshot) => {
      const plans: PlannedExpense[] = [];
      snapshot.forEach(d => plans.push({ ...d.data(), id: d.id } as PlannedExpense));
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
    await setDoc(doc(db, 'users', uid), { initialBalance: val }, { merge: true });
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!uid) return;
    await addDoc(collection(db, 'users', uid, 'transactions'), t);
  };

  const updateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'transactions', id), updatedData);
  };

  const deleteTransaction = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'transactions', id));
  };

  const addPlannedExpense = async (pe: Omit<PlannedExpense, 'id'>) => {
    if (!uid) return;
    await addDoc(collection(db, 'users', uid, 'plannedExpenses'), pe);
  };

  const updatePlannedExpense = async (id: string, updatedData: Partial<PlannedExpense>) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'plannedExpenses', id), updatedData);
  };

  const confirmPlannedExpense = async (id: string, transactionData: Omit<Transaction, 'id'>) => {
    if (!uid) return;
    const expense = plannedExpenses.find(p => p.id === id);
    if (!expense) return;

    const batch = writeBatch(db);
    
    batch.update(doc(db, 'users', uid, 'plannedExpenses', id), { status: 'confirmed' });
    
    const newTxRef = doc(collection(db, 'users', uid, 'transactions'));
    batch.set(newTxRef, { ...transactionData, plannedExpenseId: expense.id });

    if (expense.isRecurring) {
      const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
      const newPlanRef = doc(collection(db, 'users', uid, 'plannedExpenses'));
      batch.set(newPlanRef, { ...expense, dueDate: format(nextDate, 'yyyy-MM-dd'), status: 'pending' });
    }

    await batch.commit();
  };

  const rejectPlannedExpense = async (id: string) => {
    if (!uid) return;
    const expense = plannedExpenses.find(p => p.id === id);
    if (!expense) return;

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid, 'plannedExpenses', id), { status: 'cancelled' });

    if (expense.isRecurring) {
      const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
      const newPlanRef = doc(collection(db, 'users', uid, 'plannedExpenses'));
      batch.set(newPlanRef, { ...expense, dueDate: format(nextDate, 'yyyy-MM-dd'), status: 'pending' });
    }

    await batch.commit();
  };

  const deletePlannedExpense = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'plannedExpenses', id));
  };

  const exportData = () => {
    const data = { initialBalance, transactions, plannedExpenses };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minhas-financas-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (jsonData: string) => {
    if (!uid) return false;
    try {
      const data = JSON.parse(jsonData);
      const batch = writeBatch(db);

      if (data.initialBalance !== undefined) {
        batch.set(doc(db, 'users', uid), { initialBalance: data.initialBalance }, { merge: true });
      }

      if (data.transactions && Array.isArray(data.transactions)) {
        for (const t of data.transactions) {
          const { id, ...rest } = t;
          const ref = id ? doc(db, 'users', uid, 'transactions', id) : doc(collection(db, 'users', uid, 'transactions'));
          batch.set(ref, rest);
        }
      }

      if (data.plannedExpenses && Array.isArray(data.plannedExpenses)) {
        for (const p of data.plannedExpenses) {
          const { id, ...rest } = p;
          const ref = id ? doc(db, 'users', uid, 'plannedExpenses', id) : doc(collection(db, 'users', uid, 'plannedExpenses'));
          batch.set(ref, rest);
        }
      }
      
      await batch.commit();
      return true;
    } catch (e) {
      console.error("Failed to import data", e);
      return false;
    }
  };

  const clearData = async () => {
    if (!uid) return;
    if (window.confirm('Tem certeza que deseja apagar todos os seus dados da nuvem? Esta ação não pode ser desfeita.')) {
      const batch = writeBatch(db);
      
      batch.set(doc(db, 'users', uid), { initialBalance: 0 }, { merge: true });
      transactions.forEach(t => {
        if (t.id) batch.delete(doc(db, 'users', uid, 'transactions', t.id));
      });
      plannedExpenses.forEach(p => {
        if (p.id) batch.delete(doc(db, 'users', uid, 'plannedExpenses', p.id));
      });
      
      await batch.commit();
    }
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
