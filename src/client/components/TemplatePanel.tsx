import Link from 'next/link';
import Icon24 from './Icon24';
import Image from './Image';

export interface Props {
  id: string;
  name: string;
  baseImage: string;
  className?: string;
}

export default function TemplatePanel({
  id,
  name,
  baseImage,
  className,
}: Props): React.ReactElement {
  return (
    <Link href={`/templates/${id}`}>
      <button className={`button w-full h-full relative group shadow-md ${className ?? ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-bluegray-100 to-bluegray-500 flex justify-center items-center">
          <Image
            baseImage={baseImage}
            className="w-full h-full object-contain"
            loadingClassName="w-16 h-16 text-white"
          />
        </div>
        <div className="absolute top-0 inset-x-0 text-left transition text-white text-sm font-bold pt-2 px-4 pb-1 flex bg-opacity-75 bg-bluegray-600 group-hover:bg-opacity-75 group-hover:bg-blue-600">
          <div className="flex-grow truncate pr-2">{name}</div>
          <Icon24 name="star" className="hidden flex-none w-5 h-5 text-yellow-400" />
        </div>
      </button>
    </Link>
  );
}
