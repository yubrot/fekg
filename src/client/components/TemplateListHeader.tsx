import Link from 'next/link';
import Icon24, { IconName } from './Icon24';

export interface Props {
  name: string;
  icon: IconName;
  href: string;
  newHref?: string;
}

export default function TemplateListHeader({
  name,
  icon,
  href,
  newHref,
}: Props): React.ReactElement {
  return (
    <div className="flex justify-between items-center">
      <Link href={href}>
        <a className="label space-x-1 transition hover:text-blue-500">
          <Icon24 name={icon} className="w-6 h-6" />
          <div>{name}</div>
        </a>
      </Link>
      {newHref && (
        <Link href={newHref}>
          <button className="button primary-button text-base mx-4">
            <Icon24 name="plus-circle" className="w-6 h-6" />
            <div>Create new</div>
          </button>
        </Link>
      )}
    </div>
  );
}
