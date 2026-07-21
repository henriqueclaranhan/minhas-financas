import { useLocale } from '../../store/LocaleContext';
import './FinanceContentSkeleton.css';

type SkeletonVariant = 'dashboard' | 'list' | 'report' | 'details';

interface FinanceContentSkeletonProps {
  variant: SkeletonVariant;
}

function Block({ className = '' }: { className?: string }) {
  return <span className={`finance-skeleton-block ${className}`} aria-hidden="true" />;
}

function SummarySkeleton() {
  return (
    <div className="finance-skeleton-summary" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="glass-panel finance-skeleton-card" key={index}>
          <Block className="finance-skeleton-label" />
          <Block className="finance-skeleton-value" />
        </div>
      ))}
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className="glass-panel panel-no-padding finance-skeleton-rows" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="finance-skeleton-row" key={index}>
          <Block className="finance-skeleton-row-icon" />
          <div className="finance-skeleton-row-copy">
            <Block className="finance-skeleton-row-title" />
            <Block className="finance-skeleton-row-meta" />
          </div>
          <Block className="finance-skeleton-row-amount" />
        </div>
      ))}
    </div>
  );
}

export function FinanceContentSkeleton({ variant }: FinanceContentSkeletonProps) {
  const { t } = useLocale();

  return (
    <div className={`finance-skeleton finance-skeleton-${variant}`} role="status" aria-label={t('common.loadingContent')}>
      {variant !== 'details' && <SummarySkeleton />}
      {(variant === 'dashboard' || variant === 'report') && (
        <div className="glass-panel finance-skeleton-chart" aria-hidden="true">
          <Block className="finance-skeleton-chart-title" />
          <Block className="finance-skeleton-chart-area" />
        </div>
      )}
      {variant === 'dashboard' && (
        <div className="finance-skeleton-dashboard-grid" aria-hidden="true">
          <div className="glass-panel finance-skeleton-side-panel"><Block className="finance-skeleton-fill" /></div>
          <div className="glass-panel finance-skeleton-side-panel"><Block className="finance-skeleton-fill" /></div>
        </div>
      )}
      {variant === 'list' && <RowsSkeleton />}
      {variant === 'details' && (
        <>
          <div className="glass-panel finance-skeleton-reconciliation" aria-hidden="true">
            <Block className="finance-skeleton-label" />
            <Block className="finance-skeleton-value" />
            <Block className="finance-skeleton-chart-area" />
          </div>
          <RowsSkeleton />
        </>
      )}
      <span className="sr-only">{t('common.loadingContent')}</span>
    </div>
  );
}
