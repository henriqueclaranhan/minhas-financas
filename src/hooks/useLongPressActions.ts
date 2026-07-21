import { useEffect, useRef, useState } from 'react';

export function useLongPressActions<T extends { id?: string }>(delay = 500) {
  const [actionItem, setActionItem] = useState<T | null>(null);
  const [pressingId, setPressingId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPressingId(null);
  };

  const startPress = (item: T) => {
    if (!item.id) return;
    setPressingId(item.id);
    timerRef.current = setTimeout(() => {
      navigator.vibrate?.(50);
      setActionItem(item);
      setPressingId(null);
      timerRef.current = null;
    }, delay);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { actionItem, setActionItem, pressingId, startPress, endPress };
}
