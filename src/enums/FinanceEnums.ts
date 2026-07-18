export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense'
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const PaymentMethod = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  PIX: 'pix',
  CASH: 'cash',
  TRANSFER: 'transfer',
  BOLETO: 'boleto'
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

export const ExpenseCategory = {
  FOOD: 'food',
  TRANSPORT: 'transport',
  HOUSING: 'housing',
  HEALTH: 'health',
  EDUCATION: 'education',
  ENTERTAINMENT: 'entertainment',
  SHOPPING: 'shopping',
  PETS: 'pets',
  CLOTHING: 'clothing',
  INVESTMENT: 'investment',
  OTHERS: 'others'
} as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const IncomeCategory = {
  SALARY: 'salary',
  INVESTMENT: 'investment',
  GIFT: 'gift',
  OTHERS: 'others'
} as const;
export type IncomeCategory = (typeof IncomeCategory)[keyof typeof IncomeCategory];
