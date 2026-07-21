import { collection, doc, getDoc, getDocs, limit, query, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Transaction, PlannedExpense } from '../types';
import { validateImportData } from './dataImportValidation';

const BATCH_SIZE = 400;

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
      const data = validateImportData(jsonData);
      const suppliedRefs = [
        ...data.transactions.filter(item => item.id).map(item => doc(db, 'users', uid, 'transactions', item.id!)),
        ...data.plannedExpenses.filter(item => item.id).map(item => doc(db, 'users', uid, 'plannedExpenses', item.id!)),
      ];
      for (let start = 0; start < suppliedRefs.length; start += 100) {
        const existing = await Promise.all(suppliedRefs.slice(start, start + 100).map(ref => getDoc(ref)));
        if (existing.some(snapshot => snapshot.exists())) throw new Error('Import would overwrite existing documents');
      }

      const operations: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
      if (data.initialBalance !== undefined) {
        operations.push(batch => batch.set(doc(db, 'users', uid), { initialBalance: data.initialBalance }, { merge: true }));
      }
      for (const transaction of data.transactions) {
        const { id, ...storedTransaction } = transaction;
        const ref = id ? doc(db, 'users', uid, 'transactions', id) : doc(collection(db, 'users', uid, 'transactions'));
        operations.push(batch => batch.set(ref, storedTransaction));
      }
      for (const plannedExpense of data.plannedExpenses) {
        const { id, ...storedExpense } = plannedExpense;
        const ref = id ? doc(db, 'users', uid, 'plannedExpenses', id) : doc(collection(db, 'users', uid, 'plannedExpenses'));
        operations.push(batch => batch.set(ref, storedExpense));
      }

      for (let start = 0; start < operations.length; start += BATCH_SIZE) {
        const batch = writeBatch(db);
        operations.slice(start, start + BATCH_SIZE).forEach(operation => operation(batch));
        await batch.commit();
      }
      return true;
    } catch (e) {
      console.error("Failed to import data", e);
      return false;
    }
  }

  static async clearData(uid: string): Promise<void> {
    if (!uid) return;
    if (window.confirm('Tem certeza que deseja apagar todos os seus dados da nuvem? Esta ação não pode ser desfeita.')) {
      for (const collectionName of ['transactions', 'plannedExpenses']) {
        while (true) {
          const snapshot = await getDocs(query(collection(db, 'users', uid, collectionName), limit(BATCH_SIZE)));
          if (snapshot.empty) break;
          const batch = writeBatch(db);
          snapshot.docs.forEach(document => batch.delete(document.ref));
          await batch.commit();
        }
      }
      const userBatch = writeBatch(db);
      userBatch.set(doc(db, 'users', uid), { initialBalance: 0 }, { merge: true });
      await userBatch.commit();
    }
  }
}
