import {
  collection, doc, documentId, getDocs, limit, onSnapshot, orderBy,
  query, runTransaction, startAfter, where, writeBatch,
} from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Transaction } from '../types';
import { removeUndefinedFields } from './firestoreData';
import { buildCompetenceEntries, getCompetenceEntryId } from '../utils/competenceEntryUtils';

export class TransactionService {
  static readonly HISTORY_PAGE_SIZE = 40;

  static async getHistoryPage(
    uid: string,
    period: { startDate: string; endDate: string },
    cursor?: { date: string; id: string },
  ): Promise<{ transactions: Transaction[]; cursor?: { date: string; id: string }; hasMore: boolean }> {
    if (!uid) throw new Error('User ID is required');
    const constraints: QueryConstraint[] = [
      where('date', '>=', period.startDate),
      where('date', '<=', period.endDate),
      orderBy('date', 'desc'),
      orderBy(documentId(), 'desc'),
    ];
    if (cursor) constraints.push(startAfter(cursor.date, cursor.id));
    constraints.push(limit(this.HISTORY_PAGE_SIZE));
    const snapshot = await getDocs(query(collection(db, 'users', uid, 'transactions'), ...constraints));
    const transactions = snapshot.docs.map(item => ({ ...item.data(), id: item.id } as Transaction));
    const last = transactions[transactions.length - 1];
    return {
      transactions,
      cursor: last?.id ? { date: last.date, id: last.id } : undefined,
      hasMore: transactions.length === this.HISTORY_PAGE_SIZE,
    };
  }
  /**
   * Adds a new transaction for the given user
   */
  static async addTransaction(uid: string, t: Omit<Transaction, 'id'>): Promise<string> {
    if (!uid) throw new Error("User ID is required");
    const transactionRef = doc(collection(db, 'users', uid, 'transactions'));
    const batch = writeBatch(db);
    batch.set(transactionRef, removeUndefinedFields(t));
    buildCompetenceEntries(transactionRef.id, t).forEach(entry => {
      const { id, ...storedEntry } = entry;
      batch.set(doc(db, 'users', uid, 'competenceEntries', id!), removeUndefinedFields(storedEntry));
    });
    await batch.commit();
    return transactionRef.id;
  }

  /**
   * Updates an existing transaction
   */
  static async updateTransaction(uid: string, transactionId: string, updatedData: Partial<Transaction>): Promise<void> {
    if (!uid || !transactionId) throw new Error("User ID and Transaction ID are required");
    const transactionRef = doc(db, 'users', uid, 'transactions', transactionId);
    const { id: _clientId, ...storedData } = updatedData;
    void _clientId;
    const cleanData = removeUndefinedFields(storedData);
    await runTransaction(db, async firestoreTransaction => {
      const currentSnapshot = await firestoreTransaction.get(transactionRef);
      if (!currentSnapshot.exists()) throw new Error('Transaction not found');
      const current = currentSnapshot.data() as Transaction;
      const next = { ...current, ...cleanData } as Omit<Transaction, 'id'>;
      const oldCount = buildCompetenceEntries(transactionId, current).length;
      const nextEntries = buildCompetenceEntries(transactionId, next);
      firestoreTransaction.update(transactionRef, cleanData);
      nextEntries.forEach(entry => {
        const { id, ...storedEntry } = entry;
        firestoreTransaction.set(doc(db, 'users', uid, 'competenceEntries', id!), removeUndefinedFields(storedEntry));
      });
      for (let position = nextEntries.length + 1; position <= oldCount; position += 1) {
        firestoreTransaction.delete(doc(db, 'users', uid, 'competenceEntries', getCompetenceEntryId(transactionId, position)));
      }
    });
  }

  /**
   * Deletes a transaction
   */
  static async deleteTransaction(uid: string, transactionId: string): Promise<void> {
    if (!uid || !transactionId) throw new Error("User ID and Transaction ID are required");
    const transactionRef = doc(db, 'users', uid, 'transactions', transactionId);
    await runTransaction(db, async firestoreTransaction => {
      const currentSnapshot = await firestoreTransaction.get(transactionRef);
      if (!currentSnapshot.exists()) return;
      const entries = buildCompetenceEntries(transactionId, currentSnapshot.data() as Transaction);
      firestoreTransaction.delete(transactionRef);
      entries.forEach(entry => firestoreTransaction.delete(doc(db, 'users', uid, 'competenceEntries', entry.id!)));
    });
  }

  /**
   * Subscribes to real-time transaction updates
   */
  static subscribeToTransactions(
    uid: string,
    onUpdate: (txs: Transaction[]) => void,
    onError: (error: Error) => void,
  ): () => void {
    if (!uid) throw new Error("User ID is required");
    const transactionQuery = query(
      collection(db, 'users', uid, 'transactions'),
      orderBy('date', 'desc'),
      limit(50),
    );
    const unsub = onSnapshot(transactionQuery, (snapshot: any) => {
      const txs: Transaction[] = [];
      snapshot.forEach((d: any) => txs.push({ ...d.data(), id: d.id } as Transaction));
      onUpdate(txs);
    }, onError);
    return unsub;
  }
}
