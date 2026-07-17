import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import type { Transaction } from '../../types';
import { TransactionType } from '../../enums/FinanceEnums';

interface Props {
  t: Transaction;
  pressingId: string | null;
  onPointerDown: (t: Transaction) => void;
  handleTouchStart: (t: Transaction) => void;
  handleTouchEnd: () => void;
}

export function TransactionMobileCard({ t, pressingId, onPointerDown, handleTouchStart, handleTouchEnd }: Props) {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '16px', position: 'relative', overflow: 'hidden', 
        userSelect: 'none', WebkitUserSelect: 'none',
        transform: pressingId === t.id ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
      }}
      onTouchStart={() => handleTouchStart(t)}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); handleTouchEnd(); }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>
            {t.description}
            {t.installments > 1 && (
              <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                {t.installments}x
              </span>
            )}
          </h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>
            {format(parseISO(t.date), "dd/MM/yy", { locale: ptBR })} • {t.paymentMethod}
          </p>
        </div>
        <button 
          type="button"
          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onPointerDown(t); }}
          onClick={(e) => { e.stopPropagation(); onPointerDown(t); }}
          className="btn" 
          style={{ padding: '4px', background: 'transparent', color: 'var(--clr-text-secondary)' }}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ 
          background: t.type === TransactionType.INCOME ? 'var(--clr-success-glow)' : 'var(--clr-danger-glow)', 
          color: t.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)',
          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
        }}>
          {t.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
        </span>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: t.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
          {t.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
        </span>
      </div>
    </div>
  );
}
