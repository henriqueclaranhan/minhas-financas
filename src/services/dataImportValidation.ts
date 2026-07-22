import { ExpenseStatus, PaymentMethod, TransactionType } from '../enums/FinanceEnums';
import type { PlannedExpense, Transaction } from '../types';

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const MAX_IMPORT_ITEMS = 50_000;

export interface ValidatedImportData {
  initialBalance?: number | null;
  transactions: Transaction[];
  plannedExpenses: PlannedExpense[];
}

const transactionKeys = new Set([
  'id', 'description', 'amount', 'paymentMethod', 'installments', 'date', 'type',
  'plannedExpenseId', 'category', 'sourceKey',
]);
const plannedExpenseKeys = new Set([
  'id', 'description', 'amount', 'dueDate', 'isRecurring', 'recurrenceInterval',
  'recurrenceDay',
  'status', 'userId', 'type', 'paymentMethod', 'installments', 'category',
  'sourcePlannedExpenseId',
]);
const rootKeys = new Set(['initialBalance', 'transactions', 'plannedExpenses']);
const paymentMethods = new Set(Object.values(PaymentMethod));
const transactionTypes = new Set(Object.values(TransactionType));
const expenseStatuses = new Set(Object.values(ExpenseStatus));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(value: Record<string, unknown>, keys: Set<string>, path: string): void {
  const unexpected = Object.keys(value).find(key => !keys.has(key));
  if (unexpected) throw new Error(`${path}.${unexpected} is not supported`);
}

function assertString(value: unknown, path: string, maxLength: number, required = true): asserts value is string {
  if (!required && value === undefined) return;
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
    throw new Error(`${path} must be a non-empty string with at most ${maxLength} characters`);
  }
}

function assertPositiveNumber(value: unknown, path: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || !Number.isSafeInteger(Math.round(value * 100))) {
    throw new Error(`${path} must be a positive finite number`);
  }
}

function assertInteger(value: unknown, path: string, min: number, max: number): asserts value is number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new Error(`${path} must be an integer between ${min} and ${max}`);
  }
}

function assertDate(value: unknown, path: string): asserts value is string {
  assertString(value, path, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${path} must use YYYY-MM-DD`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${path} is not a valid calendar date`);
  }
}

function assertId(value: unknown, path: string, required = false): asserts value is string | undefined {
  if (!required && value === undefined) return;
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) {
    throw new Error(`${path} contains an unsafe document ID`);
  }
}

function validateTransaction(value: unknown, index: number): Transaction {
  const path = `transactions[${index}]`;
  if (!isObject(value)) throw new Error(`${path} must be an object`);
  assertOnlyKeys(value, transactionKeys, path);
  assertId(value.id, `${path}.id`);
  assertString(value.description, `${path}.description`, 200);
  assertPositiveNumber(value.amount, `${path}.amount`);
  assertString(value.paymentMethod, `${path}.paymentMethod`, 50);
  if (!paymentMethods.has(value.paymentMethod as never)) throw new Error(`${path}.paymentMethod is unknown`);
  assertInteger(value.installments, `${path}.installments`, 1, 360);
  assertDate(value.date, `${path}.date`);
  if (value.type !== undefined && !transactionTypes.has(value.type as never)) throw new Error(`${path}.type is unknown`);
  assertString(value.category, `${path}.category`, 100, false);
  assertId(value.plannedExpenseId, `${path}.plannedExpenseId`);
  assertString(value.sourceKey, `${path}.sourceKey`, 300, false);
  return { ...value, description: value.description.trim() } as unknown as Transaction;
}

function validatePlannedExpense(value: unknown, index: number): PlannedExpense {
  const path = `plannedExpenses[${index}]`;
  if (!isObject(value)) throw new Error(`${path} must be an object`);
  assertOnlyKeys(value, plannedExpenseKeys, path);
  assertId(value.id, `${path}.id`);
  assertString(value.description, `${path}.description`, 200);
  assertPositiveNumber(value.amount, `${path}.amount`);
  assertDate(value.dueDate, `${path}.dueDate`);
  if (typeof value.isRecurring !== 'boolean') throw new Error(`${path}.isRecurring must be boolean`);
  assertInteger(value.recurrenceInterval, `${path}.recurrenceInterval`, 1, 120);
  if (value.recurrenceDay !== undefined) assertInteger(value.recurrenceDay, `${path}.recurrenceDay`, 1, 31);
  if (!expenseStatuses.has(value.status as never)) throw new Error(`${path}.status is unknown`);
  if (value.type !== undefined && !transactionTypes.has(value.type as never)) throw new Error(`${path}.type is unknown`);
  if (value.paymentMethod !== undefined && !paymentMethods.has(value.paymentMethod as never)) throw new Error(`${path}.paymentMethod is unknown`);
  assertString(value.category, `${path}.category`, 100, false);
  assertString(value.userId, `${path}.userId`, 128, false);
  assertId(value.sourcePlannedExpenseId, `${path}.sourcePlannedExpenseId`);
  if (value.installments !== undefined) assertInteger(value.installments, `${path}.installments`, 1, 360);
  return { ...value, description: value.description.trim() } as unknown as PlannedExpense;
}

function assertUniqueIds(items: Array<{ id?: string }>, path: string): void {
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id) continue;
    if (ids.has(item.id)) throw new Error(`${path} contains duplicate document ID ${item.id}`);
    ids.add(item.id);
  }
}

export function validateImportData(jsonData: string): ValidatedImportData {
  if (new TextEncoder().encode(jsonData).byteLength > MAX_IMPORT_BYTES) {
    throw new Error('Import file exceeds the 5 MB limit');
  }

  const parsed: unknown = JSON.parse(jsonData);
  if (!isObject(parsed)) throw new Error('Import root must be an object');
  assertOnlyKeys(parsed, rootKeys, 'import');
  if (parsed.initialBalance !== undefined && parsed.initialBalance !== null
    && (typeof parsed.initialBalance !== 'number' || !Number.isFinite(parsed.initialBalance))) {
    throw new Error('initialBalance must be a finite number or null');
  }
  if (parsed.transactions !== undefined && !Array.isArray(parsed.transactions)) throw new Error('transactions must be an array');
  if (parsed.plannedExpenses !== undefined && !Array.isArray(parsed.plannedExpenses)) throw new Error('plannedExpenses must be an array');

  const transactionValues = (parsed.transactions ?? []) as unknown[];
  const plannedExpenseValues = (parsed.plannedExpenses ?? []) as unknown[];
  if (transactionValues.length + plannedExpenseValues.length > MAX_IMPORT_ITEMS) {
    throw new Error(`Import exceeds the ${MAX_IMPORT_ITEMS} item limit`);
  }

  const transactions = transactionValues.map(validateTransaction);
  const plannedExpenses = plannedExpenseValues.map(validatePlannedExpense);
  assertUniqueIds(transactions, 'transactions');
  assertUniqueIds(plannedExpenses, 'plannedExpenses');
  return { initialBalance: parsed.initialBalance as number | null | undefined, transactions, plannedExpenses };
}
