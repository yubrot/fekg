import { useState, useCallback } from 'react';

type InitialData = HTMLImageElement | ImageData | { width: number; height: number };

export interface Canvas {
  ctx: CanvasRenderingContext2D | null;
  width: number;
  height: number;
  ref(node: HTMLCanvasElement | null): void;
  initialize(initialData: InitialData): void;
}

export function useCanvas(): Canvas {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [[width, height], setSize] = useState<[number, number]>([0, 0]);

  const ref = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (ctx || !node) return;
      setCtx(node.getContext('2d'));
    },
    [ctx]
  );

  const initialize = useCallback(
    (initialData: InitialData) => {
      if (!ctx) return;
      ctx.canvas.width = initialData.width;
      ctx.canvas.height = initialData.height;
      setSize([initialData.width, initialData.height]);
      if (initialData instanceof HTMLImageElement) {
        ctx.clearRect(0, 0, initialData.width, initialData.height);
        ctx.drawImage(initialData, 0, 0);
      } else if ('data' in initialData) {
        ctx.putImageData(initialData, 0, 0);
      }
    },
    [ctx]
  );

  return { ctx, width, height, ref, initialize };
}
