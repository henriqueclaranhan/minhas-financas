export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense'
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const PaymentMethod = {
  CREDIT: 'Crédito',
  DEBIT: 'Débito',
  PIX: 'Pix',
  CASH: 'Dinheiro'
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ExpenseStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
} as const;
export type ExpenseStatus = (typeof ExpenseStatus)[keyof typeof ExpenseStatus];

export const FilterType = {
  ALL: 'all',
  INCOME: 'income',
  EXPENSE: 'expense'
} as const;
export type FilterType = (typeof FilterType)[keyof typeof FilterType];
