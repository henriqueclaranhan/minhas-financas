export const FinanceEntryMode = {
  NONE: 'none',
  TRANSACTION: 'transaction',
  PLANNING: 'planning',
} as const;
export type FinanceEntryMode = (typeof FinanceEntryMode)[keyof typeof FinanceEntryMode];

export const ForecastFilterMode = {
  YEAR: 'year',
  PERIOD: 'period',
} as const;
export type ForecastFilterMode = (typeof ForecastFilterMode)[keyof typeof ForecastFilterMode];

export const CategoryExpenseFilterMode = {
  MONTH: 'month',
  RANGE: 'range',
} as const;
export type CategoryExpenseFilterMode = (typeof CategoryExpenseFilterMode)[keyof typeof CategoryExpenseFilterMode];

export const FilterValue = {
  ALL: 'all',
} as const;
