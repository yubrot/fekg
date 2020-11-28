import { Children } from 'react';
import Icon24 from './Icon24';

export interface Props {
  currentPage: number;
  setCurrentPage?(page: number): void;
  showPrev?: boolean;
  showNext?: boolean;
  className?: string;
  childClassName?: string;
  children?: React.ReactNode;
}

export default function Pager({
  currentPage,
  setCurrentPage,
  showPrev,
  showNext,
  className,
  childClassName,
  children,
}: Props): React.ReactElement {
  const count = Children.count(children);
  currentPage = currentPage < 0 ? 0 : count <= currentPage ? count - 1 : currentPage;
  return (
    <div className={`relative w-full overflow-hidden ${className ?? ''}`}>
      <div
        className="top-0 left-0 ease-in-out flex items-stretch"
        style={{
          width: `${count}00%`,
          transition: 'margin-left 0.3s',
          marginLeft: `-${currentPage}00%`,
        }}
      >
        {Children.map(children, child => (
          <div className={`w-full ${childClassName ?? ''}`}>{child}</div>
        ))}
      </div>
      {setCurrentPage && showPrev && currentPage != 0 && (
        <button
          className="button absolute top-0 h-full w-20 flex justify-start items-center text-bluegray-400 opacity-50 hover:opacity-100 hover:text-blue-300"
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <Icon24 name="chevron-left" className="w-12 h-12" />
        </button>
      )}
      {setCurrentPage && showNext && currentPage != count - 1 && (
        <button
          className="button absolute top-0 right-0 h-full w-20 flex justify-end items-center text-bluegray-400 opacity-50 hover:opacity-100 hover:text-blue-300"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <Icon24 name="chevron-right" className="w-12 h-12" />
        </button>
      )}
    </div>
  );
}
