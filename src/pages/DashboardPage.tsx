import { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { Dashboard } from '../components/Dashboard';
import { Plus, Wallet, CalendarClock } from 'lucide-react';
import { Modal } from '../components/Modal';
import { TransactionForm } from '../components/TransactionForm';
import { PlannedExpenseForm } from '../components/PlannedExpenseForm';

export function DashboardPage() {
  const { initialBalance, transactions, plannedExpenses, addTransaction, addPlannedExpense } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'none' | 'transaction' | 'planning'>('none');

  if (initialBalance === null) {
    return null; // Wait for OnboardingWizard to set the balance
  }

  const handleTransactionAdd = (data: any) => {
    addTransaction(data);
    setIsModalOpen(false);
    setActionType('none');
  };

  const handlePlanningAdd = (data: any) => {
    addPlannedExpense(data);
    setIsModalOpen(false);
    setActionType('none');
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Visão Geral</h1>
          <p style={{ color: 'var(--clr-text-secondary)' }}>Acompanhe o resumo das suas finanças e a evolução do seu saldo.</p>
        </div>
        <button 
          className="btn btn-primary hover-glow hide-on-mobile" 
          onClick={() => { setIsModalOpen(true); setActionType('none'); }}
        >
          <Plus size={18} style={{ marginRight: '8px' }} /> Nova Ação
        </button>
      </header>
      
      <Dashboard transactions={transactions} plannedExpenses={plannedExpenses} initialBalance={initialBalance} />

      {/* Mobile FAB */}
      <button 
        className="btn btn-primary fab hide-on-desktop" 
        onClick={() => { setIsModalOpen(true); setActionType('none'); }}
      >
        <Plus size={28} />
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setTimeout(() => setActionType('none'), 300); }} 
        title={actionType === 'none' ? 'O que deseja fazer?' : actionType === 'transaction' ? 'Nova Transação' : 'Planejar'}
      >
        {actionType === 'none' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <button 
              className="glass-panel hover-lift" 
              style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '16px' }}
              onClick={() => setActionType('transaction')}
            >
              <div style={{ background: 'var(--clr-primary)', padding: '12px', borderRadius: '50%' }}>
                <Wallet size={24} color="#fff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--clr-text-primary)' }}>Nova Transação</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Registrar uma entrada ou saída de dinheiro.</p>
              </div>
            </button>

            <button 
              className="glass-panel hover-lift" 
              style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '16px' }}
              onClick={() => setActionType('planning')}
            >
              <div style={{ background: 'var(--clr-warning)', padding: '12px', borderRadius: '50%' }}>
                <CalendarClock size={24} color="#fff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--clr-text-primary)' }}>Novo Planejamento</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Agendar uma conta futura ou recorrente.</p>
              </div>
            </button>
          </div>
        )}

        {actionType === 'transaction' && <TransactionForm onSubmit={handleTransactionAdd} />}
        {actionType === 'planning' && <PlannedExpenseForm onSubmit={handlePlanningAdd} />}
      </Modal>
    </div>
  );
}
