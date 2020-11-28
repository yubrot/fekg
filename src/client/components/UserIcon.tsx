import Icon24 from './Icon24';

export interface Props {
  imageUrl?: string | null;
  className?: string;
}

export default function UserIcon({ imageUrl, className }: Props): React.ReactElement {
  return (
    <div className={className}>
      {imageUrl ? <img src={imageUrl} className="rounded-full" /> : <Icon24 name="user-circle" />}
    </div>
  );
}
