import { Dashboard } from './components/Dashboard/Dashboard';
import { Plus } from 'lucide-react';
import { CreateFinanceEntryModal } from '../../components/shared/CreateFinanceEntryModal';
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
          currentInvoice={state.currentInvoice}
        />
      </div>

      {/* Mobile FAB */}
      <button 
        className="btn btn-primary fab hide-on-desktop" 
        onClick={() => { actions.setIsModalOpen(true); actions.setActionType('none'); }}
      >
        <Plus size={28} />
      </button>

      <CreateFinanceEntryModal
        isOpen={state.isModalOpen} 
        onClose={() => { actions.setIsModalOpen(false); setTimeout(() => actions.setActionType('none'), 300); }} 
        mode={state.actionType}
        onModeChange={actions.setActionType}
        onTransactionSubmit={actions.handleTransactionAdd}
        onPlanningSubmit={actions.handlePlanningAdd}
      />
    </div>
  );
}
