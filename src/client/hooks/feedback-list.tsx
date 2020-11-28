import { createContext, useCallback, useContext, useRef, useState } from 'react';

export interface FeedbackList {
  feedbacks: Feedback[];
  feed: Feed;

  // Common feeds
  progress<T>(promise: Promise<T>): Promise<T>;
  notify(severity: Severity, message: string): Promise<void>;
}

export interface Feedback {
  id: number;
  body: React.ReactElement;
}

export type Feed = <T>(
  body: (resolve: (result: T) => void, reject: (error: unknown) => void) => React.ReactElement
) => Promise<T>;

export type Severity = 'error' | 'warn' | 'info' | 'success';

const FeedbackListContext = createContext<FeedbackList>({
  feedbacks: [],
  feed: Promise.reject,

  progress: Promise.reject,
  notify: Promise.reject,
});

export function useFeedbackList(): FeedbackList {
  return useContext(FeedbackListContext);
}

export interface FeedbackListProviderProps {
  progress(): React.ReactElement;
  notify(severity: Severity, message: string, resolve: () => void): React.ReactElement;
  children?: React.ReactNode;
}

export function FeedbackListProvider({
  children,
  progress: progressBody,
  notify: notifyBody,
}: FeedbackListProviderProps): React.ReactElement {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const idRef = useRef(0);

  const feed: Feed = useCallback(body => {
    const id = ++idRef.current;

    return new Promise((resolve, reject) => {
      setFeedbacks(ls => [
        ...ls,
        {
          id,
          body: body(
            result => {
              setFeedbacks(ls => ls.filter(n => n.id != id));
              resolve(result);
            },
            error => {
              setFeedbacks(ls => ls.filter(n => n.id != id));
              reject(error);
            }
          ),
        },
      ]);
    });
  }, []);

  const progress = useCallback(
    <T extends unknown>(promise: Promise<T>) => {
      return feed<T>((resolve, reject) => {
        promise.then(resolve).catch(reject);
        return progressBody();
      });
    },
    [feed, progressBody]
  );

  const notify = useCallback(
    (severity: Severity, message: string) => {
      return feed<void>(resolve => notifyBody(severity, message, () => resolve()));
    },
    [feed, notifyBody]
  );

  return (
    <FeedbackListContext.Provider value={{ feedbacks, feed, progress, notify }}>
      {children}
    </FeedbackListContext.Provider>
  );
}
