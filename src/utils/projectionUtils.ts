import { parseISO, addMonths, isSameMonth, format, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import type { Transaction, PlannedExpense } from '../types';
import { TransactionType, ExpenseStatus } from '../enums/FinanceEnums';

export interface ProjectionOptions {
  transactions: Transaction[];
  plannedExpenses: PlannedExpense[];
  initialBalance: number;
  startMonthOffset: number;
  monthsToProject: number;
  includePlannedIncome?: boolean;
  includePlannedExpense?: boolean;
  currentDate?: Date;
  locale?: string;
}

export function calculateProjections(options: ProjectionOptions) {
  const {
    transactions,
    plannedExpenses,
    initialBalance,
    startMonthOffset,
    monthsToProject,
    includePlannedIncome = true,
    includePlannedExpense = true,
    currentDate = new Date(),
    locale = 'pt-BR'
  } = options;

  const dateFnsLocale = locale === 'en-US' ? enUS : ptBR;

  const data = [];
  
  const startDate = startOfMonth(addMonths(currentDate, startMonthOffset));
  const endDate = endOfMonth(addMonths(startDate, monthsToProject - 1));
  
  const monthlyData: Record<string, { income: number, expense: number }> = {};
  const getMonthData = (m: string) => {
    if (!monthlyData[m]) monthlyData[m] = { income: 0, expense: 0 };
    return monthlyData[m];
  };
  
  // Process confirmed transactions
  transactions.forEach(t => {
    const txDate = parseISO(t.date);
    const isCredit = t.paymentMethod.toLowerCase().includes('crédito');
    const isExpense = t.type !== TransactionType.INCOME;
    
    if (isExpense && isCredit) {
      const numInstallments = t.installments || 1;
      const instAmount = t.amount / numInstallments;
      for (let i = 1; i <= numInstallments; i++) {
        const instDate = addMonths(txDate, i);
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

      const isCredit = pe.paymentMethod?.toLowerCase().includes('crédito');
      const numInstallments = pe.installments || 1;
      const instAmount = pe.amount / numInstallments;

      let currentDateIter = parseISO(pe.dueDate);
      
      const addAmountToMonths = (dateIter: Date) => {
        if (isCredit && !isIncome) {
          for (let i = 1; i <= numInstallments; i++) {
            const instDate = addMonths(dateIter, i);
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
        const limitDate = addMonths(endDate, 1);
        while (!isBefore(limitDate, currentDateIter)) {
          addAmountToMonths(currentDateIter);
          currentDateIter = addMonths(currentDateIter, pe.recurrenceInterval || 1);
        }
      }
    }
  });

  const allMonths = Object.keys(monthlyData).sort();
  let accumulated = initialBalance;
  
  for (const m of allMonths) {
    if (m < format(startDate, 'yyyy-MM')) {
      accumulated += monthlyData[m].income - monthlyData[m].expense;
    }
  }

  let actualCurrentBalance = accumulated;
  for (let i = 0; i < monthsToProject; i++) {
    const monthDate = addMonths(startDate, i);
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
  
  transactions.forEach(t => {
    const txDate = parseISO(t.date);
    const isCredit = t.paymentMethod.toLowerCase().includes('crédito');
    const isExpense = t.type !== TransactionType.INCOME;
    
    if (isExpense && isCredit) {
      const numInstallments = t.installments || 1;
      const instAmount = t.amount / numInstallments;
      for (let i = 1; i <= numInstallments; i++) {
        if (isSameMonth(addMonths(txDate, i), currentDate)) {
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
