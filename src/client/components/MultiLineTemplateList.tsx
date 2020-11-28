import { useEffect } from 'react';
import { usePager } from '../hooks/pager';
import TemplateListHeader, { Props as HeaderProps } from './TemplateListHeader';
import TemplateListChunk, { Props as ChunkProps } from './TemplateListChunk';

export type Props = Pick<ChunkProps, 'source'> & HeaderProps;

export default function MultiLineTemplateList({
  source,
  ...headerProps
}: Props): React.ReactElement {
  const { pages, loadMore } = usePager<string>();

  useEffect(() => {
    const check = () =>
      document.body.scrollHeight - window.innerHeight * 1.5 < window.scrollY && loadMore();

    check();
    window.addEventListener('scroll', check);
    return () => window.removeEventListener('scroll', check);
  }, [pages, loadMore]);

  return (
    <div className="cc my-8 px-4">
      <TemplateListHeader {...headerProps} />

      <div className="my-2 flex flex-wrap">
        {pages.map((page, i) => (
          <TemplateListChunk
            key={i}
            source={source}
            start={30}
            after={page.cursor || undefined}
            onLoad={page.onLoad}
            itemClassName="flex-none p-2 w-1/2 md:w-1/3 lg:w-1/4 2xl:w-1/5 h-64"
          />
        ))}
      </div>
    </div>
  );
}
