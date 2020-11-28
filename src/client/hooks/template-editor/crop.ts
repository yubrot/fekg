import { useState } from 'react';
import { Canvas } from '../canvas';
import { Tool } from './tool';
import { Label, getLabelRect } from '../../template';
import { Rect, overlapsRect, DragArea, dragAreaRect } from '../../rect';

export interface Crop extends Tool<'crop'> {
  croppingRect: Rect | null;
}

export interface CropOptions {
  labels: Label[];
  changeLabels(labels: Label[]): void;
  canvas: Canvas;
  stageCanvasChange(): Promise<void>;
  commitChanges(): void;
}

export function useCrop({
  labels,
  changeLabels,
  canvas,
  stageCanvasChange,
  commitChanges,
}: CropOptions): Crop {
  const name = 'crop';
  const [dragArea, setDragArea] = useState<DragArea | null>(null);

  return {
    name,
    croppingRect: dragArea && dragAreaRect(dragArea),
    async onDrag(x, y, state) {
      x = Math.min(Math.max(0, x), canvas.width - 1);
      y = Math.min(Math.max(0, y), canvas.height - 1);
      switch (state) {
        case 'down': {
          setDragArea({ sx: x, sy: y, ex: x, ey: y });
          break;
        }
        case 'move': {
          setDragArea(dragArea && { ...dragArea, ex: x, ey: y });
          break;
        }
        case 'up': {
          if (!dragArea) return;
          setDragArea(null);
          if (!canvas.ctx) return;
          const { x, y, w, h } = dragAreaRect(dragArea);
          if (w == 0 || h == 0) return;

          changeLabels(
            labels
              .map(l => ({ ...l, x: l.x - x, y: l.y - y }))
              .filter(l => overlapsRect(getLabelRect(l), { x: 0, y: 0, w, h }))
          );
          const imageData = canvas.ctx.getImageData(x, y, w, h);
          canvas.initialize(imageData);
          await stageCanvasChange();
          commitChanges();
          break;
        }
      }
    },
  };
}
