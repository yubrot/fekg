import { useRef, useEffect, useState } from 'react';
import { Query, useQuery, Mutation, useMutation } from './infrastructure/graphql-api';
import { useStorage } from './infrastructure/firebase';
import { useRequestOptions } from './request-options';
import type { TemplateId, Template, TemplateBrief, TemplateChange, BaseImageId } from '../template';

export function useTemplate(id: TemplateId | null): Query<Template> {
  return useQuery(
    () => (id && ['/template', id]) || null,
    async (sdk, _, id) => (await sdk.template({ id })).template,
    useRequestOptions()
  );
}

export function useMyTemplates(first: number, after?: TemplateId): Query<TemplateBrief[]> {
  return useQuery(
    ['/my', first, after],
    async (sdk, _, first, after) => (await sdk.myTemplates({ first, after })).templates,
    useRequestOptions()
  );
}

export function usePublishedTemplates(first: number, after?: TemplateId): Query<TemplateBrief[]> {
  return useQuery(
    ['/published', first, after],
    async (sdk, _, first, after) => (await sdk.publishedTemplates({ first, after })).templates,
    useRequestOptions()
  );
}

export function useCreateTemplate(): Mutation<[name: string, image: Blob], TemplateId> {
  return useMutation(
    async (sdk, name, image) => (await sdk.createTemplate({ name, image })).id,
    useRequestOptions()
  );
}

export function useDeleteTemplate(): Mutation<[id: TemplateId], boolean> {
  return useMutation(
    async (sdk, id) => (await sdk.deleteTemplate({ id })).succeed,
    useRequestOptions()
  );
}

export function useUpdateTemplate(): Mutation<[id: TemplateId, change: TemplateChange], boolean> {
  return useMutation(
    async (sdk, id, change) => (await sdk.updateTemplate({ id, input: change })).succeed,
    useRequestOptions()
  );
}

export interface BaseImage {
  url: string | null;
  error: unknown | null;
}

export function useBaseImage(id: BaseImageId | null): BaseImage {
  const isMounted = useRef(false);
  const storage = useStorage();
  const [state, setState] = useState<BaseImage>({ url: null, error: null });

  useEffect(() => {
    if (!storage || !id) {
      setState({ url: null, error: null });
      return;
    }

    isMounted.current = true;

    (async () => {
      try {
        const url = await storage.ref(id).getDownloadURL();
        isMounted.current && setState({ url, error: null });
      } catch (error) {
        isMounted.current && setState({ url: null, error });
      }
    })();

    return () => {
      isMounted.current = false;
      // NOTE: getDownloadURL does not have cancellation method
    };
  }, [id, storage]);

  return state;
}
