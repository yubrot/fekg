import { useCallback } from 'react';
import { Palette } from '../../hooks/template-editor/palette';
import { Pen } from '../../hooks/template-editor/pen';
import CheckOption from '../CheckOption';
import Slider from '../Slider';

export interface Props {
  pen: Pen;
  palette: Palette;
  className?: string;
}

export default function PenOptions({
  pen: { radius, setRadius, mode, setMode, resetPreviewPosition },
  palette,
  className,
}: Props): React.ReactElement {
  const setRadiusAndResetPreviewPosition = useCallback(
    (v: number) => {
      setRadius(v);
      resetPreviewPosition();
    },
    [setRadius, resetPreviewPosition]
  );

  return (
    <div className={`flex flex-col items-strech space-y-1 ${className || ''}`}>
      <div className="flex items-strech space-x-2 text-sm mb-4">
        <div>Size</div>
        <Slider
          value={radius}
          range={[1, 50, 1]}
          onChange={setRadiusAndResetPreviewPosition}
          className="flex-grow px-2"
        />
        <div className="w-6 text-center">{radius}</div>
      </div>

      <CheckOption
        label="Paint with the surrounding color"
        checked={mode == 'surrounding-color'}
        onClick={() => setMode('surrounding-color')}
      />
      <div className="flex items-center space-x-2">
        <CheckOption
          label="Paint with the selected color"
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
