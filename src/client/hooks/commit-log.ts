import { useCallback, useState } from 'react';

export interface CommitLog<T> {
  current: T;
  afterCommit: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  goBack(): void;
  goForward(): void;
  commit(value: T | ((current: T) => T)): void;
}

export function useCommitLog<T>(initialValue: T | (() => T), limit: number): CommitLog<T> {
  const [{ history, head, afterCommit }, setCommits] = useState(() => ({
    history: [invokeOrReturn(initialValue)],
    head: 0,
    afterCommit: true,
  }));

  const current = history[head];
  const hasPrev = head != 0;
  const hasNext = head != history.length - 1;

  const goBack = useCallback(() => {
    setCommits(({ history, head }) => ({
      history,
      head: Math.max(head - 1, 0),
      afterCommit: false,
    }));
  }, []);

  const goForward = useCallback(() => {
    setCommits(({ history, head }) => ({
      history,
      head: Math.min(head + 1, history.length - 1),
      afterCommit: false,
    }));
  }, []);

  const commit = useCallback(
    (value: T | ((current: T) => T)) => {
      setCommits(({ history, head }) => ({
        history: [
          ...history.slice(Math.max(0, head + 2 - limit), head + 1),
          invokeOrReturn(value, history[head]),
        ],
        head: Math.min(head + 1, limit - 1),
        afterCommit: true,
      }));
    },
    [limit]
  );

  return { current, afterCommit, hasPrev, hasNext, goBack, goForward, commit };
}

function invokeOrReturn<T, Args extends readonly unknown[] = []>(
  a: T | ((...args: Args) => T),
  ...args: Args
): T {
  // FIXME: Can this type check?
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return typeof a == 'function' ? a(...args) : a;
}
