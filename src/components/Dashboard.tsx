import { useMemo } from 'react';
import { parseISO, addMonths, isSameMonth, format, isBefore, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
    
    // Calculate total historical balance up to 1 month ago (startOffset - 1)
    const startOffset = -1;
    const endOffset = 4;
    const startMonthDate = startOfMonth(addMonths(currentDate, startOffset));
    
    // We need to calculate the balance for each of the last 6 months.
    // For simplicity, we calculate the net flow for EVERY month since the beginning of time.
    const monthlyData: Record<string, { income: number, expense: number }> = {};
    const getMonthData = (m: string) => {
      if (!monthlyData[m]) monthlyData[m] = { income: 0, expense: 0 };
      return monthlyData[m];
    };
    
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

    // Project pending planned expenses
    plannedExpenses.forEach(pe => {
      if (pe.status === 'pending') {
        const isIncome = pe.type === 'income';
        let currentDateIter = parseISO(pe.dueDate);
        const limitDate = addMonths(currentDate, endOffset);
        
        if (!pe.isRecurring) {
          const monthKey = format(currentDateIter, 'yyyy-MM');
          // Only project if it's strictly in a future month
          if (monthKey > format(currentDate, 'yyyy-MM')) {
            if (isIncome) getMonthData(monthKey).income += pe.amount;
            else getMonthData(monthKey).expense += pe.amount;
          }
        } else {
          while (!isBefore(limitDate, currentDateIter)) {
            const monthKey = format(currentDateIter, 'yyyy-MM');
            if (monthKey > format(currentDate, 'yyyy-MM')) {
              if (isIncome) getMonthData(monthKey).income += pe.amount;
              else getMonthData(monthKey).expense += pe.amount;
            }
            currentDateIter = addMonths(currentDateIter, pe.recurrenceInterval || 1);
          }
        }
      }
    });


    
    // Let's do a chronological sum for chart:
    // First, find all unique months before and during our 6 month window.
    const allMonths = Object.keys(monthlyData).sort();
    let accumulated = initialBalance;
    
    // Apply all history up to startOffset - 1
    for (const m of allMonths) {
      if (m < format(startMonthDate, 'yyyy-MM')) {
        accumulated += monthlyData[m].income - monthlyData[m].expense;
      }
    }

    let actualCurrentBalance = accumulated;
    for (let i = startOffset; i <= endOffset; i++) {
      const monthDate = addMonths(currentDate, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const mData = monthlyData[monthKey] || { income: 0, expense: 0 };
      accumulated += mData.income - mData.expense;
      
      if (i === 0) {
        actualCurrentBalance = accumulated;
      }
      
      data.push({
        name: format(monthDate, 'MMM/yy', { locale: ptBR }).toUpperCase(),
        saldo: accumulated,
        income: mData.income,
        expense: mData.expense
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
        headerAction={
          <Link 
            to="/forecast" 
            style={{ 
              color: 'var(--clr-primary)', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '1rem', 
              fontWeight: 500,
              opacity: 0.9
            }}
          >
            <span className="hide-on-mobile">Ver todas</span> <ChevronRight size={20} />
          </Link>
        }
      />
    </div>
  );
}
