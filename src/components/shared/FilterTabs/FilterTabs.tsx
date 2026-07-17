import { FilterType } from '../../../enums/FinanceEnums';
import { List, ArrowUpCircle, ArrowDownCircle, Filter, CalendarDays, CreditCard } from 'lucide-react';
import './FilterTabs.css';

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
    <div className="glass-panel filter-tabs-panel">
      <div className="filter-tabs-container">
        <button 
          onClick={() => setFilter(FilterType.ALL)} 
          className={`btn filter-tab-btn ${filter === FilterType.ALL ? 'filter-tab-btn-active' : 'filter-tab-btn-inactive'}`}
        >
          <List size={16} /> Todas
        </button>
        <button 
          onClick={() => setFilter(FilterType.INCOME)} 
          className={`btn filter-tab-btn ${filter === FilterType.INCOME ? 'filter-tab-btn-active-success' : 'filter-tab-btn-inactive'}`}
        >
          <ArrowUpCircle size={16} /> Receitas
        </button>
        <button 
          onClick={() => setFilter(FilterType.EXPENSE)} 
          className={`btn filter-tab-btn ${filter === FilterType.EXPENSE ? 'filter-tab-btn-active-danger' : 'filter-tab-btn-inactive'}`}
        >
          <ArrowDownCircle size={16} /> Despesas
        </button>
      </div>

      {(activeDateLabel || activeMethodLabel) && (
        <div className="filter-active-labels">
          {activeDateLabel && (
            <div className="filter-active-label">
              <CalendarDays size={14} /> {activeDateLabel}
            </div>
          )}
          {activeMethodLabel && (
            <div className="filter-active-label">
              <CreditCard size={14} /> {activeMethodLabel}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-sm">
        <input 
          type="search" 
          placeholder="Buscar por nome..." 
          className="form-input filter-search-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button 
          className="btn filter-action-btn" 
          onClick={onOpenFilters}
          title="Filtros"
        >
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
}
