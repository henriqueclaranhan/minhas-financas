import { Dashboard } from './components/Dashboard/Dashboard';
import { Plus, Wallet, CalendarClock } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { TransactionForm } from '../../components/TransactionForm';
import { PlannedExpenseForm } from '../../components/PlannedExpenseForm';
import { useDashboardViewModel } from './hooks/useDashboardViewModel';
import { PageHeader } from '../../components/shared/PageHeader';
import './DashboardPage.css';

export function DashboardPage() {
  const { state, actions } = useDashboardViewModel();

  if (state.initialBalance === null && !state.hasData) {
    return null; // Wait for OnboardingWizard to set the balance
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={`Olá, ${state.userName}!`}
        description="Acompanhe o resumo das suas finanças e a evolução do seu saldo."
        primaryButton={{
          label: 'Nova Ação',
          icon: <Plus size={18} className="mr-sm" />,
          onClick: () => { actions.setIsModalOpen(true); actions.setActionType('none'); }
        }}
      />
      
      <div className="dashboard-widget dashboard-main animate-fade-in">
        <Dashboard chartData={state.chartData} />
      </div>

      {/* Mobile FAB */}
      <button 
        className="btn btn-primary fab hide-on-desktop" 
        onClick={() => { actions.setIsModalOpen(true); actions.setActionType('none'); }}
      >
        <Plus size={28} />
      </button>

      <Modal 
        isOpen={state.isModalOpen} 
        onClose={() => { actions.setIsModalOpen(false); setTimeout(() => actions.setActionType('none'), 300); }} 
        title={state.actionType === 'none' ? 'O que deseja fazer?' : state.actionType === 'transaction' ? 'Nova Transação' : 'Planejar'}
      >
        {state.actionType === 'none' && (
          <div className="dashboard-modal-grid">
            <button 
              className="glass-panel hover-lift dashboard-modal-btn" 
              onClick={() => actions.setActionType('transaction')}
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
              onClick={() => actions.setActionType('planning')}
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

        {state.actionType === 'transaction' && <TransactionForm onSubmit={actions.handleTransactionAdd} />}
        {state.actionType === 'planning' && <PlannedExpenseForm onSubmit={actions.handlePlanningAdd} />}
      </Modal>
    </div>
  );
}
