import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from '../hooks/account';
import { useFeedbackList } from '../hooks/feedback-list';
import { useDeleteUser } from '../hooks/users';
import Icon24 from './Icon24';
import ConfirmDeleteAccount from './ConfirmDeleteAccount';

export interface Props {}

export default function TemplateCreationFlow({}: Props): React.ReactElement {
  const { push } = useRouter();
  const { feed, notify, progress } = useFeedbackList();
  const { user, signOut } = useAccount();
  const deleteUser = useDeleteUser();

  const deleteUserAccount = useCallback(async () => {
    if (!user) return;
    const sure = await feed(resolve => <ConfirmDeleteAccount resolve={resolve} />);
    if (!sure) return;

    try {
      await progress(deleteUser(user.id));
    } catch (e) {
      notify('error', `Failed to delete user: ${e instanceof Error ? e.message : e}`);
      return;
    }

    notify('success', 'Your user account was successfully deleted.');
    await signOut();
  }, [feed, notify, progress, user, signOut, deleteUser]);

  useEffect(() => {
    if (!user) push('/');
  }, [push, user]);

  if (!user) return <div />;

  return (
    <div className="max-w-2xl mx-auto my-12 p-4 rounded-md bg-white shadow-md">
      <div className="label m-4 border-b-2 border-bluegray-300 space-x-2">
        <Icon24 name="user-circle" className="w-6 h-6" />
        <div>User settings</div>
      </div>
      <div className="p-4 flex justify-center">
        <button className="button primary-button not" onClick={deleteUserAccount}>
          <Icon24 name="trash" className="w-6 h-6" />
          Delete user account
        </button>
      </div>
    </div>
  );
}
