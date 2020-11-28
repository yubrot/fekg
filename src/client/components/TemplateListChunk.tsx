import { useDeferredEffect } from '../hooks/defer';
import TemplatePanel from './TemplatePanel';
import LoadingSpinner from './LoadingSpinner';
import type { TemplateId, BaseImageId } from '../template';

export interface Props {
  source: PropsSource;
  start: number;
  after?: TemplateId;
  onLoad?(nextCursor: TemplateId | null, empty: boolean): void;
  itemClassName?: string;
}

export type PropsSource = (
  first: number,
  after?: TemplateId
) => {
  data?: PropsTemplate[];
  error?: unknown;
  isValidating: boolean;
};

export interface PropsTemplate {
  id: TemplateId;
  name: string;
  baseImage: BaseImageId;
}

export default function TemplateListChunk({
  source,
  start,
  after,
  onLoad,
  itemClassName,
}: Props): React.ReactElement {
  const { data, isValidating } = source(start, after);
  useDeferredEffect(
    () => {
      if (!onLoad || isValidating || !data) return;
      onLoad(data.length == start ? data[data.length - 1].id : null, data.length == 0);
    },
    [data, isValidating, onLoad, start],
    300
  );

  return data ? (
    <>
      {data.map(template => (
        <div key={template.id} className={itemClassName}>
          <TemplatePanel {...template} />
        </div>
      ))}
    </>
  ) : (
    <LoadingSpinner className="mx-auto self-center w-16 h-16 text-bluegray-500" />
  );
}
