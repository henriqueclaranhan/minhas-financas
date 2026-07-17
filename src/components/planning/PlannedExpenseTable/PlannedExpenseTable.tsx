import { useState, useRef } from 'react';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { PlannedExpense } from '../../../types';
import { TransactionType } from '../../../enums/FinanceEnums';
import { Modal } from '../../Modal';
import { PlannedExpenseMobileCard } from '../PlannedExpenseMobileCard';
import '../PlannedExpense.css';

interface PlannedExpenseTableProps {
  expenses: PlannedExpense[];
  onConfirm: (p: PlannedExpense) => void;
  onReject: (id: string) => void;
  onEdit: (p: PlannedExpense) => void;
  onDelete: (id: string) => void;
}

export function PlannedExpenseTable({ expenses, onConfirm, onReject, onEdit, onDelete }: PlannedExpenseTableProps) {
  const [mobileActionItem, setMobileActionItem] = useState<PlannedExpense | null>(null);
  const [pressingId, setPressingId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="empty-state-text">
        Nenhum gasto planejado pendente.
      </div>
    );
  }

  const handleTouchStart = (p: PlannedExpense) => {
    setPressingId(p.id!);
    timerRef.current = setTimeout(() => {
      navigator.vibrate?.(50);
      setMobileActionItem(p);
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
              <th className="col-date">Vencimento</th>
              <th className="col-desc">Descrição</th>
              <th className="col-method">Método</th>
              <th className="col-amount">Valor</th>
              <th className="col-actions">Ações</th>
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
                    {format(pDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="td-bold">
                    {p.description}
                    {p.isRecurring && (
                      <span className="badge-recurring">
                        Recorrente ({p.recurrenceInterval}m)
                      </span>
                    )}
                    {String(p.paymentMethod).toLowerCase().includes('crédito') && p.installments && p.installments > 1 ? (
                      <span className="badge-installments">
                        {p.installments}x
                      </span>
                    ) : null}
                  </td>
                  <td className="td-secondary">
                    {p.paymentMethod || '-'}
                  </td>
                  <td className={p.type === TransactionType.INCOME ? 'td-amount-income' : 'td-amount-expense'}>
                    {p.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
                  </td>
                  <td className="td-actions">
                    {isCurrent && (
                      <>
                        <button onClick={() => onConfirm(p)} className="btn btn-action success" title="Confirmar">
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
                        onConfirm(currentItem);
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
