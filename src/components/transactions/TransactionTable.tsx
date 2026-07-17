import { useState, useRef } from 'react';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../types';
import { TransactionType } from '../../enums/FinanceEnums';
import { Modal } from '../Modal';
import { TransactionMobileCard } from './TransactionMobileCard';
import './Transaction.css';

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
      <div className="empty-state-text">
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
      <div className="hide-on-mobile table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-date">Data</th>
              <th className="col-desc">Descrição</th>
              <th className="col-method">Método</th>
              <th className="col-amount">Valor</th>
              <th className="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="td-secondary td-nowrap">
                  {format(parseISO(t.date), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="td-bold">
                  {t.description}
                  {t.installments > 1 && (
                    <span className="badge-installments">
                      {t.installments}x
                    </span>
                  )}
                </td>
                <td className="td-secondary">{t.paymentMethod}</td>
                <td className={t.type === TransactionType.INCOME ? 'td-amount-income' : 'td-amount-expense'}>
                  {t.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                </td>
                <td className="td-actions">
                  <button onClick={() => onEdit(t)} className="btn btn-action primary" title="Editar">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => onDelete(t.id!)} className="btn btn-action danger" title="Apagar">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hide-on-desktop mobile-card-list">
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
        <div className="modal-grid">
          <button 
            className="glass-panel hover-lift modal-action-btn"
            onClick={() => {
              if (mobileActionItem) onEdit(mobileActionItem);
              setMobileActionItem(null);
            }}
          >
            <div className="icon-circle primary">
              <Pencil size={24} color="#fff" />
            </div>
            <div>
              <h3 className="modal-action-title">Editar</h3>
              <p className="modal-action-desc">Modificar os dados desta transação.</p>
            </div>
          </button>
          
          <button 
            className="glass-panel hover-lift modal-action-btn"
            onClick={() => {
              if (mobileActionItem?.id) onDelete(mobileActionItem.id);
              setMobileActionItem(null);
            }}
          >
            <div className="icon-circle danger">
              <Trash2 size={24} color="#fff" />
            </div>
            <div>
              <h3 className="modal-action-title">Apagar</h3>
              <p className="modal-action-desc">Remover transação permanentemente.</p>
            </div>
          </button>
        </div>
      </Modal>
    </>
  );
}
