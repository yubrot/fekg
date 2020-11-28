import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/analytics';

export type Firebase = firebase.app.App | undefined;

const FirebaseContext = createContext<Firebase>(undefined);

export function useFirebase(): Firebase {
  return useContext(FirebaseContext);
}

export interface FirebaseProviderProps {
  children?: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps): React.ReactElement {
  const [app] = useState<Firebase>(() => {
    if (typeof window == 'undefined') return undefined;

    const config = process.env.NEXT_PUBLIC_FIREBASE_SDK_CONFIG;
    if (!config) return undefined;

    const app = firebase.initializeApp(JSON.parse(config));
    app.analytics();

    return app;
  });

  return <FirebaseContext.Provider value={app}>{children}</FirebaseContext.Provider>;
}

export type Auth = firebase.auth.Auth | undefined;

export function useAuth(): Auth {
  return useFirebase()?.auth();
}

export interface AuthState {
  user: firebase.User | null | undefined;
  error: firebase.auth.Error | undefined;
  clear(): void;
}

export function useAuthState(): AuthState {
  const auth = useAuth();
  const [user, setUser] = useState<AuthState['user']>(undefined);
  const [error, setError] = useState<AuthState['error']>(undefined);

  useEffect(() => {
    if (auth) {
      return auth.onAuthStateChanged(setUser, setError);
    } else {
      setUser(null);
    }
  }, [auth]);

  const clear = useCallback(() => {
    setUser(null);
    setError(undefined);
  }, []);

  return { user, error, clear };
}

export type Storage = firebase.storage.Storage | undefined;

export function useStorage(): Storage {
  return useFirebase()?.storage();
}
