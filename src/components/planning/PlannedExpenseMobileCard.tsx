import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import type { PlannedExpense } from '../../types';
import { TransactionType } from '../../enums/FinanceEnums';

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
      className="glass-panel" 
      style={{ 
        padding: '16px', position: 'relative', overflow: 'hidden', 
        userSelect: 'none', WebkitUserSelect: 'none',
        transform: pressingId === p.id ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
      }}
      onTouchStart={() => handleTouchStart(p)}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); handleTouchEnd(); }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>
            {p.description}
            {p.isRecurring && (
              <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--clr-surface-alt)', color: 'var(--clr-text-secondary)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                Recorrência ({p.recurrenceInterval}m)
              </span>
            )}
            {String(p.paymentMethod).toLowerCase().includes('crédito') && p.installments && p.installments > 1 ? (
              <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                {p.installments}x
              </span>
            ) : null}
          </h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: dateColor, fontWeight: isDueOrPast ? 500 : 400 }}>
            {format(pDate, "dd/MM/yy", { locale: ptBR })} {p.paymentMethod ? `• ${p.paymentMethod}` : ''}
          </p>
        </div>
        <button 
          type="button"
          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onPointerDown(p); }}
          onClick={(e) => { e.stopPropagation(); onPointerDown(p); }}
          className="btn" 
          style={{ padding: '4px', background: 'transparent', color: 'var(--clr-text-secondary)' }}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ 
          background: p.type === TransactionType.INCOME ? 'var(--clr-success-glow)' : 'var(--clr-danger-glow)', 
          color: p.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)',
          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
        }}>
          {p.type === TransactionType.INCOME ? 'Entrada' : 'Saída'}
        </span>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: p.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
          {p.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
        </span>
      </div>
    </div>
  );
}
