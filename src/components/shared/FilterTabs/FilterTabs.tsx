import { CreditCard, Filter, Tags } from 'lucide-react';
import './FilterTabs.css';
import { useLocale } from '../../../store/LocaleContext';

interface FilterTabsProps {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onOpenFilters: () => void;
  activeMethodLabel?: string;
  activeCategoryLabel?: string;
}

export function FilterTabs({ searchQuery, setSearchQuery, onOpenFilters, activeMethodLabel, activeCategoryLabel }: FilterTabsProps) {
  const { t } = useLocale();
  return (
    <div className="glass-panel filter-tabs-panel">
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
        <button type="button" className="btn filter-action-btn" onClick={onOpenFilters} title={t('filters.title')} aria-label={t('filters.title')}>
          <Filter size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
