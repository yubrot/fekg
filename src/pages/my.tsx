import { useAccount } from '../client/hooks/account';
import { useMyTemplates } from '../client/hooks/templates';
import MultiLineTemplateList from '../client/components/MultiLineTemplateList';

export default function My(): React.ReactElement {
  const account = useAccount();

  if (account.user === undefined) return <div />;

  if (account.user === null) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-md bg-white shadow-md">
        To create and manage templates, please sign-in.
      </div>
    );
  }

  return (
    <MultiLineTemplateList
      name="My templates"
      icon="home"
      href="/my"
      newHref="/new"
      source={useMyTemplates}
    />
  );
}
