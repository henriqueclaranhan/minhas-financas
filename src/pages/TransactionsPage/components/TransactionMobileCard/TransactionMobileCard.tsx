import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import { TransactionType } from '../../../../enums/FinanceEnums';
import type { Transaction } from '../../../../types';
import type { ExpandedTransaction } from '../../../../utils/financeUtils';
import '../Transaction.css';

interface Props {
  t: ExpandedTransaction;
  pressingId: string | null;
  onPointerDown: (t: Transaction) => void;
  handleTouchStart: (t: Transaction) => void;
  handleTouchEnd: () => void;
}

export function TransactionMobileCard({ t, pressingId, onPointerDown, handleTouchStart, handleTouchEnd }: Props) {
  return (
    <div 
      className="glass-panel mobile-card-container" 
      style={{ 
        transform: pressingId === t.id ? 'scale(1.02)' : 'scale(1)'
      }}
      onTouchStart={() => handleTouchStart(t)}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); handleTouchEnd(); }}
    >
      <div className="mobile-card-header">
        <div>
          <h3 className="mobile-card-title">
            {t.description}
            {t.isInstallment ? (
              <span className="mobile-badge-secondary">({t.installmentNumber}/{t.totalInstallments})</span>
            ) : t.installments > 1 ? (
              <span className="mobile-badge-secondary">{t.installments}x</span>
            ) : null}
          </h3>
          <p className="mobile-card-subtitle" style={{ color: 'var(--clr-text-secondary)' }}>
            {format(parseISO(t.date), "dd/MM/yy", { locale: ptBR })} • {t.paymentMethod}
          </p>
        </div>
        <button 
          type="button"
          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onPointerDown(t); }}
          onClick={(e) => { e.stopPropagation(); onPointerDown(t); }}
          className="btn mobile-card-more-btn"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="mobile-card-footer" style={{ marginTop: '12px' }}>
        <span className="mobile-type-badge" style={{ 
          color: t.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)',
          background: t.type === TransactionType.INCOME ? 'var(--clr-success-glow)' : 'var(--clr-danger-glow)'
        }}>
          {t.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
        </span>
        <div style={{ textAlign: 'right' }}>
          <span className="mobile-amount" style={{ 
            color: t.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)'
          }}>
            {t.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
          </span>
          {t.isInstallment && (
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', marginTop: '2px' }}>
              Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.originalAmount || 0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
