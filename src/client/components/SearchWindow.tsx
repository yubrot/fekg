import { useState } from 'react';
import Icon24 from './Icon24';

export type IconAlign = 'left' | 'right';

export interface Props {
  placeholder?: string;
  initialValue?: string;
  iconAlign?: IconAlign;
  onSubmit?(value: string): void;
  className?: string;
}

export default function SearchWindow({
  placeholder,
  initialValue,
  iconAlign,
  onSubmit,
  className,
}: Props): React.ReactElement {
  const alignClass = iconAlign == 'left' ? 'flex-row-reverse space-x-reverse' : 'flex-row';
  const [value, setValue] = useState<string>(initialValue ?? '');

  return (
    <form
      className={`flex items-center outlined space-x-2 bg-white ${alignClass} ${className ?? ''}`}
      onSubmit={ev => {
        ev.preventDefault();
        if (onSubmit && value) onSubmit(value);
      }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={ev => setValue(ev.target.value)}
        className="flex-1 text-field"
      />
      <button className={`button flex-grow-0 ${value ? 'text-blue-500' : 'text-bluegray-500'}`}>
        <Icon24 name="search" className="w-6 h-6" />
      </button>
    </form>
  );
}
