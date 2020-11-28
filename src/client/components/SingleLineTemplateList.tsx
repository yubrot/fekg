import { useEffect, useState } from 'react';
import { usePager } from '../hooks/pager';
import { useResponsive } from '../hooks/responsive';
import TemplateListHeader, { Props as HeaderProps } from './TemplateListHeader';
import TemplateListChunk, { Props as ChunkProps } from './TemplateListChunk';
import Pager from './Pager';

export type Props = Pick<ChunkProps, 'source'> & HeaderProps;

export default function SingleLineTemplateList({
  source,
  ...headerProps
}: Props): React.ReactElement {
  const [currentPage, setCurrentPage] = useState(0);
  const { pages, loadMore, reset, tailIsEmpty } = usePager<string>();
  const responsive = useResponsive();
  const itemsPerPage = responsive.xxl ? 5 : responsive.lg ? 4 : responsive.md ? 3 : 2;

  useEffect(
    () => () => {
      setCurrentPage(0);
      reset();
    },
    [itemsPerPage, reset]
  );

  useEffect(() => {
    pages.length <= currentPage + 1 && loadMore();
  }, [currentPage, pages, loadMore]);

  return (
    <div className="cc my-8 px-4">
      <TemplateListHeader {...headerProps} />

      <Pager
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        showPrev
        showNext={currentPage < pages.length - (tailIsEmpty ? 2 : 1)}
        childClassName="my-2 px-12 overflow-hidden flex items-stretch"
      >
        {pages.map((page, i) => (
          <TemplateListChunk
            key={i}
            source={source}
            start={itemsPerPage}
            after={page.cursor || undefined}
            onLoad={page.onLoad}
            itemClassName="flex-none p-1 w-1/2 md:w-1/3 lg:w-1/4 2xl:w-1/5 h-64"
          />
        ))}
      </Pager>
    </div>
  );
}
