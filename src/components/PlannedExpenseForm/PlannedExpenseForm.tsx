import React, { useState } from 'react';
import { Calendar, DollarSign, CreditCard, AlignLeft, Layers, Tag, RefreshCw } from 'lucide-react';
import { CurrencyInput } from '../CurrencyInput';
import { DateInput } from '../DateInput';
import { useLocale } from '../../store/LocaleContext';
import type { PlannedExpense } from '../../types';
import { ExpenseCategory, ExpenseStatus, IncomeCategory, PaymentMethod, TransactionType } from '../../enums/FinanceEnums';
import { useIsMobile } from '../../hooks/useIsMobile';
import { CustomSelect } from '../shared/CustomSelect/CustomSelect';
import { getCategoryIcon, getPaymentMethodIcon } from '../../utils/categoryIcons';
import '../../styles/FormStyles.css';

interface PlannedExpenseFormProps {
  onSubmit: (data: Omit<PlannedExpense, 'id'>) => void;
  initialData?: Partial<PlannedExpense>;
  defaultType?: TransactionType;
}

export function PlannedExpenseForm({ onSubmit, initialData, defaultType = TransactionType.EXPENSE }: PlannedExpenseFormProps) {
  const isMobile = useIsMobile();
  const { t, formatCurrency, locale } = useLocale();
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState<number | ''>(initialData?.amount ?? '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [recurrenceInterval, setRecurrenceInterval] = useState(initialData?.recurrenceInterval?.toString() || '1');
  const [type, setType] = useState<TransactionType>(initialData?.type || defaultType);
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || PaymentMethod.CREDIT);
  const [installments, setInstallments] = useState(initialData?.installments || 1);
  const [category, setCategory] = useState(initialData?.category || '');
  const [currentStep, setCurrentStep] = useState(1);

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
    if (!trimmedDesc || !amount || !dueDate) return;
    
    onSubmit({
      description: trimmedDesc,
      amount: Number(amount),
      dueDate,
      isRecurring,
      recurrenceInterval: parseInt(recurrenceInterval) || 1,
      status: ExpenseStatus.PENDING,
      type,
      paymentMethod,
      installments: (paymentMethod === PaymentMethod.CREDIT || paymentMethod === PaymentMethod.BOLETO) ? installments : 1,
      category: category || undefined
    });
    
    // Reset
    setDescription('');
    setAmount('');
    setDueDate('');
    setIsRecurring(false);
    setPaymentMethod(PaymentMethod.CREDIT);
    setInstallments(1);
    setCategory('');
    setCurrentStep(1);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory('');
    if (newType === 'income' && (paymentMethod === PaymentMethod.CREDIT || paymentMethod === PaymentMethod.DEBIT)) {
      setPaymentMethod(PaymentMethod.PIX);
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
                {amount ? formatCurrency(Number(amount)) : ''} • {dueDate ? new Intl.DateTimeFormat(locale).format(new Date(dueDate + 'T12:00:00')) : ''}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={!isMobile ? "desktop-wizard-layout" : ""}>
        {(!isMobile || currentStep === 1) && (
          <div className={!isMobile ? "wizard-column step1-column" : ""}>
            <div className="form-group">
              <label className="form-label">{t('form.type')}</label>
              <div className="flex gap-sm">
                <button type="button" onClick={() => handleTypeChange('expense')} className={`btn form-type-btn ${type === 'expense' ? 'form-type-btn-expense-active' : 'form-type-btn-inactive'}`}>{t('form.expense')}</button>
                <button type="button" onClick={() => handleTypeChange('income')} className={`btn form-type-btn ${type === 'income' ? 'form-type-btn-income-active' : 'form-type-btn-inactive'}`}>{t('form.income')}</button>
              </div>
            </div>
        
            <div className="form-group">
              <label className="form-label"><AlignLeft size={16} aria-hidden="true" /> {t('common.description')} *</label>
              <input 
                type="text" 
                placeholder={t('form.placeholderRent')}
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><DollarSign size={16} aria-hidden="true" /> {t('common.amount')} *</label>
                <CurrencyInput 
                  value={amount}
                  onChangeValue={setAmount}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label"><Calendar size={16} aria-hidden="true" /> {t('form.dueDate')} *</label>
                <DateInput 
                  value={dueDate}
                  onChangeValue={setDueDate}
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
                  <label className="form-label"><Layers size={16} aria-hidden="true" /> {t('form.installments')}</label>
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
            
            <label className="form-checkbox-label">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
              />
              {t('form.recurring')}
            </label>

            {isRecurring && (
              <div className="form-group">
                <label className="form-label"><RefreshCw size={16} aria-hidden="true" /> Repetir a cada (meses): *</label>
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
          {(isMobile && currentStep === 1) ? t('form.next') : (initialData ? t('common.saveChanges') : t('form.savePlanning'))}
        </button>
      </div>
    </form>
  );
}
