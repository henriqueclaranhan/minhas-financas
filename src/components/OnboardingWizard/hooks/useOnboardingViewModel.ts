import { useState } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { useLocale } from '../../../store/LocaleContext';

export function useOnboardingViewModel() {
  const { initialBalance, setInitialBalance, addTransaction, transactions, plannedExpenses, isLoading } = useFinance();
  const { t } = useLocale();
  const [currentStep, setCurrentStep] = useState(0);
  const [balanceInput, setBalanceInput] = useState<number | ''>('');

  const onboardingSteps = [
    {
      title: t('onboarding.step1Title'),
      description: t('onboarding.step1Desc'),
      iconType: 'rocket'
    },
    {
      title: t('onboarding.step2Title'),
      description: t('onboarding.step2Desc'),
      iconType: 'chart'
    },
    {
      title: t('onboarding.step3Title'),
      description: t('onboarding.step3Desc'),
      iconType: 'shield'
    }
  ];

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
