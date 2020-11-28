export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function isInRect(x: number, y: number, rect: Rect): boolean {
  return rect.x <= x && x <= rect.x + rect.w && rect.y <= y && y <= rect.y + rect.h;
}

export function overlapsRect(a: Rect, b: Rect): boolean {
  return a.x <= b.x + b.w && a.y <= b.y + b.h && b.x <= a.x + a.w && b.y <= a.y + a.h;
}

export interface DragArea {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

export function dragAreaRect({ sx, sy, ex, ey }: DragArea): Rect {
  const x = Math.min(sx, ex);
  const y = Math.min(sy, ey);
  const w = Math.abs(ex - sx);
  const h = Math.abs(ey - sy);
  return { x, y, w, h };
}

export type RectMode = 'rectangle' | 'ellipse';

export function rectPoints(mode: RectMode, rect: Rect): [number, number][] {
  const result: [number, number][] = [];

  if (mode == 'rectangle') {
    const sx = rect.x;
    const sy = rect.y;
    const ex = rect.x + rect.w;
    const ey = rect.y + rect.h;
    for (const [x0, y0, x1, y1] of [
      [sx, sy, ex, sy],
      [ex, sy, ex, ey],
      [ex, ey, sx, ey],
      [sx, ey, sx, sy],
    ]) {
      for (let i = 0; i < 8; ++i) {
        const r = i / 8;
        result.push([x0 * r + x1 * (1 - r), y0 * r + y1 * (1 - r)]);
      }
    }
  } else {
    const x = rect.x + rect.w / 2;
    const y = rect.y + rect.h / 2;
    const xr = rect.w / 2;
    const yr = rect.h / 2;

    for (let i = 0; i < 36; ++i) {
      const r = (i / 36) * Math.PI * 2;
      result.push([x + Math.cos(r) * xr, y + Math.sin(r) * yr]);
    }
  }

  return result;
}

export function fillByRect(
  ctx: CanvasRenderingContext2D,
  mode: RectMode,
  { x, y, w, h }: Rect
): void {
  if (mode == 'rectangle') {
    ctx.fillRect(x, y, w, h);
  } else {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function getRectImageData(
  ctx: CanvasRenderingContext2D,
  mode: RectMode,
  { x, y, w, h }: Rect
): ImageData | null {
  if (w == 0 || h == 0) return null;
  const imageData = ctx.getImageData(x, y, w, h);
  if (mode == 'ellipse') {
    for (let y = 0; y < h; ++y) {
      const r = Math.asin(1 - (2 * (y + 0.5)) / h);
      const s = ((1 - Math.cos(r)) * w) / 2 - 0.5;
      for (let x = 0; x < s; ++x) {
        imageData.data[y * w * 4 + x * 4 + 3] = 0;
        imageData.data[y * w * 4 + (w - 1 - x) * 4 + 3] = 0;
      }
    }
  }
  return imageData;
}
