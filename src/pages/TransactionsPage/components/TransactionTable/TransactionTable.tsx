import { useState, useRef } from 'react';
import { parseISO } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { TransactionType } from '../../../../enums/FinanceEnums';
import { Modal } from '../../../../components/Modal';
import { TransactionMobileCard } from '../TransactionMobileCard';
import type { ExpandedTransaction } from '../../../../utils/financeUtils';
import { useLocale } from '../../../../store/LocaleContext';
import '../Transaction.css';

interface TransactionTableProps {
  transactions: ExpandedTransaction[];
  onEdit: (t: ExpandedTransaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  const { formatCurrency, locale, t: translate } = useLocale();
  const [mobileActionItem, setMobileActionItem] = useState<ExpandedTransaction | null>(null);
  const [pressingId, setPressingId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="empty-state-text">
        {translate('transactions.empty')}
      </div>
    );
  }

  const handleTouchStart = (t: ExpandedTransaction) => {
    setPressingId(t.id!);
    timerRef.current = setTimeout(() => {
      navigator.vibrate?.(50);
      setMobileActionItem(t);
      setPressingId(null);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setPressingId(null);
  };

  return (
    <>
      <div className="hide-on-mobile table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-date">{translate('common.date')}</th><th className="col-desc">{translate('common.description')}</th><th className="col-method">{translate('common.paymentMethod')}</th><th className="col-amount">{translate('common.amount')}</th><th className="col-actions">{translate('common.actions')}</th>
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
                  {t.isInstallment ? (
                    <span className="badge-installments">
                      ({t.installmentNumber}/{t.totalInstallments})
                    </span>
                  ) : t.installments > 1 ? (
                    <span className="badge-installments">
                      {t.installments}x
                    </span>
                  ) : null}
                </td>
                <td className="td-secondary">{t.paymentMethod}</td>
                <td className={t.type === TransactionType.INCOME ? 'td-amount-income' : 'td-amount-expense'}>
                  <div>{t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}</div>
                  {t.isInstallment && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', marginTop: '4px' }}>
                      Total: {formatCurrency(t.originalAmount || 0)}
                    </div>
                  )}
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
