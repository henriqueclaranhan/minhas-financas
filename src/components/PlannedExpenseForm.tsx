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
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || 'Crédito');
  const [installments, setInstallments] = useState(initialData?.installments || 1);

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
      type,
      paymentMethod,
      installments: paymentMethod.toLowerCase().includes('crédito') ? installments : 1
    });
    
    // Reset
    setDescription('');
    setAmount('');
    setDueDate('');
    setIsRecurring(false);
    setPaymentMethod('Crédito');
    setInstallments(1);
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    if (newType === 'income' && (paymentMethod === 'Crédito' || paymentMethod === 'Débito')) {
      setPaymentMethod('Pix');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Tipo</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={() => handleTypeChange('expense')} className="btn" style={{ flex: 1, background: type === 'expense' ? 'var(--clr-danger)' : 'var(--clr-surface-alt)', color: type === 'expense' ? '#fff' : 'var(--clr-text-primary)' }}>Despesa</button>
          <button type="button" onClick={() => handleTypeChange('income')} className="btn" style={{ flex: 1, background: type === 'income' ? 'var(--clr-success)' : 'var(--clr-surface-alt)', color: type === 'income' ? '#fff' : 'var(--clr-text-primary)' }}>Receita</button>
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

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Forma de Pagamento</label>
          <select 
            value={paymentMethod} 
            onChange={e => setPaymentMethod(e.target.value)}
            className="form-select"
          >
            {type === 'expense' && <option value="Crédito">Crédito</option>}
            {type === 'expense' && <option value="Débito">Débito</option>}
            <option value="Pix">Pix</option>
            <option value="Dinheiro">Dinheiro</option>
            {type === 'income' && <option value="Transferência">Transferência</option>}
          </select>
        </div>

        {type === 'expense' && paymentMethod.toLowerCase().includes('crédito') && (
          <div className="form-group">
            <label className="form-label">Parcelas</label>
            <input 
              type="number" 
              min="1" 
              value={installments} 
              onChange={e => setInstallments(parseInt(e.target.value))}
              className="form-input"
            />
          </div>
        )}
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
