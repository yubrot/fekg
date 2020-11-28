import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useFeedbackList } from '../hooks/feedback-list';
import { useAccount } from '../hooks/account';
import { useCreateTemplate } from '../hooks/templates';
import { useFileDrop } from '../hooks/file-drop';
import Icon24 from './Icon24';
import Pager from './Pager';
import Image from './Image';
import {
  supportedMimeTypes,
  supportedFileSize,
  getSupportedMimeTypeExtension,
} from '../../shared/image';

export interface Props {}

export default function TemplateCreationFlow({}: Props): React.ReactElement {
  const router = useRouter();
  const { notify, progress } = useFeedbackList();
  const account = useAccount();
  const createTemplate = useCreateTemplate();

  const [currentPage, setCurrentPage] = useState(0);
  const [baseImageFile, setBaseImageFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');

  const setImageAndContinueToInputName = useCallback(
    (file: File) => {
      if (!getSupportedMimeTypeExtension(file.type)) {
        notify('warn', `Unsupported file type. Accepted types are ${supportedMimeTypes}.`);
        setCurrentPage(0);
        return;
      }

      if (supportedFileSize < file.size) {
        notify(
          'warn',
          `File size is too large, no more than ${supportedFileSize / 1000 / 1000}MB is allowed.`
        );
        setCurrentPage(0);
        return;
      }

      setBaseImageFile(file);
      setCurrentPage(1);
    },
    [notify]
  );

  const continueToCreateTemplate = useCallback(
    async ev => {
      ev.preventDefault();
      if (!baseImageFile || !templateName) return;

      try {
        const id = await progress(createTemplate(templateName, baseImageFile));
        notify('success', 'A new template has been successfully created.');
        router.push(`/templates/${id}`);
      } catch (e) {
        notify('error', `Failed to upload image: ${e instanceof Error ? e.message : e}`);
        setCurrentPage(0);
      }
    },
    [baseImageFile, createTemplate, notify, progress, router, templateName]
  );

  const fileDrop = useFileDrop(
    useCallback(
      files => {
        if (!files) return;
        setImageAndContinueToInputName(files[0]);
      },
      [setImageAndContinueToInputName]
    )
  );

  return (
    <div className="max-w-2xl mx-auto my-12 p-4 rounded-md bg-white shadow-md">
      <div className="label m-4 border-b-2 border-bluegray-300 space-x-2">
        <Icon24 name="plus-circle" className="w-6 h-6" />
        <div>Create a new template</div>
      </div>
      {account.user === null && (
        <div className="py-4 px-8">To create a template, please sign-in.</div>
      )}

      {account.user && (
        <Pager
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          showNext={baseImageFile != null && currentPage == 0}
          showPrev={currentPage == 1}
        >
          <div
            ref={fileDrop.ref}
            className={`py-4 px-8 flex flex-col items-center space-y-8 rounded-md ${
              fileDrop.isDropping ? 'bg-bluegray-300' : ''
            }`}
          >
            <div className="w-full">
              Uploaded templates are private by default, but{' '}
              <strong className="font-bold">templates are always accessible from the URL.</strong>
            </div>

            <label className="button primary-button">
              <Icon24 name="upload" className="w-5 h-5" />
              <span>Select a local image</span>
              <input
                type="file"
                accept={supportedMimeTypes}
                className="hidden"
                onChange={ev => {
                  if (!ev.target.files) return;
                  setImageAndContinueToInputName(ev.target.files[0]);
                }}
              />
            </label>
          </div>

          <div className="py-4 px-8 space-y-8">
            <form className="flex justify-center space-x-2" onSubmit={continueToCreateTemplate}>
              <input
                type="text"
                placeholder="Template name"
                value={templateName}
                onChange={ev => setTemplateName(ev.target.value)}
                className="text-field outlined w-64"
              />
              <button className="button primary-button" disabled={!templateName}>
                Create
              </button>
            </form>

            {currentPage == 1 && (
              <div className="mx-auto max-w-lg border-4 border-bluegray-300 bg-gradient-to-br from-bluegray-100 to-bluegray-500 flex justify-center items-center">
                <Image
                  blob={baseImageFile}
                  className="object-scale-down"
                  loadingClassName="w-16 h-16 my-8 text-white"
                />
              </div>
            )}
          </div>
        </Pager>
      )}
    </div>
  );
}
