import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import type { PlannedExpense } from '../../types';
import { TransactionType } from '../../enums/FinanceEnums';
import './PlannedExpense.css';

interface Props {
  p: PlannedExpense;
  pressingId: string | null;
  onPointerDown: (p: PlannedExpense) => void;
  handleTouchStart: (p: PlannedExpense) => void;
  handleTouchEnd: () => void;
}

export function PlannedExpenseMobileCard({ p, pressingId, onPointerDown, handleTouchStart, handleTouchEnd }: Props) {
  const pDate = parseISO(p.dueDate);
  const currentDate = new Date();
  const isDueOrPast = pDate.getUTCFullYear() < currentDate.getFullYear() || 
    (pDate.getUTCFullYear() === currentDate.getFullYear() && pDate.getUTCMonth() <= currentDate.getMonth());
    
  const dateColor = isDueOrPast 
    ? (p.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)') 
    : 'var(--clr-text-secondary)';

  return (
    <div 
      className={`glass-panel mobile-card-container`} 
      style={{ 
        transform: pressingId === p.id ? 'scale(1.02)' : 'scale(1)'
      }}
      onTouchStart={() => handleTouchStart(p)}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); handleTouchEnd(); }}
    >
      <div className="mobile-card-header">
        <div>
          <h4 className="mobile-card-title">
            {p.description}
            {p.isRecurring && (
              <span className="mobile-badge-secondary">
                Recorrência ({p.recurrenceInterval}m)
              </span>
            )}
            {String(p.paymentMethod).toLowerCase().includes('crédito') && p.installments && p.installments > 1 ? (
              <span className="mobile-badge-primary">
                {p.installments}x
              </span>
            ) : null}
          </h4>
          <p className="mobile-card-subtitle" style={{ color: dateColor, fontWeight: isDueOrPast ? 500 : 400 }}>
            {format(pDate, "dd/MM/yy", { locale: ptBR })} {p.paymentMethod ? `• ${p.paymentMethod}` : ''}
          </p>
        </div>
        <button 
          type="button"
          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onPointerDown(p); }}
          onClick={(e) => { e.stopPropagation(); onPointerDown(p); }}
          className="btn mobile-card-more-btn"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="mobile-card-footer">
        <span className="mobile-type-badge" style={{ 
          background: p.type === TransactionType.INCOME ? 'var(--clr-success-glow)' : 'var(--clr-danger-glow)', 
          color: p.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)'
        }}>
          {p.type === TransactionType.INCOME ? 'Entrada' : 'Saída'}
        </span>
        <span className="mobile-amount" style={{ color: p.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
          {p.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
        </span>
      </div>
    </div>
  );
}
