import React, { useState } from 'react';
import { CurrencyInput } from './CurrencyInput';
import type { PlannedExpense } from '../types';
import { handleDatePaste } from '../utils/dateUtils';

interface PlannedExpenseFormProps {
  onSubmit: (data: any) => void;
  initialData?: Partial<PlannedExpense>;
  defaultType?: 'income' | 'expense';
}

export function PlannedExpenseForm({ onSubmit, initialData, defaultType = 'expense' }: PlannedExpenseFormProps) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState<number | ''>(initialData?.amount ?? '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [recurrenceInterval, setRecurrenceInterval] = useState(initialData?.recurrenceInterval?.toString() || '1');
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || defaultType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDesc = description.trim();
    if (!trimmedDesc || !amount || !dueDate) return;
    
    onSubmit({
      description: trimmedDesc,
      amount: Number(amount),
      dueDate,
      isRecurring,
      recurrenceInterval: parseInt(recurrenceInterval) || 1,
      status: 'pending',
      type
    });
    
    // Reset
    setDescription('');
    setAmount('');
    setDueDate('');
    setIsRecurring(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Tipo</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={() => setType('expense')} className="btn" style={{ flex: 1, background: type === 'expense' ? 'var(--clr-danger)' : 'var(--clr-surface-alt)', color: type === 'expense' ? '#fff' : 'var(--clr-text-primary)' }}>Despesa</button>
          <button type="button" onClick={() => setType('income')} className="btn" style={{ flex: 1, background: type === 'income' ? 'var(--clr-success)' : 'var(--clr-surface-alt)', color: type === 'income' ? '#fff' : 'var(--clr-text-primary)' }}>Receita</button>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Descrição</label>
        <input 
          type="text" 
          placeholder="Ex: Aluguel" 
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          className="form-input"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Valor</label>
          <CurrencyInput 
            value={amount}
            onChangeValue={setAmount}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Data Prevista</label>
          <input 
            type="date" 
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            onPaste={e => handleDatePaste(e, setDueDate)}
            required
            className="form-input"
          />
        </div>
      </div>
      
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', fontSize: '0.875rem' }}>
        <input 
          type="checkbox" 
          checked={isRecurring}
          onChange={e => setIsRecurring(e.target.checked)}
        />
        É uma despesa/receita recorrente?
      </label>

      {isRecurring && (
        <div className="form-group">
          <label className="form-label">Repetir a cada (meses):</label>
          <input 
            type="number" 
            min="1"
            value={recurrenceInterval}
            onChange={e => setRecurrenceInterval(e.target.value)}
            required
            className="form-input"
          />
        </div>
      )}

      <button type="submit" className="btn btn-primary hover-glow" style={{ width: '100%', marginTop: '8px' }}>
        {initialData ? 'Salvar Alterações' : 'Salvar Planejamento'}
      </button>
    </form>
  );
}
