import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Transaction } from '../types';

export class TransactionService {
  /**
   * Adds a new transaction for the given user
   */
  static async addTransaction(uid: string, t: Omit<Transaction, 'id'>): Promise<string> {
    if (!uid) throw new Error("User ID is required");
    const docRef = await addDoc(collection(db, 'users', uid, 'transactions'), t);
    return docRef.id;
  }

  /**
   * Updates an existing transaction
   */
  static async updateTransaction(uid: string, transactionId: string, updatedData: Partial<Transaction>): Promise<void> {
    if (!uid || !transactionId) throw new Error("User ID and Transaction ID are required");
    await updateDoc(doc(db, 'users', uid, 'transactions', transactionId), updatedData);
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
  static subscribeToTransactions(uid: string, onUpdate: (txs: Transaction[]) => void): () => void {
    if (!uid) throw new Error("User ID is required");
    const unsub = onSnapshot(collection(db, 'users', uid, 'transactions'), (snapshot: any) => {
      const txs: Transaction[] = [];
      snapshot.forEach((d: any) => txs.push({ ...d.data(), id: d.id } as Transaction));
      onUpdate(txs);
    });
    return unsub;
  }
}
