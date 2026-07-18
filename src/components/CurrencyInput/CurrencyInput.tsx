import React, { useState, useEffect } from 'react';
import { useLocale } from '../../store/LocaleContext';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | '';
  onChangeValue: (val: number | '') => void;
}

export function CurrencyInput({ value, onChangeValue, ...props }: CurrencyInputProps) {
  const { formatCurrency, currency } = useLocale();
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === '') {
      setDisplayValue('');
    } else {
      setDisplayValue(formatCurrency(Number(value)));
    }
  }, [value, formatCurrency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      onChangeValue('');
      setDisplayValue('');
      return;
    }
    const num = parseInt(raw, 10) / 100;
    onChangeValue(num);
    setDisplayValue(formatCurrency(num));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={currency === 'BRL' ? 'R$ 0,00' : 'US$ 0.00'}
      {...props}
    />
  );
}
