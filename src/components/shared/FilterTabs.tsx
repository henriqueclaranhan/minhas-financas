import { FilterType } from '../../enums/FinanceEnums';
import { List, ArrowUpCircle, ArrowDownCircle, Filter, CalendarDays, CreditCard } from 'lucide-react';

interface FilterTabsProps {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onOpenFilters: () => void;
  activeDateLabel?: string;
  activeMethodLabel?: string;
}

export function FilterTabs({ filter, setFilter, searchQuery, setSearchQuery, onOpenFilters, activeDateLabel, activeMethodLabel }: FilterTabsProps) {
  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
      <div className="filter-tabs-container">
        <button 
          onClick={() => setFilter(FilterType.ALL)} 
          className="btn filter-tab-btn" 
          style={{ background: filter === FilterType.ALL ? 'var(--clr-primary)' : 'var(--clr-surface-alt)', color: filter === FilterType.ALL ? '#fff' : 'var(--clr-text-secondary)' }}
        >
          <List size={16} /> Todas
        </button>
        <button 
          onClick={() => setFilter(FilterType.INCOME)} 
          className="btn filter-tab-btn" 
          style={{ background: filter === FilterType.INCOME ? 'var(--clr-success)' : 'var(--clr-surface-alt)', color: filter === FilterType.INCOME ? '#fff' : 'var(--clr-text-secondary)' }}
        >
          <ArrowUpCircle size={16} /> Receitas
        </button>
        <button 
          onClick={() => setFilter(FilterType.EXPENSE)} 
          className="btn filter-tab-btn" 
          style={{ background: filter === FilterType.EXPENSE ? 'var(--clr-danger)' : 'var(--clr-surface-alt)', color: filter === FilterType.EXPENSE ? '#fff' : 'var(--clr-text-secondary)' }}
        >
          <ArrowDownCircle size={16} /> Despesas
        </button>
      </div>

      {(activeDateLabel || activeMethodLabel) && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--spacing-md)' }}>
          {activeDateLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--clr-text-secondary)', background: 'var(--clr-surface-alt)', padding: '4px 12px', borderRadius: '16px', whiteSpace: 'nowrap' }}>
              <CalendarDays size={14} /> {activeDateLabel}
            </div>
          )}
          {activeMethodLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--clr-text-secondary)', background: 'var(--clr-surface-alt)', padding: '4px 12px', borderRadius: '16px', whiteSpace: 'nowrap' }}>
              <CreditCard size={14} /> {activeMethodLabel}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="search" 
          placeholder="Buscar por nome..." 
          className="form-input"
          style={{ flex: 1 }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button 
          className="btn" 
          style={{ background: 'var(--clr-surface-alt)', color: 'var(--clr-primary)', padding: '10px 14px' }} 
          onClick={onOpenFilters}
          title="Filtros"
        >
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
}
