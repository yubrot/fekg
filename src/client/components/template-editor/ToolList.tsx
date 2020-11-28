import { ToolName } from '../../hooks/template-editor/tool-box';
import Icon20, { IconName } from '../Icon20';

export interface Props {
  selected: ToolName;
  select(name: ToolName): void;
  className?: string;
  itemClassName?(selected: boolean): string;
}

export default function ToolList({
  selected,
  select,
  className,
  itemClassName,
}: Props): React.ReactElement {
  return (
    <div className={`${className || ''} flex justify-center items-strech`}>
      {toolList.map(({ name, icon, label }) => (
        <button
          key={name}
          className={
            'button w-16 h-16 flex flex-col justify-center items-center space-y-1 ' +
            (selected == name
              ? 'text-bluegray-800 bg-white '
              : 'text-bluegray-600 bg-bluegray-100 hover:bg-bluegray-200 ') +
            (itemClassName ? itemClassName(selected == name) : '')
          }
          onClick={() => select(name)}
        >
          <Icon20 name={icon} className="w-5 h-5" />
          <div className="text-xs">{label}</div>
        </button>
      ))}
    </div>
  );
}

const toolList: { name: ToolName; icon: IconName; label: string }[] = [
  { name: 'dropper', icon: 'pin', label: 'Dropper' },
  { name: 'pen', icon: 'edit-pencil', label: 'Pen' },
  { name: 'select', icon: 'copy', label: 'Select' },
  { name: 'text', icon: 'text-box', label: 'Text' },
  { name: 'crop', icon: 'crop', label: 'Crop' },
];
