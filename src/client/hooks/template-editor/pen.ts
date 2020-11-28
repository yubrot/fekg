import { useCallback, useRef, useState } from 'react';
import { Canvas } from '../canvas';
import { dummyColor, Palette } from './palette';
import { Tool } from './tool';
import { getApproximateSurroundingColor } from '../../canvas-util';

export interface Pen extends Tool<'pen'> {
  radius: number;
  setRadius(size: number): void;
  mode: Mode;
  setMode(mode: Mode): void;
  previewColor: string;
  previewPosition: [number, number] | null;
  resetPreviewPosition(): void;
}

export type Mode = 'selected-color' | 'surrounding-color';

export interface PenOptions {
  canvas: Canvas;
  stageCanvasChange(): Promise<void>;
  commitChanges(): void;
  palette: Palette;
}

export function usePen({ canvas, stageCanvasChange, commitChanges, palette }: PenOptions): Pen {
  const name = 'pen';
  const [radius, setRadius] = useState(10);
  const [mode, setMode] = useState<Mode>('surrounding-color');
  const [previewPosition, setPreviewPosition] = useState<[number, number] | null>(null);

  const resetPreviewPosition = useCallback(() => setPreviewPosition(null), []);

  const previewColor = mode == 'selected-color' ? palette.selectedColor : dummyColor;

  const strokePoints = useRef<[number, number][]>([]).current;

  return {
    name,
    radius,
    setRadius,
    mode,
    setMode,
    previewColor,
    previewPosition,
    resetPreviewPosition,
    cursor: 'none',

    async onDrag(x, y, state) {
      if (state == 'down') strokePoints.splice(0);
      if (!canvas.ctx) return;

      canvas.ctx.lineCap = 'round';
      canvas.ctx.lineJoin = 'round';
      canvas.ctx.lineWidth = mode == 'selected-color' ? radius * 2 : radius * 2 - 1.5;
      canvas.ctx.strokeStyle = mode == 'selected-color' ? palette.selectedColor : dummyColor;
      canvas.ctx.beginPath();
      canvas.ctx.moveTo(...(strokePoints.slice(-1)[0] || [x, y]));
      canvas.ctx.lineTo(x, y);
      canvas.ctx.stroke();
      strokePoints.push([x, y]);

      if (state == 'up') {
        if (mode == 'surrounding-color') {
          canvas.ctx.lineWidth = radius * 2;
          canvas.ctx.strokeStyle = getApproximateSurroundingColor(canvas.ctx, strokePoints, radius);
          canvas.ctx.beginPath();
          canvas.ctx.moveTo(...strokePoints[0]);
          for (const p of strokePoints.slice(1)) canvas.ctx.lineTo(...p);
          canvas.ctx.stroke();
        }
        await stageCanvasChange();
        commitChanges();
      }
    },
    onMove(x, y) {
      setPreviewPosition([x, y]);
    },
    onWheel(deltaY) {
      setRadius(r => (deltaY < 0 ? Math.min(r + 1, 50) : Math.max(r - 1, 1)));
    },
  };
}
