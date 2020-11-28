import { useAccount } from '../client/hooks/account';
import { useMyTemplates, usePublishedTemplates } from '../client/hooks/templates';
import Logo from '../client/components/Logo';
import SingleLineTemplateList from '../client/components/SingleLineTemplateList';

export default function Index(): React.ReactElement {
  const { user } = useAccount();

  if (user === undefined) return <div />;

  return (
    <>
      {user ? (
        <SingleLineTemplateList
          name="My templates"
          icon="home"
          href="/my"
          newHref="/new"
          source={useMyTemplates}
        />
      ) : (
        <Logo />
      )}
      <SingleLineTemplateList
        name="Published templates"
        icon="sparkles"
        href="/published"
        source={usePublishedTemplates}
      />
    </>
  );
}
