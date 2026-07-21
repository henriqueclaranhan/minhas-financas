import { CreditCard, Tags } from 'lucide-react';
import './FilterTabs.css';
import { useLocale } from '../../../store/LocaleContext';
import { PeriodContext } from '../PeriodContext';

interface FilterTabsProps {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onOpenFilters: () => void;
  activeDateLabel?: string;
  activeMethodLabel?: string;
  activeCategoryLabel?: string;
}

export function FilterTabs({ searchQuery, setSearchQuery, onOpenFilters, activeDateLabel, activeMethodLabel, activeCategoryLabel }: FilterTabsProps) {
  const { t } = useLocale();
  return (
    <div className="glass-panel filter-tabs-panel">
      {activeDateLabel && <PeriodContext label={activeDateLabel} onAdjust={onOpenFilters} />}

      {(activeMethodLabel || activeCategoryLabel) && (
        <div className="filter-active-labels">
          {activeMethodLabel && (
            <div className="filter-active-label">
              <CreditCard size={14} /> {activeMethodLabel}
            </div>
          )}
          {activeCategoryLabel && (
            <div className="filter-active-label">
              <Tags size={14} /> {activeCategoryLabel}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-sm">
        <input 
          type="search" 
          placeholder={t('filters.search')}
          className="form-input filter-search-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
