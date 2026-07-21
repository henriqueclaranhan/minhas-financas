import { CalendarClock, Wallet } from 'lucide-react';
import type { PlannedExpense, Transaction } from '../../../types';
import { useLocale } from '../../../store/LocaleContext';
import { Modal } from '../../Modal';
import { PlannedExpenseForm } from '../../PlannedExpenseForm';
import { TransactionForm } from '../../TransactionForm';

type EntryMode = 'none' | 'transaction' | 'planning';

interface CreateFinanceEntryModalProps {
  isOpen: boolean;
  mode: EntryMode;
  onClose: () => void;
  onModeChange: (mode: EntryMode) => void;
  onTransactionSubmit: (data: Omit<Transaction, 'id'>) => void;
  onPlanningSubmit: (data: Omit<PlannedExpense, 'id'>) => void;
}

export function CreateFinanceEntryModal({ isOpen, mode, onClose, onModeChange, onTransactionSubmit, onPlanningSubmit }: CreateFinanceEntryModalProps) {
  const { t } = useLocale();
  const title = mode === 'none' ? t('dashboard.whatToDo') : mode === 'transaction' ? t('dashboard.newTransaction') : t('planning.new');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {mode === 'none' && (
        <div className="dashboard-modal-grid">
          <button className="glass-panel hover-lift dashboard-modal-btn" onClick={() => onModeChange('transaction')}>
            <div className="dashboard-icon-bg primary"><Wallet size={24} color="#fff" /></div>
            <div>
              <h3 className="dashboard-modal-title">{t('dashboard.newTransaction')}</h3>
              <p className="dashboard-modal-desc">{t('dashboard.transactionDescription')}</p>
            </div>
          </button>
          <button className="glass-panel hover-lift dashboard-modal-btn" onClick={() => onModeChange('planning')}>
            <div className="dashboard-icon-bg warning"><CalendarClock size={24} color="#fff" /></div>
            <div>
              <h3 className="dashboard-modal-title">{t('dashboard.newPlanning')}</h3>
              <p className="dashboard-modal-desc">{t('dashboard.planningDescription')}</p>
            </div>
          </button>
        </div>
      )}
      {mode === 'transaction' && <TransactionForm onSubmit={onTransactionSubmit} />}
      {mode === 'planning' && <PlannedExpenseForm onSubmit={onPlanningSubmit} />}
    </Modal>
  );
}
