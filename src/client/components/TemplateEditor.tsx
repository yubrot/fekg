import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useImage } from '../hooks/image';
import { useFeedbackList } from '../hooks/feedback-list';
import {
  useBaseImage,
  useDeleteTemplate,
  useTemplate,
  useUpdateTemplate,
} from '../hooks/templates';
import type { TemplateId, TemplateChange } from '../template';
import LoadingSpinner from './LoadingSpinner';
import EditorWindow from './template-editor/EditorWindow';

export interface Props {
  templateId: TemplateId;
}

export default function TemplateEditor({ templateId }: Props): React.ReactElement {
  const router = useRouter();
  const { notify, progress } = useFeedbackList();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleSave = useCallback(
    async (change: TemplateChange) => {
      try {
        await progress(updateTemplate(templateId, change));
        return true;
      } catch (e) {
        notify('error', `Failed to save template: ${e instanceof Error ? e.message : e}`);
        return false;
      }
    },
    [notify, progress, templateId, updateTemplate]
  );

  const handleDelete = useCallback(async () => {
    try {
      await progress(deleteTemplate(templateId));
      notify('success', 'This template has been successfully deleted.');
      router.back();
    } catch (e) {
      notify('error', `Failed to delete template: ${e instanceof Error ? e.message : e}`);
    }
  }, [progress, deleteTemplate, templateId, notify, router]);

  const { data: template, error } = useTemplate(templateId);
  const { url: baseImageUrl } = useBaseImage(template?.baseImage || null);
  const { el: baseImageEl } = useImage(baseImageUrl, 'anonymous');

  if (!template || !baseImageEl) {
    if (error) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 rounded-md bg-white text-red-500 shadow-md">
          Failed to get template: {error}
        </div>
      );
    }

    return (
      <div className="mx-auto my-12 w-20 h-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <EditorWindow
      creator={template.creator}
      initialName={template.name}
      initialImage={baseImageEl}
      initialAccessibility={template.accessibility}
      initialLabels={template.labels || []}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
