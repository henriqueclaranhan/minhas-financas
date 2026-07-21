import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { PlannedExpense, Transaction } from '../types';
import { addMonths, parseISO, format } from 'date-fns';
import { ExpenseStatus } from '../enums/FinanceEnums';

export class PlannedExpenseService {
  static subscribeToPlannedExpenses(uid: string, onUpdate: (plans: PlannedExpense[]) => void): () => void {
    if (!uid) throw new Error("User ID is required");
    const unsub = onSnapshot(collection(db, 'users', uid, 'plannedExpenses'), (snapshot: any) => {
      const plans: PlannedExpense[] = [];
      snapshot.forEach((d: any) => plans.push({ ...d.data(), id: d.id } as PlannedExpense));
      onUpdate(plans);
    });
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
    
    const docRef = doc(db, 'users', uid, 'plannedExpenses', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Planned expense not found");
    
    const expense = docSnap.data() as PlannedExpense;
    const batch = writeBatch(db);
    
    batch.update(docRef, { status: ExpenseStatus.CONFIRMED });
    
    const newTxRef = doc(collection(db, 'users', uid, 'transactions'));
    batch.set(newTxRef, { ...transactionData, plannedExpenseId: id });

    if (expense.isRecurring) {
      const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
      const newPlanRef = doc(collection(db, 'users', uid, 'plannedExpenses'));
      batch.set(newPlanRef, { ...expense, dueDate: format(nextDate, 'yyyy-MM-dd'), status: ExpenseStatus.PENDING });
    }

    await batch.commit();
  }

  static async rejectPlannedExpense(uid: string, id: string): Promise<void> {
    if (!uid || !id) throw new Error("User ID and Expense ID are required");
    
    const docRef = doc(db, 'users', uid, 'plannedExpenses', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Planned expense not found");
    
    const expense = docSnap.data() as PlannedExpense;
    const batch = writeBatch(db);
    batch.update(docRef, { status: ExpenseStatus.CANCELLED });

    if (expense.isRecurring) {
      const nextDate = addMonths(parseISO(expense.dueDate), expense.recurrenceInterval);
      const newPlanRef = doc(collection(db, 'users', uid, 'plannedExpenses'));
      batch.set(newPlanRef, { ...expense, dueDate: format(nextDate, 'yyyy-MM-dd'), status: ExpenseStatus.PENDING });
    }

    await batch.commit();
  }
}
