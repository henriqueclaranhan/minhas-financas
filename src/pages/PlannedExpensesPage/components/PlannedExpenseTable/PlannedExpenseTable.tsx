import { parseISO } from 'date-fns';
import { Pencil, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { TransactionType, PaymentMethod } from '../../../../enums/FinanceEnums';
import { Modal } from '../../../../components/Modal';
import { PlannedExpenseMobileCard } from '../PlannedExpenseMobileCard';
import type { ExpandedPlannedExpense } from '../../../../utils/financeUtils';
import { useLocale } from '../../../../store/LocaleContext';
import '../PlannedExpense.css';
import { useLongPressActions } from '../../../../hooks/useLongPressActions';
import { getPlanReference } from '../../../../utils/planReferenceUtils';

interface PlannedExpenseTableProps {
  expenses: ExpandedPlannedExpense[];
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (p: ExpandedPlannedExpense) => void;
  onDelete: (id: string) => void;
}

export function PlannedExpenseTable({ expenses, onConfirm, onReject, onEdit, onDelete }: PlannedExpenseTableProps) {
  const { formatCurrency, locale, t } = useLocale();
  const { actionItem: mobileActionItem, setActionItem: setMobileActionItem, pressingId, startPress: handleTouchStart, endPress: handleTouchEnd } = useLongPressActions<ExpandedPlannedExpense>();

  if (expenses.length === 0) {
    return (
      <div className="empty-state-text">
        Nenhum gasto planejado pendente.
      </div>
    );
  }

  return (
    <>
      <div className="hide-on-mobile table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-date">{t('common.dueDate')}</th>
              <th className="col-desc">{t('common.description')}</th>
              <th className="col-category">{t('form.category')}</th>
              <th className="col-method">{t('common.paymentMethod')}</th>
              <th className="col-amount">{t('common.amount')}</th>
              <th className="col-actions">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(p => {
              const pDate = parseISO(p.dueDate);
              const currentDate = new Date();
              const isCurrent = pDate.getUTCMonth() === currentDate.getMonth() && pDate.getUTCFullYear() === currentDate.getFullYear();
              const isDueOrPast = pDate.getUTCFullYear() < currentDate.getFullYear() || 
                (pDate.getUTCFullYear() === currentDate.getFullYear() && pDate.getUTCMonth() <= currentDate.getMonth());
              
              const dateColor = isDueOrPast 
                ? (p.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)') 
                : 'var(--clr-text-secondary)';

              return (
                <tr key={p.id}>
                  <td className="td-nowrap" style={{ color: dateColor, fontWeight: isDueOrPast ? 500 : 400 }}>
                    {new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(pDate)}
                  </td>
                  <td className="td-bold">
                    {p.description}
                    {p.isRecurring && (
                      <span className="plan-reference">{t('planning.reference', { reference: getPlanReference(p.originalId ?? p.id!) })}</span>
                    )}
                    {p.isInstallment ? (
                      <span className="badge-installments">
                        ({p.installmentNumber}/{p.totalInstallments})
                      </span>
                    ) : p.installments && p.installments > 1 ? (
                      <span className="badge-installments">
                        {p.installments}x
                      </span>
                    ) : null}
                    {p.isRecurring && (
                      <span className="badge-recurring" title={`Repete a cada ${p.recurrenceInterval} mes(es)`}>
                        <RefreshCw size={12} />
                      </span>
                    )}
                  </td>
                  <td className="td-secondary">
                    {p.category ? t(`categories.${p.category}`) : '-'}
                  </td>
                  <td className="td-secondary">
                    {p.paymentMethod ? (Object.values(PaymentMethod).includes(p.paymentMethod as PaymentMethod) ? t(`form.${p.paymentMethod}`) : p.paymentMethod) : '-'}
                  </td>
                  <td className={p.type === TransactionType.INCOME ? 'td-amount-income' : 'td-amount-expense'}>
                    {p.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(p.amount)}
                  </td>
                  <td className="td-actions">
                    {isCurrent && (
                      <>
                        <button onClick={() => onConfirm(p.id!)} className="btn btn-action success" title="Confirmar">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => onReject(p.id!)} className="btn btn-action warning" title="Recusar/Pular">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => onEdit(p)} className="btn btn-action primary" title="Editar">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => onDelete(p.id!)} className="btn btn-action danger" title="Apagar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="hide-on-desktop mobile-card-list">
        {expenses.map(p => (
          <PlannedExpenseMobileCard 
            key={`${p.id}-mobile`}
            p={p}
            pressingId={pressingId}
            onPointerDown={setMobileActionItem}
            handleTouchStart={handleTouchStart}
            handleTouchEnd={handleTouchEnd}
          />
        ))}
      </div>

      <Modal isOpen={!!mobileActionItem} onClose={() => setMobileActionItem(null)} title="Opções do Planejamento">
        <div className="modal-grid">
          {(() => {
            const currentItem = mobileActionItem;
            if (!currentItem) return null;
            
            const pDate = parseISO(currentItem.dueDate);
            const isCurrent = pDate.getUTCMonth() === new Date().getMonth() && pDate.getUTCFullYear() === new Date().getFullYear();

            return (
              <>
                {isCurrent && (
                  <>
                    <button 
                      className="glass-panel hover-lift modal-action-btn"
                      onClick={() => {
                        onConfirm(currentItem.id!);
                        setMobileActionItem(null);
                      }}
                    >
                      <div className="icon-circle success">
                        <CheckCircle size={24} color="#fff" />
                      </div>
                      <div>
                        <h3 className="modal-action-title">Confirmar</h3>
                        <p className="modal-action-desc">Marcar como paga neste mês.</p>
                      </div>
                    </button>
                    
                    <button 
                      className="glass-panel hover-lift modal-action-btn"
                      onClick={() => {
                        if (currentItem.id) onReject(currentItem.id);
                        setMobileActionItem(null);
                      }}
                    >
                      <div className="icon-circle warning">
                        <XCircle size={24} color="#fff" />
                      </div>
                      <div>
                        <h3 className="modal-action-title">Ignorar</h3>
                        <p className="modal-action-desc">Pular o pagamento deste mês.</p>
                      </div>
                    </button>
                  </>
                )}
                
                <button 
                  className="glass-panel hover-lift modal-action-btn"
                  onClick={() => {
                    onEdit(currentItem);
                    setMobileActionItem(null);
                  }}
                >
                  <div className="icon-circle primary">
                    <Pencil size={24} color="#fff" />
                  </div>
                  <div>
                    <h3 className="modal-action-title">Editar</h3>
                    <p className="modal-action-desc">Modificar os dados originais.</p>
                  </div>
                </button>
                
                <button 
                  className="glass-panel hover-lift modal-action-btn"
                  onClick={() => {
                    if (currentItem.id) onDelete(currentItem.id);
                    setMobileActionItem(null);
                  }}
                >
                  <div className="icon-circle danger">
                    <Trash2 size={24} color="#fff" />
                  </div>
                  <div>
                    <h3 className="modal-action-title">Apagar</h3>
                    <p className="modal-action-desc">Remover planejamento de vez.</p>
                  </div>
                </button>
              </>
            );
          })()}
        </div>
      </Modal>
    </>
  );
}
