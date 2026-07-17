import React, { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { Rocket, BarChart3, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { CurrencyInput } from './CurrencyInput';
import './OnboardingWizard.css';

const steps = [
  {
    title: 'Bem-vindo ao Minhas Finanças',
    description: 'Muito mais que um caderninho de gastos. O seu novo centro de inteligência financeira.',
    icon: <Rocket size={64} color="var(--clr-primary)" />
  },
  {
    title: 'Previsibilidade Real',
    description: 'Planeje contas futuras, gerencie gastos recorrentes e veja como as parcelas do cartão impactarão os próximos meses.',
    icon: <BarChart3 size={64} color="var(--clr-warning)" />
  },
  {
    title: 'Rápido e Offline',
    description: 'Acompanhe seu saldo e adicione transações de qualquer lugar, mesmo sem internet. Seus dados são seus.',
    icon: <ShieldCheck size={64} color="var(--clr-success)" />
  }
];

export function OnboardingWizard() {
  const { initialBalance, setInitialBalance, addTransaction, transactions, plannedExpenses, isLoading } = useFinance();
  const [currentStep, setCurrentStep] = useState(0);
  const [balanceInput, setBalanceInput] = useState<number | ''>('');

  const hasData = transactions.length > 0 || plannedExpenses.length > 0;

  if (isLoading || initialBalance !== null || hasData) return null;

  const nextStep = () => {
    if (currentStep < steps.length) {
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

  return (
    <div className="wizard-overlay">
      <div className="wizard-content animate-fade-in">
        <div className="wizard-body">
          {currentStep < steps.length ? (
            <div className="wizard-slide animate-fade-in" key={currentStep}>
              <div className="wizard-icon-wrapper hover-lift">
                {steps[currentStep].icon}
              </div>
              <h2>{steps[currentStep].title}</h2>
              <p>{steps[currentStep].description}</p>
            </div>
          ) : (
            <div className="wizard-slide animate-fade-in" key="final">
              <div className="wizard-icon-wrapper">
                <span style={{ fontSize: '3rem' }}>💰</span>
              </div>
              <h2>Qual o seu saldo hoje?</h2>
              <p>Defina o seu ponto de partida.</p>
              
              <form onSubmit={handleFinish} style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Saldo Atual</label>
                  <CurrencyInput 
                    value={balanceInput}
                    onChangeValue={setBalanceInput}
                    className="form-input"
                    style={{ fontSize: '1.25rem', padding: '16px' }}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary hover-glow" style={{ width: '100%', padding: '16px', fontSize: '1.125rem', marginTop: '16px' }}>
                  Começar Jornada <Check size={20} style={{ marginLeft: '8px' }} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setInitialBalance(0)} 
                  className="btn" 
                  style={{ width: '100%', padding: '16px', fontSize: '1rem', marginTop: '8px', background: 'transparent', color: 'var(--clr-text-secondary)', border: 'none' }}
                >
                  Pular por enquanto
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Navigation & Progress */}
        {currentStep < steps.length && (
          <div className="wizard-footer">
            <div className="wizard-progress">
              {Array.from({ length: steps.length + 1 }).map((_, i) => (
                <div key={i} className={`wizard-dot ${i === currentStep ? 'active' : ''}`} />
              ))}
            </div>
            <button onClick={nextStep} className="btn btn-primary hover-glow" style={{ width: '100%', padding: '16px', fontSize: '1.125rem' }}>
              Continuar <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
