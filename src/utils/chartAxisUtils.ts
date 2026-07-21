import type { Currency, Locale } from '../store/LocaleContext';

export function createCompactCurrencyFormatter(locale: Locale, currency: Currency) {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  return (value: number) => formatter.format(value);
}

export function calculateCurrencyAxisWidth(values: number[], formatter: (value: number) => string) {
  const candidates = values.length > 0 ? [...values, 0] : [0];
  const longestLabel = candidates.reduce(
    (longest, value) => Math.max(longest, formatter(value).length),
    0,
  );

  return Math.min(104, Math.max(64, longestLabel * 7 + 16));
}
