import { useCallback } from 'react';

export function usePrecondition<Args extends readonly unknown[], Ret>(
  f: (...args: Args) => Ret,
  precondition?: () => Promise<void>
): (...args: Args) => Promise<Ret> {
  return useCallback(
    async (...args) => {
      await precondition?.();
      return f(...args);
    },
    [f, precondition]
  );
}
