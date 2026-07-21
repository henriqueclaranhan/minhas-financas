import { ArrowDownCircle, ArrowUpCircle, List } from 'lucide-react';
import { FilterType } from '../../../enums/FinanceEnums';
import { useLocale } from '../../../store/LocaleContext';

interface FilterTypeTabsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

export function FilterTypeTabs({ filter, setFilter }: FilterTypeTabsProps) {
  const { t } = useLocale();

  return (
    <div className="filter-tabs-container filter-type-tabs">
      <button
        onClick={() => setFilter(FilterType.ALL)}
        className={`btn filter-tab-btn ${filter === FilterType.ALL ? 'filter-tab-btn-active' : 'filter-tab-btn-inactive'}`}
      >
        <List size={16} /> {t('filters.all')}
      </button>
      <button
        onClick={() => setFilter(FilterType.INCOME)}
        className={`btn filter-tab-btn ${filter === FilterType.INCOME ? 'filter-tab-btn-active-success' : 'filter-tab-btn-inactive'}`}
      >
        <ArrowUpCircle size={16} /> {t('chart.income')}
      </button>
      <button
        onClick={() => setFilter(FilterType.EXPENSE)}
        className={`btn filter-tab-btn ${filter === FilterType.EXPENSE ? 'filter-tab-btn-active-danger' : 'filter-tab-btn-inactive'}`}
      >
        <ArrowDownCircle size={16} /> {t('chart.expense')}
      </button>
    </div>
  );
}
