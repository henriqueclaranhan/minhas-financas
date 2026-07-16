import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { PlannedExpense } from '../../types';
import { TransactionType } from '../../enums/FinanceEnums';

interface PlannedExpenseTableProps {
  expenses: PlannedExpense[];
  onConfirm: (p: PlannedExpense) => void;
  onReject: (id: string) => void;
  onEdit: (p: PlannedExpense) => void;
  onDelete: (id: string) => void;
}

export function PlannedExpenseTable({ expenses, onConfirm, onReject, onEdit, onDelete }: PlannedExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
        Nenhum gasto planejado pendente.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
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
            const isCurrent = pDate.getUTCMonth() === new Date().getMonth() && pDate.getUTCFullYear() === new Date().getFullYear();

            return (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                <td style={{ padding: 'var(--spacing-md)', color: p.type === TransactionType.INCOME ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  <span className="hide-on-mobile">{format(pDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                  <span className="hide-on-desktop">{format(pDate, 'dd/MM', { locale: ptBR })}</span>
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
                      <button 
                        onClick={() => onConfirm(p)}
                        className="btn"
                        style={{ padding: '8px', background: 'transparent', color: 'var(--clr-success)' }}
                        title="Confirmar"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => onReject(p.id!)}
                        className="btn"
                        style={{ padding: '8px', background: 'transparent', color: 'var(--clr-warning)' }}
                        title="Recusar/Pular"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => onEdit(p)}
                    className="btn"
                    style={{ padding: '8px', background: 'transparent', color: 'var(--clr-primary)' }}
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(p.id!)}
                    className="btn"
                    style={{ padding: '8px', background: 'transparent', color: 'var(--clr-danger)' }}
                    title="Apagar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
