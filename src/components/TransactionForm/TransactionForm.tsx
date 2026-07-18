import React, { useState } from 'react';
import { Calendar, DollarSign, CreditCard, AlignLeft, Layers, Tag } from 'lucide-react';
import type { Transaction } from '../../types';
import { ExpenseCategory, IncomeCategory, PaymentMethod } from '../../enums/FinanceEnums';
import { CurrencyInput } from '../CurrencyInput';
import { DateInput } from '../DateInput';
import { getLocalDateString } from '../../utils/dateUtils';
import { useLocale } from '../../store/LocaleContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { CustomSelect } from '../shared/CustomSelect/CustomSelect';
import { getCategoryIcon, getPaymentMethodIcon } from '../../utils/categoryIcons';
import '../../styles/FormStyles.css';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Partial<Transaction>;
  defaultType?: 'income' | 'expense';
}

export function TransactionForm({ onSubmit, initialData, defaultType = 'expense' }: TransactionFormProps) {
  const isMobile = useIsMobile();
  const { t, formatCurrency, locale } = useLocale();
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState<number | ''>(initialData?.amount ?? '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || PaymentMethod.CREDIT);
  const [installments, setInstallments] = useState(initialData?.installments || 1);
  const [date, setDate] = useState(initialData?.date || getLocalDateString());
  const [category, setCategory] = useState(initialData?.category || '');
  const [currentStep, setCurrentStep] = useState(1);

  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || defaultType);

  const categories = type === 'expense' ? Object.values(ExpenseCategory) : Object.values(IncomeCategory);

  const paymentOptions = type === 'expense' 
    ? [
        { value: PaymentMethod.CREDIT, label: t('form.credit'), icon: getPaymentMethodIcon(PaymentMethod.CREDIT) },
        { value: PaymentMethod.DEBIT, label: t('form.debit'), icon: getPaymentMethodIcon(PaymentMethod.DEBIT) },
        { value: PaymentMethod.PIX, label: t('form.pix'), icon: getPaymentMethodIcon(PaymentMethod.PIX) },
        { value: PaymentMethod.CASH, label: t('form.cash'), icon: getPaymentMethodIcon(PaymentMethod.CASH) },
        { value: PaymentMethod.BOLETO, label: t('form.boleto'), icon: getPaymentMethodIcon(PaymentMethod.BOLETO) },
      ]
    : [
        { value: PaymentMethod.PIX, label: t('form.pix'), icon: getPaymentMethodIcon(PaymentMethod.PIX) },
        { value: PaymentMethod.CASH, label: t('form.cash'), icon: getPaymentMethodIcon(PaymentMethod.CASH) },
        { value: PaymentMethod.TRANSFER, label: t('form.transfer'), icon: getPaymentMethodIcon(PaymentMethod.TRANSFER) },
      ];

  const categoryOptions = categories.map(cat => ({
    value: cat,
    label: t(`categories.${cat}`),
    icon: getCategoryIcon(cat)
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMobile && currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc || !amount || !date) return;
    
    onSubmit({
      description: trimmedDesc,
      amount: Number(amount),
      paymentMethod,
      installments: (paymentMethod === PaymentMethod.CREDIT || paymentMethod === PaymentMethod.BOLETO) ? installments : 1,
      date,
      type,
      category: category || undefined
    });
    
    setDescription('');
    setAmount('');
    setPaymentMethod(PaymentMethod.CREDIT);
    setInstallments(1);
    setDate(getLocalDateString());
    setCategory('');
    setCurrentStep(1);
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(''); // reset category on type change
    if (newType === 'income' && (paymentMethod === PaymentMethod.CREDIT || paymentMethod === PaymentMethod.DEBIT)) {
      setPaymentMethod('Pix');
    }
  };

  return (
      <form onSubmit={handleSubmit}>
        {isMobile && (
          <div style={{ marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--clr-text-secondary)', fontWeight: 500 }}>
            {t('form.step', { current: currentStep, total: 2 })}
            {currentStep === 2 && description && (
              <div style={{ fontSize: '0.85rem', marginTop: '6px', opacity: 0.9 }}>
                <strong>{description}</strong> 
                <span style={{ 
                  fontSize: '0.65rem', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  backgroundColor: type === 'expense' ? 'var(--clr-danger-glow, rgba(239, 68, 68, 0.1))' : 'var(--clr-success-glow, rgba(34, 197, 94, 0.1))', 
                  color: type === 'expense' ? 'var(--clr-danger, #ef4444)' : 'var(--clr-success, #22c55e)', 
                  marginLeft: '6px',
                  verticalAlign: 'middle',
                  fontWeight: 600 
                }}>
                  {type === 'expense' ? t('form.expense') : t('form.income')}
                </span>
                <br/>
                <span style={{ display: 'inline-block', marginTop: '4px', color: 'var(--clr-text-secondary)' }}>
                  {amount ? formatCurrency(Number(amount)) : ''} • {date ? new Intl.DateTimeFormat(locale).format(new Date(date + 'T12:00:00')) : ''}
                </span>
              </div>
            )}
          </div>
        )}

        <div className={!isMobile ? "desktop-wizard-layout" : ""}>
          {(!isMobile || currentStep === 1) && (
            <div className={!isMobile ? "wizard-column step1-column" : ""}>
              <div className="form-group" role="group" aria-label={t('form.type')}>
                <label className="form-label">{t('form.type')}</label>
                <div className="flex gap-sm">
                  <button type="button" aria-pressed={type === 'expense'} onClick={() => handleTypeChange('expense')} className={`btn form-type-btn ${type === 'expense' ? 'form-type-btn-expense-active' : 'form-type-btn-inactive'}`}>{t('form.expense')}</button>
                  <button type="button" aria-pressed={type === 'income'} onClick={() => handleTypeChange('income')} className={`btn form-type-btn ${type === 'income' ? 'form-type-btn-income-active' : 'form-type-btn-inactive'}`}>{t('form.income')}</button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="desc-input" className="form-label"><AlignLeft size={16} aria-hidden="true" /> {t('common.description')} *</label>
                <input 
                  id="desc-input"
                  type="text" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder={t('form.placeholderSupermarket')}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount-input" className="form-label"><DollarSign size={16} aria-hidden="true" /> {t('form.totalAmount')} *</label>
                  <CurrencyInput 
                    id="amount-input"
                    value={amount} 
                    onChangeValue={setAmount} 
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date-input" className="form-label"><Calendar size={16} aria-hidden="true" /> {t('common.date')} *</label>
                  <DateInput 
                    id="date-input"
                    value={date} 
                    onChangeValue={setDate}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {(!isMobile || currentStep === 2) && (
            <div className={!isMobile ? "wizard-column step2-column" : ""}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="payment-method-input" className="form-label"><CreditCard size={16} aria-hidden="true" /> {type === 'income' ? t('form.receipt') : t('form.payment')}</label>
                  <CustomSelect
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    options={paymentOptions}
                  />
                </div>

                {type === 'expense' && (paymentMethod === PaymentMethod.CREDIT || paymentMethod === PaymentMethod.BOLETO) && (
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="installments-input" className="form-label"><Layers size={16} aria-hidden="true" /> {t('form.installments')}</label>
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

              <div className="form-group" style={{ zIndex: 40 }}>
                <label htmlFor="category-input" className="form-label"><Tag size={16} aria-hidden="true" /> {t('form.category')}</label>
                <CustomSelect
                  value={category}
                  onChange={setCategory}
                  options={categoryOptions}
                  placeholder={t('form.selectCategory')}
                  searchable={true}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-sm" style={{ marginTop: '24px' }}>
          {isMobile && currentStep === 2 && (
            <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-secondary flex-1">
              {t('form.back')}
            </button>
          )}
          <button type="submit" className="btn btn-primary hover-glow flex-1">
            {(isMobile && currentStep === 1) ? t('form.next') : (initialData ? t('common.saveChanges') : t('form.addTransaction'))}
          </button>
        </div>
      </form>
  );
}
