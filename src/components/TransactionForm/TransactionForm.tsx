import React, { useState } from 'react';
import { Calendar, DollarSign, CreditCard, AlignLeft, Layers, Tag } from 'lucide-react';
import type { Transaction } from '../../types';
import { ExpenseCategory, IncomeCategory } from '../../enums/FinanceEnums';
import { CurrencyInput } from '../CurrencyInput';
import { DateInput } from '../DateInput';
import { getLocalDateString } from '../../utils/dateUtils';
import { useLocale } from '../../store/LocaleContext';
import '../../styles/FormStyles.css';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Partial<Transaction>;
  defaultType?: 'income' | 'expense';
}

export function TransactionForm({ onSubmit, initialData, defaultType = 'expense' }: TransactionFormProps) {
  const { t } = useLocale();
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState<number | ''>(initialData?.amount ?? '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || 'Crédito');
  const [installments, setInstallments] = useState(initialData?.installments || 1);
  const [date, setDate] = useState(initialData?.date || getLocalDateString());

  const [category, setCategory] = useState(initialData?.category || '');

  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || defaultType);

  const categories = type === 'expense' ? Object.values(ExpenseCategory) : Object.values(IncomeCategory);


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
      type,
      category: category || undefined
    });
    
    setDescription('');
    setAmount('');
    setPaymentMethod('Crédito');
    setInstallments(1);
    setDate(getLocalDateString());
    setCategory('');
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(''); // reset category on type change
    if (newType === 'income' && (paymentMethod === 'Crédito' || paymentMethod === 'Débito')) {
      setPaymentMethod('Pix');
    }
  };

  return (
      <form onSubmit={handleSubmit}>
        <div className="form-group" role="group" aria-label={t('form.type')}>
          <label className="form-label">{t('form.type')}</label>
          <div className="flex gap-sm">
            <button type="button" aria-pressed={type === 'expense'} onClick={() => handleTypeChange('expense')} className={`btn form-type-btn ${type === 'expense' ? 'form-type-btn-expense-active' : 'form-type-btn-inactive'}`}>{t('form.expense')}</button>
            <button type="button" aria-pressed={type === 'income'} onClick={() => handleTypeChange('income')} className={`btn form-type-btn ${type === 'income' ? 'form-type-btn-income-active' : 'form-type-btn-inactive'}`}>{t('form.income')}</button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="desc-input" className="form-label"><AlignLeft size={16} aria-hidden="true" /> {t('common.description')}</label>
          <input 
            id="desc-input"
            type="text" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Ex: Supermercado"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category-input" className="form-label"><Tag size={16} aria-hidden="true" /> {t('form.category')}</label>
          <select
            id="category-input"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="form-select"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount-input" className="form-label"><DollarSign size={16} aria-hidden="true" /> {t('form.totalAmount')}</label>
            <CurrencyInput 
              id="amount-input"
              value={amount} 
              onChangeValue={setAmount} 
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date-input" className="form-label"><Calendar size={16} aria-hidden="true" /> {t('common.date')}</label>
            <DateInput 
              id="date-input"
              value={date} 
              onChangeValue={setDate}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="payment-method-input" className="form-label"><CreditCard size={16} aria-hidden="true" /> {type === 'income' ? 'Recebimento' : 'Pagamento'}</label>
            <select 
              id="payment-method-input"
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
              <label htmlFor="installments-input" className="form-label"><Layers size={16} aria-hidden="true" /> Parcelas</label>
              <input 
                id="installments-input"
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
          {initialData ? t('common.saveChanges') : t('form.addTransaction')}
        </button>
      </form>
  );
}
