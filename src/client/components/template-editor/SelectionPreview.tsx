import { Rect, RectMode } from '../../rect';

export interface Props {
  scale: number;
  color: string;
  mode: RectMode;
  rect: Rect;
}

export default function SelectionPreview({ scale, color, mode, rect }: Props): React.ReactElement {
  return (
    <div
      className="absolute"
      style={{
        border: `${1.5 / scale}px solid ${color}`,
        borderRadius: mode == 'rectangle' ? '0' : `${rect.w}px / ${rect.h}px`,
        width: `${rect.w}px`,
        height: `${rect.h}px`,
        top: `${rect.y}px`,
        left: `${rect.x}px`,
        boxShadow: '0 0 1px #ffffff',
      }}
    />
  );
}
