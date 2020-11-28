import { useCallback, useState } from 'react';
import { Canvas } from '../canvas';
import { usePrecondition } from '../functional';
import { dummyColor, Palette } from './palette';
import { Tool } from './tool';
import {
  Rect,
  isInRect,
  DragArea,
  dragAreaRect,
  RectMode,
  rectPoints,
  fillByRect,
  getRectImageData,
} from '../../rect';
import { getApproximateSurroundingColor, getBlob, getImage } from '../../canvas-util';

export interface Select extends Tool<'select'> {
  mode: Mode;
  setMode(mode: Mode): void;
  rectMode: RectMode;
  setRectMode(mode: RectMode): void;

  selectingColor: string;
  selectingRect: Rect | null;
  floatingImageRect: FloatingImageRect | null;
}

export type Mode = 'move' | 'surrounding-color' | 'selected-color';

export interface SelectOptions {
  canvas: Canvas;
  stageCanvasChange(): Promise<void>;
  commitChanges(): void;
  palette: Palette;
}

export interface FloatingImageRect extends Rect {
  blob: Blob;
}

export function useSelect({
  canvas,
  stageCanvasChange,
  commitChanges,
  palette,
}: SelectOptions): Select {
  const name = 'select';
  const [mode, setMode] = useState<Mode>('move');
  const [rectMode, setRectMode] = useState<RectMode>('rectangle');

  const [selectingDragArea, setSelectingDragArea] = useState<DragArea | null>(null);
  const [floatingImageRect, setFloatingImageRect] = useState<FloatingImageRect | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);

  const canvasCtx = canvas.ctx;
  const commitFloatingImageRect = useCallback(async () => {
    if (!floatingImageRect || !canvasCtx) return;
    const image = await getImage(floatingImageRect.blob);
    canvasCtx.drawImage(image, floatingImageRect.x, floatingImageRect.y);
    await stageCanvasChange();
    commitChanges();
    setFloatingImageRect(null);
  }, [floatingImageRect, canvasCtx, stageCanvasChange, commitChanges]);

  const selectingColor =
    mode == 'move' ? '#999999' : mode == 'selected-color' ? palette.selectedColor : dummyColor;

  return {
    name,
    mode,
    setMode: usePrecondition(setMode, commitFloatingImageRect),
    rectMode,
    setRectMode: usePrecondition(setRectMode, commitFloatingImageRect),
    selectingColor,
    selectingRect: selectingDragArea && dragAreaRect(selectingDragArea),
    floatingImageRect,
    cursor,

    onMove(x, y) {
      setCursor(floatingImageRect && isInRect(x, y, floatingImageRect) ? 'move' : null);
    },
    async onDrag(x, y, state) {
      if (floatingImageRect) {
        switch (state) {
          case 'down': {
            if (!isInRect(x, y, floatingImageRect)) {
              commitFloatingImageRect();
              break;
            }
            setDragPosition({ x, y });
            return;
          }
          case 'move': {
            if (!dragPosition) return;
            const movedFloatingImageRect = {
              ...floatingImageRect,
              x: floatingImageRect.x + x - dragPosition.x,
              y: floatingImageRect.y + y - dragPosition.y,
            };
            setFloatingImageRect(movedFloatingImageRect);
            setDragPosition({ x, y });
            return;
          }
          case 'up': {
            setDragPosition(null);
            return;
          }
        }
      }

      switch (state) {
        case 'down': {
          setSelectingDragArea({ sx: x, sy: y, ex: x, ey: y });
          break;
        }
        case 'move': {
          if (!selectingDragArea) break;
          setSelectingDragArea({ ...selectingDragArea, ex: x, ey: y });
          break;
        }
        case 'up': {
          if (!selectingDragArea) break;
          setSelectingDragArea(null);

          if (!canvas.ctx) return;
          const rect = dragAreaRect(selectingDragArea);

          if (mode == 'move') {
            const imageData = getRectImageData(canvas.ctx, rectMode, rect);
            if (!imageData) return;
            const blob = await getBlob(imageData);
            setFloatingImageRect({ blob, ...rect });
          }

          canvas.ctx.fillStyle =
            mode == 'selected-color'
              ? palette.selectedColor
              : getApproximateSurroundingColor(canvas.ctx, rectPoints(rectMode, rect), 0);
          fillByRect(canvas.ctx, rectMode, rect);

          if (mode != 'move') {
            await stageCanvasChange();
            commitChanges();
          }
          break;
        }
      }
    },
    async complete() {
      await commitFloatingImageRect();
    },
  };
}
