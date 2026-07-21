import { useEffect, useRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useLocale } from '../../store/LocaleContext';

interface LazyLoadSentinelProps {
  hasMore: boolean;
  isLoading: boolean;
  hasError: boolean;
  onLoadMore: () => void;
}

export function LazyLoadSentinel({ hasMore, isLoading, hasError, onLoadMore }: LazyLoadSentinelProps) {
  const { t } = useLocale();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading || hasError || !sentinelRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) onLoadMore();
    }, { rootMargin: '240px 0px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasError, hasMore, isLoading, onLoadMore]);

  if (!hasMore && !isLoading) return null;

  return (
    <div ref={sentinelRef} className="lazy-load-sentinel" aria-live="polite">
      {isLoading ? (
        <span><LoaderCircle className="lazy-load-spinner" size={18} aria-hidden="true" />{t('common.loadingMore')}</span>
      ) : hasError ? (
        <button type="button" className="btn" onClick={onLoadMore}>{t('common.retryLoad')}</button>
      ) : (
        <span className="sr-only">{t('common.loadMoreOnScroll')}</span>
      )}
    </div>
  );
}
