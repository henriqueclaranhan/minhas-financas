import { useState, useMemo } from 'react';
import { parseISO, addMonths, format, isBefore, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinance } from '../store/FinanceContext';
import { DashboardChart } from '../components/dashboard/DashboardChart';
import { TransactionType } from '../enums/FinanceEnums';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ForecastPage.css';

export function ForecastPage() {
  const navigate = useNavigate();
  const { transactions, plannedExpenses, initialBalance } = useFinance();
  
  // Filters
  const [includePlannedIncome, setIncludePlannedIncome] = useState(true);
  const [includePlannedExpense, setIncludePlannedExpense] = useState(true);
  const [monthsToProject, setMonthsToProject] = useState(6);
  const [startMonthOffset, setStartMonthOffset] = useState(0); // 0 = current month

  const currentDate = useMemo(() => new Date(), []);
  
  const chartData = useMemo(() => {
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

    // Process planned expenses (only if toggles are active and they are pending)
    plannedExpenses.forEach(pe => {
      if (pe.status === 'pending') {
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
          // Project far enough to cover our endDate
          const limitDate = addMonths(endDate, 1);
          while (!isBefore(limitDate, currentDateIter)) {
            addAmountToMonths(currentDateIter);
            currentDateIter = addMonths(currentDateIter, pe.recurrenceInterval || 1);
          }
        }
      }
    });

    const allMonths = Object.keys(monthlyData).sort();
    let accumulated = initialBalance ?? 0;
    
    // Accumulate history up to startMonth
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
        name: format(monthDate, 'MMM/yy', { locale: ptBR }).toUpperCase(),
        saldo: accumulated,
        income: mData.income,
        expense: mData.expense
      });
    }

    return {
      data,
      currentBalance: actualCurrentBalance
    };
  }, [transactions, plannedExpenses, initialBalance, currentDate, includePlannedIncome, includePlannedExpense, monthsToProject, startMonthOffset]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="animate-fade-in forecast-page">
      {/* Internal Header for Mobile */}
      <header className="hide-on-desktop mb-xl flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="btn forecast-back-btn p-0 flex items-center" 
        >
          <ChevronLeft size={24} /> Voltar
        </button>
      </header>

      <header className="mb-lg">
        <h1>Previsões e Cenários</h1>
        <p className="text-secondary forecast-desc">Simule o futuro do seu saldo baseando-se nos seus planejamentos.</p>
      </header>

      <div className="forecast-content">
        <div className="glass-panel p-lg">
          <div className="form-row mb-lg">
            <div className="form-group forecast-form-group">
              <label className="form-label">Início da Projeção</label>
              <select 
                className="form-select" 
                value={startMonthOffset}
                onChange={(e) => setStartMonthOffset(Number(e.target.value))}
              >
                <option value={-3}>3 meses atrás</option>
                <option value={-1}>1 mês atrás</option>
                <option value={0}>Mês Atual</option>
                <option value={1}>Próximo Mês</option>
              </select>
            </div>

            <div className="form-group forecast-form-group">
              <label className="form-label">Período Visível (Meses)</label>
              <select 
                className="form-select" 
                value={monthsToProject}
                onChange={(e) => setMonthsToProject(Number(e.target.value))}
              >
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
              </select>
            </div>
          </div>

          <div className="forecast-options-section">
            <h3 className="forecast-options-title">O que incluir no futuro?</h3>
            
            <div className="forecast-options-container">
              <label className="forecast-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={includePlannedIncome}
                  onChange={(e) => setIncludePlannedIncome(e.target.checked)}
                  className="forecast-checkbox"
                />
                <span>Entradas Planejadas</span>
              </label>
              
              <label className="forecast-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={includePlannedExpense}
                  onChange={(e) => setIncludePlannedExpense(e.target.checked)}
                  className="forecast-checkbox"
                />
                <span>Gastos Planejados</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <DashboardChart 
            data={chartData.data} 
            formatCurrency={formatCurrency} 
            title="Projeção do Saldo"
          />
        </div>
      </div>
    </div>
  );
}
