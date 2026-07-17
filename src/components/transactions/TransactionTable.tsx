import { useState, useRef } from 'react';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../types';
import { TransactionType } from '../../enums/FinanceEnums';
import { Modal } from '../Modal';
import { TransactionMobileCard } from './TransactionMobileCard';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  const [mobileActionItem, setMobileActionItem] = useState<Transaction | null>(null);
  const [pressingId, setPressingId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (transactions.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
        Nenhuma transação registrada ainda.
      </div>
    );
  }

  const handleTouchStart = (t: Transaction) => {
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
      <div className="hide-on-mobile" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
          <thead>
            <tr style={{ background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)' }}>
              <th style={{ padding: 'var(--spacing-md)' }}>Data</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Descrição</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Método</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Valor</th>
              <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                <td style={{ padding: 'var(--spacing-md)', color: 'var(--clr-text-secondary)', whiteSpace: 'nowrap' }}>
                  {format(parseISO(t.date), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>
                  {t.description}
                  {t.installments > 1 && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                      {t.installments}x
                    </span>
                  )}
                </td>
                <td style={{ padding: 'var(--spacing-md)', color: 'var(--clr-text-secondary)' }}>{t.paymentMethod}</td>
                <td style={{ padding: 'var(--spacing-md)', color: t.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 600 }}>
                  {t.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                </td>
                <td style={{ padding: 'var(--spacing-md)', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={() => onEdit(t)} className="btn" style={{ padding: '8px', background: 'transparent', color: 'var(--clr-primary)' }} title="Editar">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => onDelete(t.id!)} className="btn" style={{ padding: '8px', background: 'transparent', color: 'var(--clr-danger)' }} title="Apagar">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hide-on-desktop" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

      <Modal isOpen={!!mobileActionItem} onClose={() => setMobileActionItem(null)} title="Opções da Transação">
        <div style={{ display: 'grid', gap: '16px' }}>
          <button 
            className="glass-panel hover-lift" 
            style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '16px' }}
            onClick={() => {
              if (mobileActionItem) onEdit(mobileActionItem);
              setMobileActionItem(null);
            }}
          >
            <div style={{ background: 'var(--clr-primary)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Pencil size={24} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>Editar</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Modificar os dados desta transação.</p>
            </div>
          </button>
          
          <button 
            className="glass-panel hover-lift" 
            style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '16px' }}
            onClick={() => {
              if (mobileActionItem?.id) onDelete(mobileActionItem.id);
              setMobileActionItem(null);
            }}
          >
            <div style={{ background: 'var(--clr-danger)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trash2 size={24} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>Apagar</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Remover transação permanentemente.</p>
            </div>
          </button>
        </div>
      </Modal>
    </>
  );
}
