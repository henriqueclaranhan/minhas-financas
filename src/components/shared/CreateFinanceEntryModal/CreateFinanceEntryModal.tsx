import { CalendarClock, Wallet } from 'lucide-react';
import type { PlannedExpense, Transaction } from '../../../types';
import { useLocale } from '../../../store/LocaleContext';
import { Modal } from '../../Modal';
import { PlannedExpenseForm } from '../../PlannedExpenseForm';
import { TransactionForm } from '../../TransactionForm';
import { FinanceEntryMode, type FinanceEntryMode as FinanceEntryModeValue } from '../../../enums/UIEnums';

interface CreateFinanceEntryModalProps {
  isOpen: boolean;
  mode: FinanceEntryModeValue;
  onClose: () => void;
  onModeChange: (mode: FinanceEntryModeValue) => void;
  onTransactionSubmit: (data: Omit<Transaction, 'id'>) => void;
  onPlanningSubmit: (data: Omit<PlannedExpense, 'id'>) => void;
}

export function CreateFinanceEntryModal({ isOpen, mode, onClose, onModeChange, onTransactionSubmit, onPlanningSubmit }: CreateFinanceEntryModalProps) {
  const { t } = useLocale();
  const title = mode === FinanceEntryMode.NONE ? t('dashboard.whatToDo') : mode === FinanceEntryMode.TRANSACTION ? t('dashboard.newTransaction') : t('planning.new');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {mode === FinanceEntryMode.NONE && (
        <div className="dashboard-modal-grid">
          <button className="glass-panel hover-lift dashboard-modal-btn" onClick={() => onModeChange(FinanceEntryMode.TRANSACTION)}>
            <div className="dashboard-icon-bg primary"><Wallet size={24} color="#fff" /></div>
            <div>
              <h3 className="dashboard-modal-title">{t('dashboard.newTransaction')}</h3>
              <p className="dashboard-modal-desc">{t('dashboard.transactionDescription')}</p>
            </div>
          </button>
          <button className="glass-panel hover-lift dashboard-modal-btn" onClick={() => onModeChange(FinanceEntryMode.PLANNING)}>
            <div className="dashboard-icon-bg warning"><CalendarClock size={24} color="#fff" /></div>
            <div>
              <h3 className="dashboard-modal-title">{t('dashboard.newPlanning')}</h3>
              <p className="dashboard-modal-desc">{t('dashboard.planningDescription')}</p>
            </div>
          </button>
        </div>
      )}
      {mode === FinanceEntryMode.TRANSACTION && <TransactionForm onSubmit={onTransactionSubmit} />}
      {mode === FinanceEntryMode.PLANNING && <PlannedExpenseForm onSubmit={onPlanningSubmit} />}
    </Modal>
  );
}
