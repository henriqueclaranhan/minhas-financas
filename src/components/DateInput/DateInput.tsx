import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { useLocale } from '../../store/LocaleContext';
import './DateInput.css';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string; // Always YYYY-MM-DD
  onChangeValue: (val: string) => void;
}

const formatDateToLocale = (isoDate: string, locale: string) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return '';
  if (locale === 'en-US') {
    return `${month}/${day}/${year}`;
  }
  return `${day}/${month}/${year}`;
};

export function DateInput({ value, onChangeValue, className, required, ...rest }: DateInputProps) {
  const { locale } = useLocale();
  const [textValue, setTextValue] = useState(formatDateToLocale(value, locale));
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTextValue(formatDateToLocale(value, locale));
  }, [value, locale]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 8) raw = raw.slice(0, 8);
    
    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0,2)}/${raw.slice(2,4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0,2)}/${raw.slice(2)}`;
    }

    setTextValue(formatted);

    if (raw.length === 8) {
      const p1 = raw.slice(0, 2);
      const p2 = raw.slice(2, 4);
      const year = raw.slice(4, 8);
      
      let finalDate = '';
      if (locale === 'en-US') {
        finalDate = `${year}-${p1}-${p2}`; // MM-DD
      } else {
        finalDate = `${year}-${p2}-${p1}`; // DD-MM
      }
      
      const d = new Date(finalDate);
      if (!isNaN(d.getTime())) {
         onChangeValue(finalDate);
      }
    } else if (raw.length === 0 && !required) {
       onChangeValue('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // If they left it half-typed, revert to the valid `value`
    setTextValue(formatDateToLocale(value, locale));
    if (rest.onBlur) rest.onBlur(e);
  };

  return (
    <div className="date-input-wrapper">
      <input
        {...rest}
        type="text"
        className={`${className || ''} date-input-field`.trim()}
        value={textValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={locale === 'en-US' ? 'MM/DD/YYYY' : 'DD/MM/YYYY'}
        required={required}
      />
      
      <div className="date-input-picker-wrapper">
        <Calendar size={20} className="date-input-icon" />
        <input 
          ref={dateInputRef}
          type="date"
          className="date-input-native-picker"
          value={value}
          onChange={(e) => {
            if (e.target.value) {
              onChangeValue(e.target.value);
            }
          }}
          onClick={(e) => {
            try {
              if ('showPicker' in HTMLInputElement.prototype) {
                (e.target as HTMLInputElement).showPicker();
              }
            } catch (err) {}
          }}
        />
      </div>
    </div>
  );
}
