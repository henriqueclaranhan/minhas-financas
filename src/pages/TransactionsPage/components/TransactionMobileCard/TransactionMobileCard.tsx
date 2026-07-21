import { parseISO } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { TransactionType, PaymentMethod } from '../../../../enums/FinanceEnums';
import type { Transaction } from '../../../../types';
import { useLocale } from '../../../../store/LocaleContext';
import '../Transaction.css';

interface Props {
  t: Transaction;
  pressingId: string | null;
  onPointerDown: (t: Transaction) => void;
  handleTouchStart: (t: Transaction) => void;
  handleTouchEnd: () => void;
}

export function TransactionMobileCard({ t, pressingId, onPointerDown, handleTouchStart, handleTouchEnd }: Props) {
  const { formatCurrency, locale, t: translate } = useLocale();
  return (
    <div 
      className={`glass-panel mobile-card-container${pressingId === t.id ? ' is-pressing' : ''}`}
      onTouchStart={() => handleTouchStart(t)}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); handleTouchEnd(); }}
    >
      <div className="mobile-card-header">
        <div>
          <h3 className="mobile-card-title">
            {t.description}
            {t.installments > 1 ? (
              <span className="mobile-badge-secondary">
                {translate('transactions.installmentSummary', {
                  count: t.installments,
                  amount: formatCurrency(t.amount / t.installments),
                })}
              </span>
            ) : null}
          </h3>
          <p className="mobile-card-subtitle" style={{ color: 'var(--clr-text-secondary)' }}>
            {new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: '2-digit' }).format(parseISO(t.date))} • {Object.values(PaymentMethod).includes(t.paymentMethod as PaymentMethod) ? translate(`form.${t.paymentMethod}`) : t.paymentMethod}{t.category && ` • ${translate(`categories.${t.category}`)}`}
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
          {t.type === TransactionType.INCOME ? translate('form.income') : translate('form.expense')}
        </span>
        <div style={{ textAlign: 'right' }}>
          <span className="mobile-amount" style={{ 
            color: t.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)'
          }}>
            {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
