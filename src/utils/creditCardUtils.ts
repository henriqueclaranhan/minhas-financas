import { parseISO, addMonths, format } from 'date-fns';
import type { SupportedLocale } from '../i18n/translations';
import type { Transaction } from '../types';

export interface BillItem extends Transaction {
  installmentNumber: number;
  installmentValue: number;
}

export interface MonthlyBill {
  total: number;
  items: BillItem[];
}

export interface MonthData {
  key: string;
  labelFull: string;
  labelShort: string;
  data: MonthlyBill;
  index: number;
}

export function calculateCreditCardBills(transactions: Transaction[], currentDate = new Date(), locale: SupportedLocale = 'pt-BR'): MonthData[] {
  const monthlyBills: Record<string, MonthlyBill> = {};

  transactions.forEach(t => {
    if (t.type === 'expense' && t.paymentMethod?.toLowerCase().includes('crédito')) {
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

  return Array.from({ length: 12 }).map((_, i) => {
    const date = addMonths(currentDate, i - 3);
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
