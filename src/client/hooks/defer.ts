import { useCallback, useRef, useEffect, DependencyList } from 'react';

export function useDefer(): (action: () => void, delay: number) => () => void {
  const timeout = useRef(0);

  return useCallback((action: () => void, delay: number) => {
    clearTimeout(timeout.current);
    timeout.current = window.setTimeout(action, delay);
    return () => clearTimeout(timeout.current);
  }, []);
}

export function useDeferredEffect(action: () => void, deps: DependencyList, delay: number): void {
  const defer = useDefer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => defer(action, delay), [defer, delay, ...deps]);
}
