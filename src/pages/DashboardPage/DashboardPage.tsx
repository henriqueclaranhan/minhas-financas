import { Dashboard } from './components/Dashboard/Dashboard';
import { Plus, Wallet, CalendarClock } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { TransactionForm } from '../../components/TransactionForm';
import { PlannedExpenseForm } from '../../components/PlannedExpenseForm';
import { useDashboardViewModel } from './hooks/useDashboardViewModel';
import { PageHeader } from '../../components/shared/PageHeader';
import { useLocale } from '../../store/LocaleContext';
import './DashboardPage.css';

export function DashboardPage() {
  const { state, actions } = useDashboardViewModel();
  const { t } = useLocale();

  if (state.initialBalance === null && !state.hasData) {
    return null; // Wait for OnboardingWizard to set the balance
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={t('dashboard.greeting', { name: state.userName })}
        description={t('dashboard.description')}
        primaryButton={{
          label: t('dashboard.newAction'),
          icon: <Plus size={18} className="mr-sm" />,
          onClick: () => { actions.setIsModalOpen(true); actions.setActionType('none'); }
        }}
      />
      
      <div className="dashboard-widget dashboard-main animate-fade-in">
        <Dashboard 
          chartData={state.chartData} 
          expensesByCategory={state.expensesByCategory}
        />
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
        title={state.actionType === 'none' ? t('dashboard.whatToDo') : state.actionType === 'transaction' ? t('dashboard.newTransaction') : t('planning.new')}
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
                <h3 className="dashboard-modal-title">{t('dashboard.newTransaction')}</h3>
                <p className="dashboard-modal-desc">{t('dashboard.transactionDescription')}</p>
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
                <h3 className="dashboard-modal-title">{t('dashboard.newPlanning')}</h3>
                <p className="dashboard-modal-desc">{t('dashboard.planningDescription')}</p>
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
