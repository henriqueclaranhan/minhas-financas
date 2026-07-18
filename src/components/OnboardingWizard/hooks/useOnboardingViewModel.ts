import { useState } from 'react';
import { useFinance } from '../../../store/FinanceContext';

export const onboardingSteps = [
  {
    title: 'Bem-vindo ao Minhas Finanças',
    description: 'Muito mais que um caderninho de gastos. O seu novo centro de inteligência financeira.',
    iconType: 'rocket'
  },
  {
    title: 'Previsibilidade Real',
    description: 'Planeje contas futuras, gerencie gastos recorrentes e veja como as parcelas do cartão impactarão os próximos meses.',
    iconType: 'chart'
  },
  {
    title: 'Rápido e Offline',
    description: 'Acompanhe seu saldo e adicione transações de qualquer lugar, mesmo sem internet. Seus dados são seus.',
    iconType: 'shield'
  }
];

export function useOnboardingViewModel() {
  const { initialBalance, setInitialBalance, addTransaction, transactions, plannedExpenses, isLoading } = useFinance();
  const [currentStep, setCurrentStep] = useState(0);
  const [balanceInput, setBalanceInput] = useState<number | ''>('');

  const hasData = transactions.length > 0 || plannedExpenses.length > 0;
  const shouldShow = !isLoading && initialBalance === null && !hasData;

  const nextStep = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(balanceInput);
    
    // Set initial balance state to 0 so it's not double-counted
    setInitialBalance(0);
    
    // Register the initial balance as an income or expense transaction
    if (amount !== 0) {
      addTransaction({
        description: 'Saldo Inicial',
        amount: Math.abs(amount),
        date: new Date().toISOString().split('T')[0],
        type: amount > 0 ? 'income' : 'expense',
        paymentMethod: 'Dinheiro',
        installments: 1
      });
    }
  };

  const skip = () => {
    setInitialBalance(0);
  };

  return {
    state: {
      currentStep,
      balanceInput,
      shouldShow,
      steps: onboardingSteps
    },
    actions: {
      setBalanceInput,
      nextStep,
      handleFinish,
      skip
    }
  };
}
