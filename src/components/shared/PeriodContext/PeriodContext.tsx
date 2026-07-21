import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import { useLocale } from '../../../store/LocaleContext';
import './PeriodContext.css';

interface PeriodContextProps {
  label: string;
  onAdjust: () => void;
}

export function PeriodContext({ label, onAdjust }: PeriodContextProps) {
  const { t } = useLocale();

  return (
    <div className="period-context">
      <div className="period-context-icon" aria-hidden="true">
        <CalendarDays size={20} />
      </div>
      <div className="period-context-copy">
        <span className="period-context-eyebrow">{t('filters.displayedPeriod')}</span>
        <strong className="period-context-value">{label}</strong>
      </div>
      <button
        type="button"
        className="btn period-context-action"
        onClick={onAdjust}
        title={t('filters.adjust')}
        aria-label={t('filters.adjust')}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>{t('filters.adjust')}</span>
      </button>
    </div>
  );
}
