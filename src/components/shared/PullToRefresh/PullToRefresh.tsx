import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { RefreshCw } from 'lucide-react';
import { useLocale } from '../../../store/LocaleContext';
import './PullToRefresh.css';

const REFRESH_THRESHOLD = 72;
const MAX_PULL_DISTANCE = 104;
const reloadPage = () => window.location.reload();

function isStandalonePwa() {
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)').matches || iosNavigator.standalone === true;
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"], .modal-overlay, .mobile-drawer.open'));
}

interface PullToRefreshProps {
  onRefresh?: () => void;
}

export function PullToRefresh({ onRefresh = reloadPage }: PullToRefreshProps) {
  const { t } = useLocale();
  const [distance, setDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const currentDistance = useRef(0);
  const refreshTimer = useRef<number | null>(null);
  const refreshing = useRef(false);

  useEffect(() => {
    if (!isStandalonePwa()) return;

    const reset = () => {
      startPoint.current = null;
      currentDistance.current = 0;
      setDistance(0);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (refreshing.current || window.scrollY > 0 || isInteractiveTarget(event.target) || event.touches.length !== 1) return;
      const touch = event.touches[0];
      startPoint.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const start = startPoint.current;
      if (!start || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (deltaY <= 0 || Math.abs(deltaX) > deltaY) {
        reset();
        return;
      }
      if (window.scrollY > 0) {
        reset();
        return;
      }

      event.preventDefault();
      const resistedDistance = Math.min(MAX_PULL_DISTANCE, deltaY * 0.55);
      currentDistance.current = resistedDistance;
      setDistance(resistedDistance);
    };

    const handleTouchEnd = () => {
      if (!startPoint.current) return;
      const shouldRefresh = currentDistance.current >= REFRESH_THRESHOLD;
      startPoint.current = null;
      currentDistance.current = 0;
      if (!shouldRefresh) {
        setDistance(0);
        return;
      }

      setDistance(REFRESH_THRESHOLD);
      setIsRefreshing(true);
      refreshing.current = true;
      refreshTimer.current = window.setTimeout(onRefresh, 180);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', reset, { passive: true });
    return () => {
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', reset);
    };
  }, [onRefresh]);

  if (!distance && !isRefreshing) return null;
  const isReady = distance >= REFRESH_THRESHOLD;
  const label = isRefreshing ? t('pullToRefresh.refreshing') : isReady ? t('pullToRefresh.release') : t('pullToRefresh.pull');

  return (
    <div
      className={`pull-to-refresh ${isRefreshing ? 'is-refreshing' : ''}`}
      style={{ '--pull-distance': `${distance}px`, '--pull-progress': Math.min(1, distance / 36) } as CSSProperties}
      role="status"
      aria-live="polite"
    >
      <RefreshCw size={20} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
