import { parseISO } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { ExpenseStatus, PaymentMethod, TransactionType } from '../../../../enums/FinanceEnums';
import type { PlannedExpense } from '../../../../types';
import type { ExpandedPlannedExpense } from '../../../../utils/financeUtils';
import { useLocale } from '../../../../store/LocaleContext';
import '../PlannedExpense.css';

interface Props {
  p: ExpandedPlannedExpense;
  pressingId: string | null;
  onPointerDown: (p: PlannedExpense) => void;
  handleTouchStart: (p: PlannedExpense) => void;
  handleTouchEnd: () => void;
}

export function PlannedExpenseMobileCard({ p, pressingId, onPointerDown, handleTouchStart, handleTouchEnd }: Props) {
  const { formatCurrency, locale, t: translate } = useLocale();
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
          <h3 className="mobile-card-title">
            {p.description}
            {p.isInstallment ? (
              <span className="mobile-badge-secondary">({p.installmentNumber}/{p.totalInstallments})</span>
            ) : p.installments && p.installments > 1 ? (
              <span className="mobile-badge-secondary">{p.installments}x</span>
            ) : null}
          </h3>
          <p className="mobile-card-subtitle" style={{ color: dateColor, fontWeight: isDueOrPast ? 500 : 400 }}>
            {new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: '2-digit' }).format(pDate)}
            {p.category && ` • ${translate(`categories.${p.category}`)}`}
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
      
      <div className="mobile-card-footer" style={{ marginTop: '12px' }}>
        <span className="mobile-type-badge" style={{ 
          color: (!p.type || p.type === TransactionType.EXPENSE) ? 'var(--clr-danger)' : 'var(--clr-success)',
          background: (!p.type || p.type === TransactionType.EXPENSE) ? 'var(--clr-danger-glow)' : 'var(--clr-success-glow)'
        }}>
          {p.paymentMethod || PaymentMethod.CREDIT}
        </span>
        <div style={{ textAlign: 'right' }}>
          <span className="mobile-amount" style={{ 
            color: (!p.type || p.type === TransactionType.EXPENSE) ? 'var(--clr-danger)' : 'var(--clr-success)'
          }}>
            {(!p.type || p.type === TransactionType.EXPENSE) ? '-' : '+'} {formatCurrency(p.amount)}
          </span>
          {p.isInstallment && (
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', marginTop: '2px' }}>
              Total: {formatCurrency(p.originalAmount || 0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
