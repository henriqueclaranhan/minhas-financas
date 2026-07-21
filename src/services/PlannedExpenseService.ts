import { collection, doc, addDoc, updateDoc, deleteDoc, limit, onSnapshot, orderBy, query, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { PlannedExpense, Transaction } from '../types';
import { addMonths, parseISO, format } from 'date-fns';
import { ExpenseStatus } from '../enums/FinanceEnums';

export class PlannedExpenseService {
  static subscribeToPlannedExpenses(
    uid: string,
    pageSize: number,
    onUpdate: (plans: PlannedExpense[], hasMore: boolean) => void,
    onError: (error: Error) => void,
  ): () => void {
    if (!uid) throw new Error("User ID is required");
    const plannedExpenseQuery = query(
      collection(db, 'users', uid, 'plannedExpenses'),
      orderBy('dueDate', 'desc'),
      limit(pageSize),
    );
    const unsub = onSnapshot(plannedExpenseQuery, (snapshot: any) => {
      const plans: PlannedExpense[] = [];
      snapshot.forEach((d: any) => plans.push({ ...d.data(), id: d.id } as PlannedExpense));
      onUpdate(plans, snapshot.size === pageSize);
    }, onError);
    return unsub;
  }
  static async addPlannedExpense(uid: string, pe: Omit<PlannedExpense, 'id'>): Promise<string> {
    if (!uid) throw new Error("User ID is required");
    const docRef = await addDoc(collection(db, 'users', uid, 'plannedExpenses'), pe);
    return docRef.id;
  }

  static async updatePlannedExpense(uid: string, id: string, updatedData: Partial<PlannedExpense>): Promise<void> {
    if (!uid || !id) throw new Error("User ID and Expense ID are required");
    await updateDoc(doc(db, 'users', uid, 'plannedExpenses', id), updatedData);
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
      firestoreTransaction.set(transactionRef, { ...transactionData, plannedExpenseId: id, sourceKey });

      if (expense.isRecurring) {
        const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
        const { id: _ignoredId, ...nextExpense } = expense;
        void _ignoredId;
        firestoreTransaction.set(nextPlanRef, {
          ...nextExpense,
          dueDate: format(nextDate, 'yyyy-MM-dd'),
          status: ExpenseStatus.PENDING,
          sourcePlannedExpenseId: id,
        });
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
        firestoreTransaction.set(nextPlanRef, {
          ...nextExpense,
          dueDate: format(nextDate, 'yyyy-MM-dd'),
          status: ExpenseStatus.PENDING,
          sourcePlannedExpenseId: id,
        });
      }
    });
  }
}
