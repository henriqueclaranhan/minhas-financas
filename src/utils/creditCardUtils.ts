import { parseISO, addMonths, eachMonthOfInterval, format } from 'date-fns';
import type { SupportedLocale } from '../i18n/translations';
import type { CompetenceEntry, Transaction } from '../types';
import { TransactionType, PaymentMethod } from '../enums/FinanceEnums';

interface BillItem extends Transaction {
  installmentNumber: number;
  installmentValue: number;
}

interface MonthlyBill {
  total: number;
  items: BillItem[];
}

interface MonthData {
  key: string;
  labelFull: string;
  labelShort: string;
  data: MonthlyBill;
  index: number;
}

export function calculateCreditCardBills(
  transactions: Transaction[],
  currentDate = new Date(),
  locale: SupportedLocale = 'pt-BR',
  interval?: { start: Date; end: Date },
): MonthData[] {
  const monthlyBills: Record<string, MonthlyBill> = {};

  transactions.forEach(t => {
    if (t.type === TransactionType.EXPENSE && t.paymentMethod === PaymentMethod.CREDIT) {
      const installments = t.installments || 1;
      const installmentValue = t.amount / installments;
      const baseDate = parseISO(t.date);

      for (let i = 1; i <= installments; i++) {
        const installmentDate = addMonths(baseDate, i);
        const monthKey = format(installmentDate, 'yyyy-MM');

        if (!monthlyBills[monthKey]) {
          monthlyBills[monthKey] = { total: 0, items: [] };
        }

        monthlyBills[monthKey].total += installmentValue;
        monthlyBills[monthKey].items.push({
          ...t,
          installmentNumber: i,
          installmentValue
        });
      }
    }
  });

  const months = interval
    ? eachMonthOfInterval(interval)
    : Array.from({ length: 12 }, (_, index) => addMonths(currentDate, index - 3));

  return months.map((date, i) => {
    const key = format(date, 'yyyy-MM');
    const labelFull = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
    const labelShort = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date).replace('.', '').toUpperCase();
    return {
      key,
      labelFull: labelFull.charAt(0).toUpperCase() + labelFull.slice(1),
      labelShort,
      data: monthlyBills[key] || { total: 0, items: [] },
      index: i
    };
  });
}

export function calculateCreditCardBillsFromEntries(
  entries: CompetenceEntry[],
  interval: { start: Date; end: Date },
  locale: SupportedLocale = 'pt-BR',
): MonthData[] {
  const monthlyBills: Record<string, MonthlyBill> = {};
  for (const entry of entries) {
    if (entry.type !== TransactionType.EXPENSE || entry.paymentMethod !== PaymentMethod.CREDIT) continue;
    const monthKey = entry.competenceDate.slice(0, 7);
    const bucket = monthlyBills[monthKey] ?? (monthlyBills[monthKey] = { total: 0, items: [] });
    bucket.total += entry.amount;
    bucket.items.push({
      id: entry.transactionId,
      description: entry.description,
      amount: entry.amount * entry.totalInstallments,
      date: entry.originalDate,
      paymentMethod: entry.paymentMethod,
      type: entry.type,
      category: entry.category,
      installments: entry.totalInstallments,
      installmentNumber: entry.installmentNumber,
      installmentValue: entry.amount,
    });
  }
  return eachMonthOfInterval(interval).map((date, index) => {
    const key = format(date, 'yyyy-MM');
    const labelFull = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
    const labelShort = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date).replace('.', '').toUpperCase();
    return {
      key,
      labelFull: labelFull.charAt(0).toUpperCase() + labelFull.slice(1),
      labelShort,
      data: monthlyBills[key] ?? { total: 0, items: [] },
      index,
    };
  });
}
