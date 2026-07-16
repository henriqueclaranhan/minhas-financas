import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../types';
import { TransactionType } from '../../enums/FinanceEnums';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
        Nenhuma transação registrada ainda.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
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
                <span className="hide-on-mobile">{format(parseISO(t.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                <span className="hide-on-desktop">{format(parseISO(t.date), 'dd/MM', { locale: ptBR })}</span>
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
                <button 
                  onClick={() => onEdit(t)}
                  className="btn"
                  style={{ padding: '8px', background: 'transparent', color: 'var(--clr-primary)' }}
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => onDelete(t.id!)}
                  className="btn"
                  style={{ padding: '8px', background: 'transparent', color: 'var(--clr-danger)' }}
                  title="Apagar"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
