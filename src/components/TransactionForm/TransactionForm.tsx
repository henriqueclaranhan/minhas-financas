import React, { useState } from 'react';
import { Calendar, DollarSign, CreditCard, AlignLeft, Layers } from 'lucide-react';
import type { Transaction } from '../../types';
import { CurrencyInput } from '../CurrencyInput';
import { handleDatePaste } from '../../utils/dateUtils';
import '../../styles/FormStyles.css';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Partial<Transaction>;
  defaultType?: 'income' | 'expense';
}

export function TransactionForm({ onSubmit, initialData, defaultType = 'expense' }: TransactionFormProps) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState<number | ''>(initialData?.amount ?? '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || 'Crédito');
  const [installments, setInstallments] = useState(initialData?.installments || 1);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || defaultType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDesc = description.trim();
    if (!trimmedDesc || !amount || !date) return;
    
    onSubmit({
      description: trimmedDesc,
      amount: Number(amount),
      paymentMethod,
      installments: paymentMethod.toLowerCase().includes('crédito') ? installments : 1,
      date,
      type
    });
    
    setDescription('');
    setAmount('');
    setPaymentMethod('Crédito');
    setInstallments(1);
    setDate(new Date().toISOString().split('T')[0]);
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
          <label className="form-label">Tipo de Transação</label>
          <div className="flex gap-sm">
            <button type="button" onClick={() => handleTypeChange('expense')} className={`btn form-type-btn ${type === 'expense' ? 'form-type-btn-expense-active' : 'form-type-btn-inactive'}`}>Despesa</button>
            <button type="button" onClick={() => handleTypeChange('income')} className={`btn form-type-btn ${type === 'income' ? 'form-type-btn-income-active' : 'form-type-btn-inactive'}`}>Receita</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label"><AlignLeft size={16} /> Descrição</label>
          <input 
            type="text" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Ex: Supermercado"
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label"><DollarSign size={16} /> Valor Total</label>
            <CurrencyInput 
              value={amount} 
              onChangeValue={setAmount} 
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label"><Calendar size={16} /> Data</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              onPaste={e => handleDatePaste(e, setDate)}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label"><CreditCard size={16} /> {type === 'income' ? 'Recebimento' : 'Pagamento'}</label>
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
              <label className="form-label"><Layers size={16} /> Parcelas</label>
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

        <button type="submit" className="btn btn-primary hover-glow form-submit-btn">
          {initialData ? 'Salvar Alterações' : 'Adicionar Transação'}
        </button>
      </form>
  );
}
