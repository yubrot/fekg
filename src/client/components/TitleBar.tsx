import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAccount } from '../hooks/account';
import { useLoadingState } from '../hooks/loading-state';
import { useTransition, transitionClasses } from '../hooks/transition';
import Icon24 from './Icon24';
import SearchWindow from './SearchWindow';
import UserIcon from './UserIcon';
import LoadingSpinner from './LoadingSpinner';

export interface Props {}

export default function TitleBar({}: Props): React.ReactElement {
  const { push } = useRouter();
  const { user, signIn, signOut } = useAccount();
  const isLoading = useLoadingState();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTransition = useTransition(showDropdown);

  const accountMenu = useMemo<{ text: string; onClick(): void }[]>(
    () =>
      user === undefined
        ? []
        : user
        ? [
            { text: 'User settings', onClick: () => push('/user') },
            { text: 'Sign-out', onClick: signOut },
          ]
        : [{ text: 'Sign-in with Google', onClick: () => signIn('signInWithGoogle') }],
    [user, signOut, push, signIn]
  );

  return (
    <div className="relative z-30 bg-gradient-to-r from-bluegray-800 to-bluegray-700 text-bluegray-200 shadow-md">
      <header className="cc relative flex justify-between items-center space-x-2 px-8 py-2">
        <h1 className="flex-grow flex items-center space-x-2">
          <Link href="/">
            <a className="transition hover:text-white">
              <Icon24 name="fekg" className="w-8 h-8" />
            </a>
          </Link>
          <div className="w-6 h-6">{isLoading ? <LoadingSpinner /> : null}</div>
        </h1>

        <SearchWindow
          placeholder="Search templates..."
          className="hidden text-lg flex-grow"
          onSubmit={text => push(`/search?t=${text}`)}
        />

        <div className="relative flex-grow">
          <div className="flex justify-end">
            <button
              className={`button hover:text-white flex items-center space-x-2 ${
                showDropdown ? 'overlay' : ''
              }`}
              onClick={() => setShowDropdown(value => !value)}
            >
              <UserIcon imageUrl={user?.photoURL} className="w-10 h-10" />
              <Icon24 name="chevron-down" className="w-5 h-5" />
            </button>
          </div>

          <div
            className={`absolute z-20 right-0 mt-4 w-56 rounded-md border border-bluegray-300 shadow-md bg-white text-bluegray-700 py-2 flex flex-col items-strech ${transitionClasses[dropdownTransition]}`}
          >
            {accountMenu.map(({ text, onClick }) => (
              <button
                key={text}
                className="button text-sm text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  onClick();
                  setShowDropdown(false);
                }}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}
