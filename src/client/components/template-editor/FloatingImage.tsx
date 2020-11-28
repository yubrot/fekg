import { FloatingImageRect } from '../../hooks/template-editor/select';
import { RectMode } from '../../rect';
import Image from '../Image';

export interface Props {
  scale: number;
  mode: RectMode;
  rect: FloatingImageRect;
}

export default function FloatingImage({ scale, mode, rect }: Props): React.ReactElement {
  const { blob, x, y, w, h } = rect;
  return (
    <div
      className="absolute flex justify-center items-center"
      style={{
        boxSizing: 'content-box',
        border: `${2 / scale}px dashed #aaaaaa`,
        borderRadius: mode == 'rectangle' ? '0' : `${w}px / ${h}px`,
        width: `${w}px`,
        height: `${h}px`,
        top: `${y - 2 / scale}px`,
        left: `${x - 2 / scale}px`,
      }}
    >
      <Image blob={blob} className="w-full h-full" />
    </div>
  );
}
