import { TransactionType, PaymentMethod, ExpenseStatus } from '../enums/FinanceEnums';

export interface Transaction {
  id?: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  installments: number;
  date: string; // ISO format: YYYY-MM-DD
  type?: TransactionType;
  plannedExpenseId?: string;
  sourceKey?: string;
  category?: string;
  sourcePlannedExpenseId?: string;
}

export interface PlannedExpense {
  id?: string;
  description: string;
  amount: number;
  dueDate: string; // ISO format: YYYY-MM-DD
  isRecurring: boolean;
  recurrenceInterval: number; // in months (e.g. 1 for every month)
  status: ExpenseStatus;
  userId?: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod | string;
  installments?: number;
  category?: string;
}
