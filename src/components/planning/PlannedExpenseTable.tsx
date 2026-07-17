import { useState, useRef } from 'react';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { PlannedExpense } from '../../types';
import { TransactionType } from '../../enums/FinanceEnums';
import { Modal } from '../Modal';
import { PlannedExpenseMobileCard } from './PlannedExpenseMobileCard';

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
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
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
      <div className="hide-on-mobile" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
          <thead>
            <tr style={{ background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)' }}>
              <th style={{ padding: 'var(--spacing-md)' }}>Vencimento</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Descrição</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Valor</th>
              <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Ações</th>
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
                <tr key={p.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  <td style={{ padding: 'var(--spacing-md)', color: dateColor, fontWeight: isDueOrPast ? 500 : 400, whiteSpace: 'nowrap' }}>
                    {format(pDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>
                    {p.description}
                    {p.isRecurring && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--clr-surface-alt)', color: 'var(--clr-text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                        Recorrente ({p.recurrenceInterval}m)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', color: p.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 600 }}>
                    {p.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {isCurrent && (
                      <>
                        <button onClick={() => onConfirm(p)} className="btn" style={{ padding: '8px', background: 'transparent', color: 'var(--clr-success)' }} title="Confirmar">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => onReject(p.id!)} className="btn" style={{ padding: '8px', background: 'transparent', color: 'var(--clr-warning)' }} title="Recusar/Pular">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => onEdit(p)} className="btn" style={{ padding: '8px', background: 'transparent', color: 'var(--clr-primary)' }} title="Editar">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => onDelete(p.id!)} className="btn" style={{ padding: '8px', background: 'transparent', color: 'var(--clr-danger)' }} title="Apagar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="hide-on-desktop" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
        <div style={{ display: 'grid', gap: '16px' }}>
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
                      className="glass-panel hover-lift" 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '16px' }}
                      onClick={() => {
                        onConfirm(currentItem);
                        setMobileActionItem(null);
                      }}
                    >
                      <div style={{ background: 'var(--clr-success)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle size={24} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>Confirmar</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Marcar como paga neste mês.</p>
                      </div>
                    </button>
                    
                    <button 
                      className="glass-panel hover-lift" 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '16px' }}
                      onClick={() => {
                        if (currentItem.id) onReject(currentItem.id);
                        setMobileActionItem(null);
                      }}
                    >
                      <div style={{ background: 'var(--clr-warning)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <XCircle size={24} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>Ignorar</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Pular o pagamento deste mês.</p>
                      </div>
                    </button>
                  </>
                )}
                
                <button 
                  className="glass-panel hover-lift" 
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '16px' }}
                  onClick={() => {
                    onEdit(currentItem);
                    setMobileActionItem(null);
                  }}
                >
                  <div style={{ background: 'var(--clr-primary)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Pencil size={24} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>Editar</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Modificar os dados originais.</p>
                  </div>
                </button>
                
                <button 
                  className="glass-panel hover-lift" 
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '16px' }}
                  onClick={() => {
                    if (currentItem.id) onDelete(currentItem.id);
                    setMobileActionItem(null);
                  }}
                >
                  <div style={{ background: 'var(--clr-danger)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trash2 size={24} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>Apagar</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Remover planejamento de vez.</p>
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
