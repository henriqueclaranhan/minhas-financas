import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import { useLocale } from '../../../store/LocaleContext';
import './PeriodContext.css';

interface PeriodContextProps {
  label: string;
  description?: string;
  onChange: () => void;
}

export function PeriodContext({ label, description, onChange }: PeriodContextProps) {
  const { t } = useLocale();

  return (
    <div className="period-context">
      <div className="period-context-main">
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
          onClick={onChange}
          title={t('filters.changePeriod')}
          aria-label={t('filters.changePeriod')}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span>{t('filters.changePeriod')}</span>
        </button>
      </div>
      {description && <p className="period-context-description">{description}</p>}
    </div>
  );
}
