import { Palette } from '../../hooks/template-editor/palette';
import { Select } from '../../hooks/template-editor/select';
import CheckOption from '../CheckOption';

export interface Props {
  select: Select;
  palette: Palette;
  className?: string;
}

export default function SelectOptions({
  select: { mode, setMode, rectMode, setRectMode },
  palette,
  className,
}: Props): React.ReactElement {
  function rectModeClassName(selected: boolean): string {
    return `button w-16 h-16 flex flex-col justify-center items-center space-y-1 rounded-sm border border-transparent hover:border-blue-300 ${
      selected ? 'bg-blue-100' : ''
    }`;
  }

  return (
    <div className={`flex flex-col items-strech space-y-1 ${className || ''}`}>
      <div className="flex justify-center space-x-1">
        <button
          className={rectModeClassName(rectMode == 'rectangle')}
          onClick={() => setRectMode('rectangle')}
        >
          <div className="w-5 h-5 border-2 border-bluegray-500" />
          <div className="text-xs">Rectangle</div>
        </button>
        <button
          className={rectModeClassName(rectMode == 'ellipse')}
          onClick={() => setRectMode('ellipse')}
        >
          <div className="w-5 h-5 border-2 border-bluegray-500 rounded-full" />
          <div className="text-xs">Ellipse</div>
        </button>
      </div>

      <CheckOption label="Move" checked={mode == 'move'} onClick={() => setMode('move')} />
      <CheckOption
        label="Fill with the surrounding color"
        checked={mode == 'surrounding-color'}
        onClick={() => setMode('surrounding-color')}
      />
      <div className="flex items-center space-x-2">
        <CheckOption
          label="Fill with the selected color"
          checked={mode == 'selected-color'}
          onClick={() => setMode('selected-color')}
          className="flex-grow"
        />
        <div
          style={{ backgroundColor: palette.selectedColor }}
          className="w-6 h-6 border-2 border-gray-200"
        />
      </div>
    </div>
  );
}
