import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useQueryParamState<T>(
  name: string,
  fallback: T,
  parse: (value: string | null) => T | undefined,
  serialize: (value: T) => string | null = String,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = parse(searchParams.get(name)) ?? fallback;

  const setValue = useCallback((nextValue: T) => {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      const serialized = serialize(nextValue);
      if (serialized === null || nextValue === fallback) next.delete(name);
      else next.set(name, serialized);
      return next;
    }, { replace: true });
  }, [fallback, name, serialize, setSearchParams]);

  return [value, setValue] as const;
}
