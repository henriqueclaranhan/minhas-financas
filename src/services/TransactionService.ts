import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Transaction } from '../types';
import { removeUndefinedFields } from './firestoreData';

export class TransactionService {
  /**
   * Adds a new transaction for the given user
   */
  static async addTransaction(uid: string, t: Omit<Transaction, 'id'>): Promise<string> {
    if (!uid) throw new Error("User ID is required");
    const docRef = await addDoc(
      collection(db, 'users', uid, 'transactions'),
      removeUndefinedFields(t),
    );
    return docRef.id;
  }

  /**
   * Updates an existing transaction
   */
  static async updateTransaction(uid: string, transactionId: string, updatedData: Partial<Transaction>): Promise<void> {
    if (!uid || !transactionId) throw new Error("User ID and Transaction ID are required");
    const { id: _clientId, ...storedData } = updatedData;
    void _clientId;
    await updateDoc(
      doc(db, 'users', uid, 'transactions', transactionId),
      removeUndefinedFields(storedData),
    );
  }

  /**
   * Deletes a transaction
   */
  static async deleteTransaction(uid: string, transactionId: string): Promise<void> {
    if (!uid || !transactionId) throw new Error("User ID and Transaction ID are required");
    await deleteDoc(doc(db, 'users', uid, 'transactions', transactionId));
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
    );
    const unsub = onSnapshot(transactionQuery, (snapshot: any) => {
      const txs: Transaction[] = [];
      snapshot.forEach((d: any) => txs.push({ ...d.data(), id: d.id } as Transaction));
      onUpdate(txs);
    }, onError);
    return unsub;
  }
}
