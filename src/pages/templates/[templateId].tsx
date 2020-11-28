import { useRouter } from 'next/router';
import TemplateEditor from '../../client/components/TemplateEditor';

export default function Template(): React.ReactElement {
  const router = useRouter();
  const { templateId } = router.query;

  if (Array.isArray(templateId) || !templateId) return <div />;

  return <TemplateEditor templateId={templateId} />;
}
