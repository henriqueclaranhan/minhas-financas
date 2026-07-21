import { TransactionType } from '../enums/FinanceEnums';
import type { CompetenceEntry, Transaction } from '../types';
import { expandTransactions } from './financeUtils';

export function getCompetenceEntryId(transactionId: string, position: number): string {
  return `${transactionId}--${String(position).padStart(3, '0')}`;
}

export function buildCompetenceEntries(transactionId: string, transaction: Omit<Transaction, 'id'>): CompetenceEntry[] {
  return expandTransactions([{ ...transaction, id: transactionId }]).map((entry, index) => ({
    id: getCompetenceEntryId(transactionId, index + 1),
    transactionId,
    description: entry.description,
    amount: entry.amount,
    competenceDate: entry.date,
    originalDate: transaction.date,
    paymentMethod: entry.paymentMethod,
    type: entry.type ?? TransactionType.EXPENSE,
    category: entry.category,
    installmentNumber: entry.installmentNumber ?? 1,
    totalInstallments: entry.totalInstallments ?? entry.installments ?? 1,
  }));
}
