import Confirm from './Confirm';

export interface Props {
  resolve(value: boolean): void;
}

export default function ConfirmDeleteAccount({ resolve }: Props): React.ReactElement {
  return (
    <Confirm
      title="DELETING USER ACCOUNT"
      acceptTitle="Delete"
      acceptIconName="trash"
      acceptClassName="text-red-600"
      declineTitle="Cancel"
      declineClassName="text-bluegray-500"
      resolve={resolve}
    >
      Are you sure you want to delete the user account? <br />
      All templates created under this user account will be deleted. <br />
      This operation cannot be undone!
    </Confirm>
  );
}
