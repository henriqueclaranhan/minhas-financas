import { parseISO } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { TransactionType, PaymentMethod } from '../../../../enums/FinanceEnums';
import { Modal } from '../../../../components/Modal';
import { TransactionMobileCard } from '../TransactionMobileCard';
import type { Transaction } from '../../../../types';
import { useLocale } from '../../../../store/LocaleContext';
import '../Transaction.css';
import { useLongPressActions } from '../../../../hooks/useLongPressActions';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  const { formatCurrency, locale, t: translate } = useLocale();
  const { actionItem: mobileActionItem, setActionItem: setMobileActionItem, pressingId, startPress: handleTouchStart, endPress: handleTouchEnd } = useLongPressActions<Transaction>();

  if (transactions.length === 0) {
    return (
      <div className="empty-state-text">
        {translate('transactions.empty')}
      </div>
    );
  }

  return (
    <>
      <div className="hide-on-mobile table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-date">{translate('common.date')}</th><th className="col-desc">{translate('common.description')}</th><th className="col-category">{translate('form.category')}</th><th className="col-method">{translate('common.paymentMethod')}</th><th className="col-amount">{translate('common.amount')}</th><th className="col-actions">{translate('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="td-secondary td-nowrap">
                  {new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parseISO(t.date))}
                </td>
                <td className="td-bold">
                  {t.description}
                  {t.installments > 1 ? (
                    <span className="badge-installments">
                      {translate('transactions.installmentSummary', {
                        count: t.installments,
                        amount: formatCurrency(t.amount / t.installments),
                      })}
                    </span>
                  ) : null}
                </td>
                <td className="td-secondary">
                  {t.category ? translate(`categories.${t.category}`) : '-'}
                </td>
                <td className="td-secondary">
                  {Object.values(PaymentMethod).includes(t.paymentMethod as PaymentMethod) ? translate(`form.${t.paymentMethod}`) : t.paymentMethod}
                </td>
                <td className={t.type === TransactionType.INCOME ? 'td-amount-income' : 'td-amount-expense'}>
                  <div>{t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}</div>
                </td>
                <td className="td-actions">
                  <button onClick={() => onEdit(t)} className="btn btn-action primary" title={translate('common.edit')}>
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => onDelete(t.id!)} className="btn btn-action danger" title={translate('common.delete')}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hide-on-desktop mobile-card-list">
        {transactions.map(t => (
          <TransactionMobileCard 
            key={`${t.id}-mobile`}
            t={t}
            pressingId={pressingId}
            onPointerDown={setMobileActionItem}
            handleTouchStart={handleTouchStart}
            handleTouchEnd={handleTouchEnd}
          />
        ))}
      </div>

      <Modal isOpen={!!mobileActionItem} onClose={() => setMobileActionItem(null)} title={translate('transactions.options')}>
        <div className="modal-grid">
          <button 
            className="glass-panel hover-lift modal-action-btn"
            onClick={() => {
              if (mobileActionItem) onEdit(mobileActionItem);
              setMobileActionItem(null);
            }}
          >
            <div className="icon-circle primary">
              <Pencil size={24} color="#fff" />
            </div>
            <div>
              <h3 className="modal-action-title">{translate('common.edit')}</h3><p className="modal-action-desc">{translate('transactions.editDescription')}</p>
            </div>
          </button>
          
          <button 
            className="glass-panel hover-lift modal-action-btn"
            onClick={() => {
              if (mobileActionItem?.id) onDelete(mobileActionItem.id);
              setMobileActionItem(null);
            }}
          >
            <div className="icon-circle danger">
              <Trash2 size={24} color="#fff" />
            </div>
            <div>
              <h3 className="modal-action-title">{translate('common.delete')}</h3><p className="modal-action-desc">{translate('transactions.deleteDescription')}</p>
            </div>
          </button>
        </div>
      </Modal>
    </>
  );
}
