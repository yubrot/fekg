import { useEffect, useRef, useState } from 'react';
import { Label } from '../../template';
import { useTransition, transitionClasses } from '../../hooks/transition';
import { Text } from '../../hooks/template-editor/text';
import { Palette } from '../../hooks/template-editor/palette';
import Slider from '../Slider';
import Icon20 from '../Icon20';
import ColorPalette from './ColorPalette';

export interface Props {
  labels: Label[];
  setLabels(labels: Label[]): void;
  text: Text;
  palette: Palette;
  className?: string;
}

export default function TextOptions({
  labels,
  setLabels,
  text,
  palette,
  className,
}: Props): React.ReactElement {
  return (
    <div className={`relative z-10 space-y-3 ${className || ''}`}>
      {labels.length == 0 && <div className="text-sm px-3">Click the image to add label</div>}
      {labels.map((label, index) => (
        <LabelOptions
          key={index}
          isSelected={text.currentLabel == index}
          label={label}
          palette={palette}
          onSelect={() => text.setCurrentLabel(index)}
          onUpdate={newLabel => setLabels(labels.map((l, i) => (i == index ? newLabel : l)))}
          onDelete={() => setLabels(labels.filter((_, i) => i != index))}
        />
      ))}
    </div>
  );
}

export interface LabelOptionsProps {
  isSelected: boolean;
  label: Label;
  palette: Palette;
  onSelect(): void;
  onUpdate(label: Label): void;
  onDelete(): void;
}

export function LabelOptions({
  isSelected,
  label,
  palette,
  onSelect,
  onUpdate,
  onDelete,
}: LabelOptionsProps): React.ReactElement {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTransition = useTransition(showDropdown);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isSelected && inputRef.current?.focus();
  }, [isSelected]);

  return (
    <div
      className={`relative flex flex-col py-4 px-3 border-l-4 ${
        isSelected ? 'border-blue-300' : 'border-bluegray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex space-x-2 items-center">
        <input
          ref={inputRef}
          type="text"
          value={label.text}
          onChange={ev => onUpdate({ ...label, text: ev.target.value })}
          className="flex-grow bg-transparent border-b border-bluegray-300 text-bluegray-600 text-sm focus:outline-none"
        />
        <button className="button w-5 h-5 text-bluegray-400 hover:text-red-400" onClick={onDelete}>
          <Icon20 name="x" />
        </button>
      </div>

      <div className="mt-4 flex space-x-2 items-center text-xs">
        <div>Size</div>
        <Slider
          value={label.size}
          range={[10, 100, 1]}
          onChange={size => onUpdate({ ...label, size })}
          className="flex-grow py-2 px-1"
        />
        <div className="w-6">{label.size}</div>
        <button
          className={`button w-6 h-6 border-2 border-gray-200 ${showDropdown ? 'overlay' : ''}`}
          style={{ backgroundColor: label.color }}
          onClick={() => setShowDropdown(value => !value)}
        />

        <button
          className={`button py-1 px-2 rounded-sm border border-transparent hover:border-blue-300 ${
            label.bold ? 'bg-blue-100' : ''
          }`}
          onClick={() => onUpdate({ ...label, bold: !label.bold })}
        >
          Bold
        </button>
        <button
          className={`button py-1 px-2 rounded-sm border border-transparent hover:border-blue-300 ${
            label.vertical ? 'bg-blue-100' : ''
          }`}
          onClick={() => onUpdate({ ...label, vertical: !label.vertical })}
        >
          Vertical
        </button>
      </div>

      <div
        className={`absolute z-20 inset-x-0 bottom-0 -mx-2 rounded-md shadow-lg border border-bluegray-300 bg-bluegray-100 p-2 ${transitionClasses[dropdownTransition]}`}
      >
        <ColorPalette
          colors={palette.colors}
          selectedColor={label.color}
          selectColor={color => {
            onUpdate({ ...label, color });
            setShowDropdown(false);
          }}
        />
      </div>
    </div>
  );
}
