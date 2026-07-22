import { ChevronRight, Medal, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CategoryExpenseData } from '../../../utils/categoryExpenseUtils';
import { getCategoryIcon } from '../../../utils/categoryIcons';
import { useLocale } from '../../../store/LocaleContext';
import './CategoryExpenseSummaryCards.css';

interface CategoryExpenseSummaryCardsProps {
  formattedTotalExpense: string;
  formatCurrency: (value: number) => string;
  topCategory?: CategoryExpenseData;
  secondCategory?: CategoryExpenseData;
  expenseHref: string;
}

interface CategoryCardProps {
  category?: CategoryExpenseData;
  label: string;
  formatCurrency: (value: number) => string;
}

function CategoryCard({ category, label, formatCurrency }: CategoryCardProps) {
  const { t } = useLocale();

  return (
    <div className="glass-panel category-summary-card">
      <div className="category-summary-card-header">
        <div
          className="category-summary-card-icon category"
          style={category ? { color: category.color } : undefined}
        >
          {category ? getCategoryIcon(category.category) : <Medal size={20} aria-hidden="true" />}
        </div>
        <span className="category-summary-card-title">{label}</span>
      </div>
      <div className="category-summary-card-value">
        {category ? t(category.name) : '—'}
      </div>
      {category && (
        <div className="category-summary-card-detail">{formatCurrency(category.value)}</div>
      )}
    </div>
  );
}

export function CategoryExpenseSummaryCards({
  formattedTotalExpense,
  formatCurrency,
  topCategory,
  secondCategory,
  expenseHref,
}: CategoryExpenseSummaryCardsProps) {
  const { t } = useLocale();

  return (
    <div className="category-summary-cards">
      <Link
        to={expenseHref}
        className="glass-panel category-summary-card category-summary-card-link total hover-lift"
        aria-label={`${t('categoryExpenses.total')}: ${formattedTotalExpense}`}
      >
        <div className="category-summary-card-header">
          <div className="category-summary-card-icon danger">
            <TrendingDown size={20} aria-hidden="true" />
          </div>
          <span className="category-summary-card-title">{t('categoryExpenses.total')}</span>
        </div>
        <div className="category-summary-card-value value-danger">{formattedTotalExpense}</div>
        <ChevronRight className="category-summary-card-chevron" size={20} aria-hidden="true" />
      </Link>

      <CategoryCard
        category={topCategory}
        label={t('categoryExpenses.topCategory')}
        formatCurrency={formatCurrency}
      />
      <CategoryCard
        category={secondCategory}
        label={t('categoryExpenses.secondCategory')}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
