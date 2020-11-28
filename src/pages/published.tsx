import { usePublishedTemplates } from '../client/hooks/templates';
import MultiLineTemplateList from '../client/components/MultiLineTemplateList';

export default function Published(): React.ReactElement {
  return (
    <MultiLineTemplateList
      name="Published templates"
      icon="sparkles"
      href="/latest"
      source={usePublishedTemplates}
    />
  );
}
