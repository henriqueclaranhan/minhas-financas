import { parseISO, addMonths, isSameMonth, format, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import type { CompetenceEntry, PlannedExpense, Transaction } from '../types';
import { TransactionType, ExpenseStatus, PaymentMethod } from '../enums/FinanceEnums';
import { aggregateCompetenceEntries, type FinanceAggregate } from './financeAggregationUtils';
import { addMonthsAtRecurrenceDay, resolveRecurrenceDay } from './recurrenceUtils';

interface ProjectionOptions {
  transactions: Transaction[];
  plannedExpenses: PlannedExpense[];
  initialBalance: number;
  startDate: Date;
  endDate: Date;
  includePlannedIncome?: boolean;
  includePlannedExpense?: boolean;
  currentDate?: Date;
  locale?: string;
  competenceEntries?: CompetenceEntry[];
  competenceAggregate?: FinanceAggregate;
}

export function calculateProjections(options: ProjectionOptions) {
  const {
    transactions,
    plannedExpenses,
    initialBalance,
    startDate,
    endDate,
    includePlannedIncome = true,
    includePlannedExpense = true,
    currentDate = new Date(),
    locale = 'pt-BR',
    competenceEntries,
    competenceAggregate,
  } = options;

  const dateFnsLocale = locale === 'en-US' ? enUS : ptBR;

  const data = [];
  
  const startMonthDate = startOfMonth(startDate);
  const endMonthDate = endOfMonth(endDate);
  
  let monthsToProject = 0;
  let tempDate = startMonthDate;
  while (!isBefore(endMonthDate, tempDate)) {
    monthsToProject++;
    tempDate = addMonths(tempDate, 1);
  }
  
  const monthlyData: Record<string, { income: number, expense: number }> = {};
  const getMonthData = (m: string) => {
    if (!monthlyData[m]) monthlyData[m] = { income: 0, expense: 0 };
    return monthlyData[m];
  };
  
  // Process confirmed transactions. Materialized competence entries are authoritative when provided.
  if (competenceEntries) {
    const aggregate = competenceAggregate ?? aggregateCompetenceEntries(competenceEntries);
    Object.entries(aggregate.byMonth).forEach(([month, values]) => {
      const bucket = getMonthData(month);
      bucket.income += values.income;
      bucket.expense += values.expense;
    });
  } else transactions.forEach(t => {
    const txDate = parseISO(t.date);
    const isCredit = t.paymentMethod === PaymentMethod.CREDIT;
    const isBoleto = t.paymentMethod === PaymentMethod.BOLETO;
    const isExpense = t.type !== TransactionType.INCOME;
    
    if (isExpense && (isCredit || isBoleto)) {
      const numInstallments = t.installments || 1;
      const instAmount = t.amount / numInstallments;
      for (let i = 1; i <= numInstallments; i++) {
        const offset = isCredit ? i : (i - 1);
        const instDate = addMonths(txDate, offset);
        const monthKey = format(instDate, 'yyyy-MM');
        getMonthData(monthKey).expense += instAmount;
      }
    } else {
      const monthKey = format(txDate, 'yyyy-MM');
      if (isExpense) {
        getMonthData(monthKey).expense += t.amount;
      } else {
        getMonthData(monthKey).income += t.amount;
      }
    }
  });

  // Process planned expenses
  plannedExpenses.forEach(pe => {
    if (pe.status === ExpenseStatus.PENDING) {
      const isIncome = pe.type === TransactionType.INCOME;
      if (isIncome && !includePlannedIncome) return;
      if (!isIncome && !includePlannedExpense) return;

      const isCredit = pe.paymentMethod === PaymentMethod.CREDIT;
      const isBoleto = pe.paymentMethod === PaymentMethod.BOLETO;
      const numInstallments = pe.installments || 1;
      const instAmount = pe.amount / numInstallments;

      let currentDateIter = parseISO(pe.dueDate);
      
      const addAmountToMonths = (dateIter: Date) => {
        if (!isIncome && (isCredit || isBoleto)) {
          for (let i = 1; i <= numInstallments; i++) {
            const offset = isCredit ? i : (i - 1);
            const instDate = addMonths(dateIter, offset);
            const monthKey = format(instDate, 'yyyy-MM');
            if (monthKey > format(currentDate, 'yyyy-MM')) {
              getMonthData(monthKey).expense += instAmount;
            }
          }
        } else {
          const monthKey = format(dateIter, 'yyyy-MM');
          if (monthKey > format(currentDate, 'yyyy-MM')) {
            if (isIncome) getMonthData(monthKey).income += pe.amount;
            else getMonthData(monthKey).expense += pe.amount;
          }
        }
      };

        if (!pe.isRecurring) {
          addAmountToMonths(currentDateIter);
      } else {
        const limitDate = addMonths(endMonthDate, 1);
        const recurrenceDay = resolveRecurrenceDay(pe.dueDate, pe.recurrenceDay);
        while (!isBefore(limitDate, currentDateIter)) {
          addAmountToMonths(currentDateIter);
          currentDateIter = addMonthsAtRecurrenceDay(currentDateIter, pe.recurrenceInterval || 1, recurrenceDay);
        }
      }
    }
  });

  const allMonths = Object.keys(monthlyData).sort();
  let accumulated = initialBalance;
  
  for (const m of allMonths) {
    if (m < format(startMonthDate, 'yyyy-MM')) {
      accumulated += monthlyData[m].income - monthlyData[m].expense;
    }
  }

  let actualCurrentBalance = accumulated;
  for (let i = 0; i < monthsToProject; i++) {
    const monthDate = addMonths(startMonthDate, i);
    const monthKey = format(monthDate, 'yyyy-MM');
    
    const mData = monthlyData[monthKey] || { income: 0, expense: 0 };
    accumulated += mData.income - mData.expense;
    
    if (isSameMonth(monthDate, currentDate)) {
      actualCurrentBalance = accumulated;
    }
    
    
    data.push({
      name: format(monthDate, 'MMM/yy', { locale: dateFnsLocale }).toUpperCase(),
      saldo: accumulated,
      income: mData.income,
      expense: mData.expense
    });
  }

  // Calculate monthly stats for the current month specifically
  let monthlyInc = 0;
  let monthlyExp = 0;
  const targetMonthKey = format(currentDate, 'yyyy-MM');
  
  if (competenceEntries) {
    const currentMonth = (competenceAggregate ?? aggregateCompetenceEntries(competenceEntries)).byMonth[targetMonthKey];
    monthlyInc = currentMonth?.income ?? 0;
    monthlyExp = currentMonth?.expense ?? 0;
  } else transactions.forEach(t => {
    const txDate = parseISO(t.date);
    const isCredit = t.paymentMethod === PaymentMethod.CREDIT;
    const isBoleto = t.paymentMethod === PaymentMethod.BOLETO;
    const isExpense = t.type !== TransactionType.INCOME;
    
    if (isExpense && (isCredit || isBoleto)) {
      const numInstallments = t.installments || 1;
      const instAmount = t.amount / numInstallments;
      for (let i = 1; i <= numInstallments; i++) {
        const offset = isCredit ? i : (i - 1);
        if (format(addMonths(txDate, offset), 'yyyy-MM') === targetMonthKey) {
           monthlyExp += instAmount;
        }
      }
    } else if (isSameMonth(txDate, currentDate)) {
       if (isExpense) monthlyExp += t.amount;
       else monthlyInc += t.amount;
    }
  });

  return {
    data,
    currentBalance: actualCurrentBalance,
    monthlyIncome: monthlyInc,
    monthlyExpense: monthlyExp
  };
}
