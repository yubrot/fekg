import { createContext, useCallback, useContext } from 'react';
import firebase from 'firebase/app';
import { useAuth, useAuthState } from './infrastructure/firebase';
import type { User } from '../user';

export interface Account {
  user: User | null | undefined;
  error: string | undefined;
  getUserToken(forceRefresh?: boolean): Promise<string | null>;
  signIn(signInMethod: SignInMethod): Promise<User | null>;
  signOut(): Promise<void>;
}

export type SignInMethod = 'signInWithGoogle';

const AccountContext = createContext<Account>({
  user: undefined,
  error: undefined,
  async getUserToken() {
    return null;
  },
  async signIn() {
    return null;
  },
  async signOut() {
    return;
  },
});

export function useAccount(): Account {
  return useContext(AccountContext);
}

export interface AccountProviderProps {
  children?: React.ReactNode;
}

export function AccountProvider({ children }: AccountProviderProps): React.ReactElement {
  const auth = useAuth();
  const { user: authUser, error: authError, clear: clearAuthState } = useAuthState();
  const error = authError?.message;

  const getUserToken = useCallback(
    async (forceRefresh?: boolean) => {
      if (!auth) return null;
      const user = await new Promise<firebase.User | null>((resolve, reject) =>
        auth.onAuthStateChanged(resolve, reject)
      );
      if (!user) return null;
      return await user.getIdToken(forceRefresh);
    },
    [auth]
  );

  const signIn = useCallback(
    async (signInMethod: SignInMethod) => {
      const userCredential =
        signInMethod == 'signInWithGoogle'
          ? await auth?.signInWithPopup(new firebase.auth.GoogleAuthProvider())
          : unreachable(signInMethod, undefined);
      return userCredential?.user ? toUser(userCredential.user) : null;
    },
    [auth]
  );

  const signOut = useCallback(async () => {
    try {
      await auth?.signOut();
    } catch (e) {
      console.warn('signOut failed: ', e);
    }
    clearAuthState();
  }, [auth, clearAuthState]);

  const user = authUser ? toUser(authUser) : null;

  return (
    <AccountContext.Provider value={{ user, error, getUserToken, signIn, signOut }}>
      {children}
    </AccountContext.Provider>
  );
}

function toUser(user: firebase.User): User {
  return {
    id: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    creationDate: new Date(user.metadata.creationTime ?? Date.now()),
  };
}
function unreachable<T>(_: never, fallback: T): T {
  return fallback;
}
