import { useState } from 'react';
import { Canvas } from '../canvas';
import { Palette } from './palette';
import { Tool } from './tool';
import { rgbToHex } from '../../canvas-util';

export interface Dropper extends Tool<'dropper'> {
  previewColor: string;
}

export interface DropperOptions {
  canvas: Canvas;
  palette: Palette;
}

export function useDropper({ canvas, palette }: DropperOptions): Dropper {
  const name = 'dropper';
  const [previewColor, setPreviewColor] = useState<string>('#ffffff');

  return {
    name,
    previewColor,

    onDrag(x, y, state) {
      if (x < 0 || canvas.width <= x || y < 0 || canvas.height <= y) return;
      if (state == 'up') palette.addColor(previewColor);
    },
    onMove(x, y) {
      if (!canvas.ctx) return;
      if (x < 0 || canvas.width <= x || y < 0 || canvas.height <= y) return;
      const p = canvas.ctx.getImageData(x, y, 1, 1).data;
      const color = '#' + rgbToHex(p[0], p[1], p[2]);
      setPreviewColor(color);
    },
  };
}
