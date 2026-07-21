import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import type { CompetenceEntry, Transaction } from '../types';
import { CompetenceEntryService } from '../services/CompetenceEntryService';
import { expandTransactions } from '../utils/financeUtils';
import { TransactionType } from '../enums/FinanceEnums';
import { useFinance } from '../store/FinanceContext';

function buildFallbackEntries(transactions: Transaction[], startDate: string, endDate: string): CompetenceEntry[] {
  const originals = new Map(transactions.filter(transaction => transaction.id).map(transaction => [transaction.id!, transaction]));
  return expandTransactions(transactions, { startDate, endDate }).map(entry => ({
    id: entry.id,
    transactionId: entry.originalId ?? entry.id ?? '',
    description: entry.description,
    amount: entry.amount,
    competenceDate: entry.date,
    originalDate: originals.get(entry.originalId ?? entry.id ?? '')?.date ?? entry.date,
    paymentMethod: entry.paymentMethod,
    type: entry.type ?? TransactionType.EXPENSE,
    category: entry.category,
    installmentNumber: entry.installmentNumber ?? 1,
    totalInstallments: entry.totalInstallments ?? entry.installments ?? 1,
  }));
}

export function useCompetenceEntries(
  startDate: string,
  endDate: string,
  fallbackTransactions: Transaction[] = [],
) {
  const { user } = useAuth();
  const { isSchemaReady } = useFinance();
  const fallback = useMemo(
    () => buildFallbackEntries(fallbackTransactions, startDate, endDate),
    [endDate, fallbackTransactions, startDate],
  );
  const [entries, setEntries] = useState<CompetenceEntry[]>(fallback);
  const [isLoading, setIsLoading] = useState(Boolean(user?.uid));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setEntries(fallback);
      setIsLoading(false);
      setError(null);
      return;
    }
    if (isSchemaReady === false) return;
    let active = true;
    setIsLoading(true);
    setError(null);
    CompetenceEntryService.getEntriesForPeriod(user.uid, startDate, endDate)
      .then(result => { if (active) setEntries(result); })
      .catch(queryError => { if (active) setError(queryError as Error); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [endDate, fallback, isSchemaReady, startDate, user?.uid]);

  return { entries, isLoading, error };
}
