import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { translate } from '../i18n/translations';

export type Currency = 'BRL' | 'USD';
export type Locale = 'pt-BR' | 'en-US';

interface LocaleContextType {
  currency: Currency;
  locale: Locale;
  formatCurrency: (val: number) => string;
  setCurrency: (currency: Currency) => void;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const CURRENCY_LABELS: Record<Currency, string> = {
  BRL: 'Real (R$)',
  USD: 'Dólar (US$)',
};

const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
};

export { CURRENCY_LABELS, LOCALE_LABELS };

const fallbackPreferences = { locale: 'pt-BR' as Locale, currency: 'BRL' as Currency };

const LocaleContext = createContext<LocaleContextType>({
  ...fallbackPreferences,
  formatCurrency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value).replace(/^([^\d\s]+)\s*/, '$1 '),
  setCurrency: () => undefined,
  setLocale: () => undefined,
  t: (key, values) => translate('pt-BR', key, values),
});

function detectSystemDefaults(): { locale: Locale; currency: Currency } {
  if (typeof navigator === 'undefined') return fallbackPreferences;

  const lang = navigator.language?.toLowerCase() ?? '';
  if (lang.startsWith('pt')) return { locale: 'pt-BR', currency: 'BRL' };
  if (lang.startsWith('en')) return { locale: 'en-US', currency: 'USD' };
  return { locale: 'pt-BR', currency: 'BRL' };
}

function storageKey(uid: string) {
  return `@financas:locale:${uid}`;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const systemDefaults = useMemo(() => detectSystemDefaults(), []);

  const [locale, setLocaleState] = useState<Locale>(systemDefaults.locale);
  const [currency, setCurrencyState] = useState<Currency>(systemDefaults.currency);
  const preferencesRef = useRef({ locale: systemDefaults.locale, currency: systemDefaults.currency });

  // Load saved preference when user logs in
  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(storageKey(user.uid));
    if (raw) {
      try {
        const saved = JSON.parse(raw) as { locale: Locale; currency: Currency };
        if (saved.locale && saved.currency) {
          preferencesRef.current = saved;
          setLocaleState(saved.locale);
          setCurrencyState(saved.currency);
        }
      } catch {
        // Ignore malformed data
      }
    } else {
      // No saved preference — use system defaults
      preferencesRef.current = systemDefaults;
      setLocaleState(systemDefaults.locale);
      setCurrencyState(systemDefaults.currency);
    }
  }, [user?.uid, systemDefaults.locale, systemDefaults.currency]);

  const updatePreferences = useCallback((next: { locale: Locale; currency: Currency }) => {
    preferencesRef.current = next;
    setLocaleState(next.locale);
    setCurrencyState(next.currency);
    if (user) localStorage.setItem(storageKey(user.uid), JSON.stringify(next));
  }, [user]);

  const setLocale = useCallback((next: Locale) => {
    updatePreferences({ ...preferencesRef.current, locale: next });
  }, [updatePreferences]);

  const setCurrency = useCallback((next: Currency) => {
    updatePreferences({ ...preferencesRef.current, currency: next });
  }, [updatePreferences]);

  const formatCurrency = useMemo(
    () => (val: number) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency })
        .format(val)
        .replace(/^([^\d\s]+)\s*/, '$1 '),
    [locale, currency]
  );
  const t = useCallback((key: string, values?: Record<string, string | number>) => translate(locale, key, values), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ currency, locale, formatCurrency, setCurrency, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
