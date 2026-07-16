import { useMemo } from 'react';
import { parseISO, addMonths, isSameMonth, format, isBefore, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SummaryCards } from './dashboard/SummaryCards';
import { DashboardChart } from './dashboard/DashboardChart';
import type { Transaction, PlannedExpense } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  plannedExpenses: PlannedExpense[];
  initialBalance: number;
}

export function Dashboard({ transactions, plannedExpenses, initialBalance }: DashboardProps) {
  const currentDate = useMemo(() => new Date(), []);

  // Helper to get data up to 6 months ago + current month
  const chartData = useMemo(() => {
    const data = [];
    
    // Calculate total historical balance up to 5 months ago
    const sixMonthsAgo = startOfMonth(addMonths(currentDate, -5));
    
    // We need to calculate the balance for each of the last 6 months.
    // For simplicity, we calculate the net flow for EVERY month since the beginning of time.
    const monthlyFlows: Record<string, number> = {};
    
    transactions.forEach(t => {
      const txDate = parseISO(t.date);
      const isCredit = t.paymentMethod.toLowerCase().includes('crédito');
      const isExpense = t.type !== 'income';
      
      if (isExpense && isCredit) {
        const numInstallments = t.installments || 1;
        const instAmount = t.amount / numInstallments;
        for (let i = 1; i <= numInstallments; i++) {
          const instDate = addMonths(txDate, i);
          const monthKey = format(instDate, 'yyyy-MM');
          monthlyFlows[monthKey] = (monthlyFlows[monthKey] || 0) - instAmount;
        }
      } else {
        const monthKey = format(txDate, 'yyyy-MM');
        const value = isExpense ? -t.amount : t.amount;
        monthlyFlows[monthKey] = (monthlyFlows[monthKey] || 0) + value;
      }
    });

    // Project pending planned expenses
    plannedExpenses.forEach(pe => {
      if (pe.status === 'pending') {
        const value = pe.type === 'income' ? pe.amount : -pe.amount;
        let currentDateIter = parseISO(pe.dueDate);
        const limitDate = addMonths(currentDate, 6);
        
        if (!pe.isRecurring) {
          const monthKey = format(currentDateIter, 'yyyy-MM');
          monthlyFlows[monthKey] = (monthlyFlows[monthKey] || 0) + value;
        } else {
          while (!isBefore(limitDate, currentDateIter)) {
            const monthKey = format(currentDateIter, 'yyyy-MM');
            monthlyFlows[monthKey] = (monthlyFlows[monthKey] || 0) + value;
            currentDateIter = addMonths(currentDateIter, pe.recurrenceInterval || 1);
          }
        }
      }
    });


    
    // Let's do a chronological sum for chart:
    // First, find all unique months before and during our 6 month window.
    const allMonths = Object.keys(monthlyFlows).sort();
    let accumulated = initialBalance;
    
    // Apply all history up to 6 months ago to get the starting balance of the chart
    for (const m of allMonths) {
      if (m < format(sixMonthsAgo, 'yyyy-MM')) {
        accumulated += monthlyFlows[m];
      }
    }

    let actualCurrentBalance = accumulated;
    for (let i = -5; i <= 6; i++) {
      const monthDate = addMonths(currentDate, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      accumulated += (monthlyFlows[monthKey] || 0);
      
      if (i === 0) {
        actualCurrentBalance = accumulated;
      }
      
      data.push({
        name: format(monthDate, 'MMM/yy', { locale: ptBR }).toUpperCase(),
        saldo: accumulated
      });
    }

    let monthlyInc = 0;
    let monthlyExp = 0;
    
    transactions.forEach(t => {
      const txDate = parseISO(t.date);
      const isCredit = t.paymentMethod.toLowerCase().includes('crédito');
      const isExpense = t.type !== 'income';
      
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
  }, [transactions, plannedExpenses, initialBalance, currentDate]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      <SummaryCards 
        currentBalance={chartData.currentBalance}
        monthlyIncome={chartData.monthlyIncome}
        monthlyExpense={chartData.monthlyExpense}
        formatCurrency={formatCurrency}
      />

      <DashboardChart 
        data={chartData.data} 
        formatCurrency={formatCurrency} 
      />
    </div>
  );
}
