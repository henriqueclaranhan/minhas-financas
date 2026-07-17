import { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { Dashboard } from '../components/Dashboard';
import { Plus, Wallet, CalendarClock } from 'lucide-react';
import { Modal } from '../components/Modal';
import { TransactionForm } from '../components/TransactionForm';
import { PlannedExpenseForm } from '../components/PlannedExpenseForm';
import { useAuth } from '../store/AuthContext';
import './DashboardPage.css';

export function DashboardPage() {
  const { initialBalance, transactions, plannedExpenses, addTransaction, addPlannedExpense } = useFinance();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'none' | 'transaction' | 'planning'>('none');

  const hasData = transactions.length > 0 || plannedExpenses.length > 0;

  if (initialBalance === null && !hasData) {
    return null; // Wait for OnboardingWizard to set the balance
  }

  const resolvedInitialBalance = initialBalance ?? 0;

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

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>Olá, {userName}!</h1>
          <p className="text-secondary">Acompanhe o resumo das suas finanças e a evolução do seu saldo.</p>
        </div>
        <button 
          className="btn btn-primary hover-glow hide-on-mobile" 
          onClick={() => { setIsModalOpen(true); setActionType('none'); }}
        >
          <Plus size={18} className="mr-sm" /> Nova Ação
        </button>
      </header>
      
      <div className="dashboard-widget dashboard-main animate-fade-in">
        <Dashboard transactions={transactions} plannedExpenses={plannedExpenses} initialBalance={resolvedInitialBalance} />
      </div>

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
          <div className="dashboard-modal-grid">
            <button 
              className="glass-panel hover-lift dashboard-modal-btn" 
              onClick={() => setActionType('transaction')}
            >
              <div className="dashboard-icon-bg primary">
                <Wallet size={24} color="#fff" />
              </div>
              <div>
                <h3 className="dashboard-modal-title">Nova Transação</h3>
                <p className="dashboard-modal-desc">Registrar uma entrada ou saída de dinheiro.</p>
              </div>
            </button>

            <button 
              className="glass-panel hover-lift dashboard-modal-btn" 
              onClick={() => setActionType('planning')}
            >
              <div className="dashboard-icon-bg warning">
                <CalendarClock size={24} color="#fff" />
              </div>
              <div>
                <h3 className="dashboard-modal-title">Novo Planejamento</h3>
                <p className="dashboard-modal-desc">Agendar uma conta futura ou recorrente.</p>
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
