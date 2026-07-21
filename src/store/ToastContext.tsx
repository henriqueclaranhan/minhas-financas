import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ToastViewport } from '../components/shared/Toast';

export type ToastType = 'success' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextData {
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextData | null>(null);
const SUCCESS_DURATION = 3_000;
const ERROR_DURATION = 6_000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const enqueue = useCallback((message: string, type: ToastType, duration: number) => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return;
    setQueue(current => [
      ...current,
      { id: ++nextId.current, message: normalizedMessage, type, duration },
    ]);
  }, []);

  const success = useCallback((message: string) => enqueue(message, 'success', SUCCESS_DURATION), [enqueue]);
  const error = useCallback((message: string) => enqueue(message, 'error', ERROR_DURATION), [enqueue]);
  const dismiss = useCallback((id: number) => {
    setQueue(current => current.filter(item => item.id !== id));
  }, []);

  const value = useMemo(() => ({ success, error, dismiss }), [dismiss, error, success]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toast={queue[0]} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// Kept with the provider to preserve the stable context module consumed by the application and tests.
// oxlint-disable-next-line react/only-export-components
export function useToast(): ToastContextData {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
