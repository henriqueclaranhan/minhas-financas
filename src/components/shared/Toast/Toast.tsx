import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import type { ToastItem } from '../../../store/ToastContext';
import { useLocale } from '../../../store/LocaleContext';
import './Toast.css';

interface ToastViewportProps {
  toast?: ToastItem;
  onDismiss: (id: number) => void;
}

export function ToastViewport({ toast, onDismiss }: ToastViewportProps) {
  const { t } = useLocale();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsPaused(false);
  }, [toast?.id]);

  useEffect(() => {
    if (!toast || isPaused) return;
    const timeout = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timeout);
  }, [isPaused, onDismiss, toast]);

  if (!toast) return null;
  const isError = toast.type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return createPortal(
    <div className="toast-viewport" aria-atomic="true">
      <div
        className={`toast toast-${toast.type}`}
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        <span className="toast-rail" aria-hidden="true" />
        <Icon className="toast-icon" size={20} aria-hidden="true" />
        <span className="toast-message">{toast.message}</span>
        <button
          type="button"
          className="toast-close"
          onClick={() => onDismiss(toast.id)}
          aria-label={t('notifications.dismiss')}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
