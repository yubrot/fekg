import { useCallback, useState } from 'react';

export interface Pager<Cursor> {
  pages: Page<Cursor>[];
  tailState: TailState<Cursor>;
  tailIsEmpty: boolean;
  loadMore(): void;
  reset(): void;
}

export interface Page<Cursor> {
  cursor: Cursor | null;
  onLoad(nextCursor: Cursor | null, empty: boolean): void;
}

export type TailState<Cursor> =
  | { type: 'init' }
  | { type: 'loading'; page: number }
  | { type: 'loaded'; nextCursor: Cursor | null; empty: boolean };

export function usePager<Cursor>(): Pager<Cursor> {
  const [pages, setPages] = useState<Page<Cursor>[]>([]);
  const [tailState, setTailState] = useState<TailState<Cursor>>({ type: 'init' });

  const onLoadCallback = useCallback(
    (page: number) => (nextCursor: Cursor | null, empty: boolean) =>
      setTailState(tailState =>
        tailState.type == 'loading' && tailState.page == page
          ? { type: 'loaded', nextCursor, empty }
          : tailState
      ),
    []
  );

  const loadMore = useCallback(() => {
    let cursor: Cursor | null = null;

    switch (tailState.type) {
      case 'loaded':
        // End of the source
        if (tailState.nextCursor === null) return;

        cursor = tailState.nextCursor;
      // eslint-disable-next-line no-fallthrough
      case 'init': {
        const currentPage = pages.length;
        setTailState({ type: 'loading', page: currentPage });
        setPages([...pages, { cursor, onLoad: onLoadCallback(currentPage) }]);
        break;
      }
    }
  }, [onLoadCallback, pages, tailState]);

  const reset = useCallback(() => {
    setPages([]);
    setTailState({ type: 'init' });
  }, []);

  const tailIsEmpty = tailState.type == 'loaded' && tailState.empty;

  return { pages, tailState, tailIsEmpty, loadMore, reset };
}
