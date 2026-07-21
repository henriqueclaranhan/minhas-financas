import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, orderBy, query, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { PlannedExpense, Transaction } from '../types';
import { addMonths, parseISO, format } from 'date-fns';
import { ExpenseStatus } from '../enums/FinanceEnums';
import { removeUndefinedFields } from './firestoreData';
import { buildCompetenceEntries } from '../utils/competenceEntryUtils';

export class PlannedExpenseService {
  static subscribeToPlannedExpenses(
    uid: string,
    onUpdate: (plans: PlannedExpense[]) => void,
    onError: (error: Error) => void,
  ): () => void {
    if (!uid) throw new Error("User ID is required");
    const plannedExpenseQuery = query(
      collection(db, 'users', uid, 'plannedExpenses'),
      orderBy('dueDate', 'desc'),
    );
    const unsub = onSnapshot(plannedExpenseQuery, (snapshot: any) => {
      const plans: PlannedExpense[] = [];
      snapshot.forEach((d: any) => plans.push({ ...d.data(), id: d.id } as PlannedExpense));
      onUpdate(plans);
    }, onError);
    return unsub;
  }
  static async addPlannedExpense(uid: string, pe: Omit<PlannedExpense, 'id'>): Promise<string> {
    if (!uid) throw new Error("User ID is required");
    const docRef = await addDoc(
      collection(db, 'users', uid, 'plannedExpenses'),
      removeUndefinedFields(pe),
    );
    return docRef.id;
  }

  static async updatePlannedExpense(uid: string, id: string, updatedData: Partial<PlannedExpense>): Promise<void> {
    if (!uid || !id) throw new Error("User ID and Expense ID are required");
    const { id: _clientId, ...storedData } = updatedData;
    void _clientId;
    await updateDoc(
      doc(db, 'users', uid, 'plannedExpenses', id),
      removeUndefinedFields(storedData),
    );
  }

  static async deletePlannedExpense(uid: string, id: string): Promise<void> {
    if (!uid || !id) throw new Error("User ID and Expense ID are required");
    await deleteDoc(doc(db, 'users', uid, 'plannedExpenses', id));
  }

  static async confirmPlannedExpense(uid: string, id: string, transactionData: Omit<Transaction, 'id'>): Promise<void> {
    if (!uid || !id) throw new Error("User ID and Expense ID are required");
    
    const expenseRef = doc(db, 'users', uid, 'plannedExpenses', id);
    const sourceKey = `plannedExpense:${id}:confirmation`;
    const transactionRef = doc(db, 'users', uid, 'transactions', `planned-expense-${id}-confirmation`);
    const nextPlanRef = doc(db, 'users', uid, 'plannedExpenses', `planned-expense-${id}-next`);

    await runTransaction(db, async firestoreTransaction => {
      const expenseSnapshot = await firestoreTransaction.get(expenseRef);
      if (!expenseSnapshot.exists()) throw new Error("Planned expense not found");

      const expense = expenseSnapshot.data() as PlannedExpense;
      if (expense.status !== ExpenseStatus.PENDING) {
        throw new Error("Planned expense already processed");
      }

      firestoreTransaction.update(expenseRef, { status: ExpenseStatus.CONFIRMED });
      firestoreTransaction.set(transactionRef, removeUndefinedFields({
        ...transactionData,
        plannedExpenseId: id,
        sourceKey,
      }));
      buildCompetenceEntries(transactionRef.id, transactionData).forEach(entry => {
        const { id: entryId, ...storedEntry } = entry;
        firestoreTransaction.set(
          doc(db, 'users', uid, 'competenceEntries', entryId!),
          removeUndefinedFields(storedEntry),
        );
      });

      if (expense.isRecurring) {
        const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
        const { id: _ignoredId, ...nextExpense } = expense;
        void _ignoredId;
        firestoreTransaction.set(nextPlanRef, removeUndefinedFields({
          ...nextExpense,
          dueDate: format(nextDate, 'yyyy-MM-dd'),
          status: ExpenseStatus.PENDING,
          sourcePlannedExpenseId: id,
        }));
      }
    });
  }

  static async rejectPlannedExpense(uid: string, id: string): Promise<void> {
    if (!uid || !id) throw new Error("User ID and Expense ID are required");
    
    const expenseRef = doc(db, 'users', uid, 'plannedExpenses', id);
    const nextPlanRef = doc(db, 'users', uid, 'plannedExpenses', `planned-expense-${id}-next`);

    await runTransaction(db, async firestoreTransaction => {
      const expenseSnapshot = await firestoreTransaction.get(expenseRef);
      if (!expenseSnapshot.exists()) throw new Error("Planned expense not found");

      const expense = expenseSnapshot.data() as PlannedExpense;
      if (expense.status !== ExpenseStatus.PENDING) {
        throw new Error("Planned expense already processed");
      }

      firestoreTransaction.update(expenseRef, { status: ExpenseStatus.CANCELLED });
      if (expense.isRecurring) {
        const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
        const { id: _ignoredId, ...nextExpense } = expense;
        void _ignoredId;
        firestoreTransaction.set(nextPlanRef, removeUndefinedFields({
          ...nextExpense,
          dueDate: format(nextDate, 'yyyy-MM-dd'),
          status: ExpenseStatus.PENDING,
          sourcePlannedExpenseId: id,
        }));
      }
    });
  }
}
