import { useLocale } from '../../store/LocaleContext';
import './FinanceContentSkeleton.css';

type SkeletonVariant = 'dashboard' | 'transactions' | 'planned' | 'credit' | 'forecast' | 'categories' | 'expenseBreakdown';

interface FinanceContentSkeletonProps {
  variant: SkeletonVariant;
}

function Block({ className = '' }: { className?: string }) {
  return <span className={`finance-skeleton-block ${className}`} aria-hidden="true" />;
}

function Controls({ pills = 3, panel = true }: { pills?: number; panel?: boolean }) {
  return (
    <div className={`${panel ? 'glass-panel' : 'finance-skeleton-controls-bare'} finance-skeleton-controls`} aria-hidden="true">
      {Array.from({ length: pills }, (_, index) => <Block className="finance-skeleton-pill" key={index} />)}
    </div>
  );
}

function Period() {
  return (
    <div className="finance-skeleton-period" aria-hidden="true">
      <div><Block className="finance-skeleton-caption" /><Block className="finance-skeleton-period-value" /></div>
      <Block className="finance-skeleton-button" />
    </div>
  );
}

function Summary({ count }: { count: number }) {
  return (
    <div className={`finance-skeleton-summary finance-skeleton-summary-${count}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="glass-panel finance-skeleton-card" key={index}>
          <div className="finance-skeleton-card-heading"><Block className="finance-skeleton-icon" /><Block className="finance-skeleton-label" /></div>
          <Block className="finance-skeleton-value" />
        </div>
      ))}
    </div>
  );
}

function Chart({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`glass-panel finance-skeleton-chart ${compact ? 'is-compact' : ''}`} aria-hidden="true">
      <Block className="finance-skeleton-chart-title" />
      <div className="finance-skeleton-chart-plot">
        {Array.from({ length: 7 }, (_, index) => <Block className="finance-skeleton-chart-bar" key={index} />)}
      </div>
    </div>
  );
}

function Rows({ count = 6, panel = true }: { count?: number; panel?: boolean }) {
  const rows = (
    <>{Array.from({ length: count }, (_, index) => (
      <div className="finance-skeleton-row" key={index}>
        <Block className="finance-skeleton-row-icon" />
        <div className="finance-skeleton-row-copy"><Block className="finance-skeleton-row-title" /><Block className="finance-skeleton-row-meta" /></div>
        <Block className="finance-skeleton-row-amount" />
      </div>
    ))}</>
  );
  return panel ? <div className="glass-panel panel-no-padding finance-skeleton-rows" aria-hidden="true">{rows}</div> : rows;
}

function ListPage() {
  return <><Controls panel={false} /><Period /><Summary count={2} /><Controls pills={2} /><Rows /></>;
}

function Content({ variant }: { variant: SkeletonVariant }) {
  if (variant === 'dashboard') return <><Summary count={4} /><Chart /><div className="finance-skeleton-two-column"><Chart compact /><div className="glass-panel"><Rows count={3} panel={false} /></div></div></>;
  if (variant === 'transactions' || variant === 'planned') return <ListPage />;
  if (variant === 'credit') return <><Period /><Chart compact /><div className="glass-panel panel-no-padding finance-skeleton-invoice"><div className="finance-skeleton-invoice-header"><Block className="finance-skeleton-label" /><Block className="finance-skeleton-value" /></div><Rows count={4} panel={false} /></div></>;
  if (variant === 'forecast') return <><Period /><Summary count={2} /><Controls pills={2} /><Chart /></>;
  if (variant === 'categories') return <><Period /><Summary count={3} /><div className="finance-skeleton-category-grid"><Chart /><div className="glass-panel"><Block className="finance-skeleton-chart-title" /><Rows count={5} panel={false} /></div></div></>;
  return <><Period /><div className="glass-panel finance-skeleton-reconciliation"><Block className="finance-skeleton-label" /><Block className="finance-skeleton-value" /><div className="finance-skeleton-equation"><Block /><Block /><Block /></div><Block className="finance-skeleton-rail" /></div><div className="finance-skeleton-ledgers"><div className="glass-panel"><Block className="finance-skeleton-chart-title" /><Rows count={3} panel={false} /></div><div className="glass-panel"><Block className="finance-skeleton-chart-title" /><Rows count={3} panel={false} /></div></div></>;
}

export function FinanceContentSkeleton({ variant }: FinanceContentSkeletonProps) {
  const { t } = useLocale();
  return <div className={`finance-skeleton finance-skeleton-${variant}`} role="status" aria-label={t('common.loadingContent')}><Content variant={variant} /><span className="sr-only">{t('common.loadingContent')}</span></div>;
}
