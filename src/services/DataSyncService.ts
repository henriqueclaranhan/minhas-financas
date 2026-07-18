import { doc, writeBatch, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Transaction, PlannedExpense } from '../types';

export class DataSyncService {
  static exportData(initialBalance: number | null, transactions: Transaction[], plannedExpenses: PlannedExpense[]) {
    const data = { initialBalance, transactions, plannedExpenses };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minhas-financas-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static async importData(uid: string, jsonData: string): Promise<boolean> {
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
  }

  static async clearData(uid: string, transactions: Transaction[], plannedExpenses: PlannedExpense[]): Promise<void> {
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
  }
}
