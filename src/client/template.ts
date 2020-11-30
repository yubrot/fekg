import type { TemplateId, BaseImageId, Accessibility, Label } from '../shared/template';
import type { Rect } from './rect';
import type { UserId } from './user';

export type { TemplateId };

export interface Template {
  id: TemplateId;
  name: string;
  creator: UserId;
  baseImage: BaseImageId;
  accessibility: Accessibility;
  labels?: Label[] | null;
}

export type { BaseImageId, Accessibility, Label };

export type TemplateBrief = Pick<Template, 'id' | 'name' | 'baseImage'>;

export interface TemplateChange {
  name?: string;
  image?: Blob;
  accessibility?: Accessibility;
  labels?: Label[];
}

export function createLabel(base: Label | undefined, color: string, x: number, y: number): Label {
  return { size: 16, bold: false, vertical: false, ...base, text: '', color, x, y };
}

const labelRectCache = new WeakMap<Label, Rect>();

export function getLabelRect(label: Label): Rect {
  let rect = labelRectCache.get(label);
  if (rect) return rect;
  rect = measureLabelRect(label);
  labelRectCache.set(label, rect);
  return rect;
}

let measureCtx: CanvasRenderingContext2D | null = null;

function measureLabelRect(label: Label): Rect {
  if (!measureCtx) {
    const canvas = document.createElement('canvas');
    measureCtx = canvas.getContext('2d');
    if (!measureCtx) throw 'Failed to get canvas 2d context';
  }
  const ctx = measureCtx;

  ctx.font = `${label.bold ? 'bold' : 'normal'} ${label.size}px ${labelFont}`;
  const lines = labelCharacters(label.text);

  if (label.vertical) {
    const w = lines.reduce(
      (w, line) => w + line.reduce((w, c) => Math.max(w, ctx.measureText(c).width), 0),
      0
    );
    const h = label.size * lines.reduce((c, line) => Math.max(c, line.length), 0);
    return { x: label.x - w, y: label.y, w, h };
  } else {
    const w = lines.reduce((w, line) => {
      const m = ctx.measureText(line.join(''));
      return Math.max(w, m.width);
    }, 0);
    const h = label.size * lines.length;
    return { x: label.x, y: label.y, w, h };
  }
}

export function fillByLabel(ctx: CanvasRenderingContext2D, label: Label): void {
  ctx.font = `${label.bold ? 'bold' : 'normal'} ${label.size}px ${labelFont}`;
  ctx.textBaseline = 'ideographic';
  ctx.fillStyle = label.color;
  const lines = labelCharacters(label.text);
  let { x, y } = label;
  y += label.size;

  if (label.vertical) {
    for (const line of lines) {
      const chunks = line.map(c => ({ c, w: ctx.measureText(c).width }));
      const width = chunks.reduce((m, { w }) => Math.max(m, w), 0);
      x -= width;
      let ly = y;
      for (const { c, w } of chunks) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(x + width / 2, ly - label.size / 2);
        verticalLabelStyle(c).transform(ctx, label.size);
        ctx.fillText(c, -w / 2, label.size / 2);
        ly += label.size;
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  } else {
    for (const line of lines) {
      ctx.fillText(line.join(''), x, y);
      y += label.size;
    }
  }
}

export const labelFont = 'GenEiAntique';

export function labelCharacters(s: string): string[][] {
  return s.split(/\\n/).map(labelLineCharacters);
}

export function labelLineCharacters(s: string): string[] {
  return Array.from(s.matchAll(/[0-9０-９]+|[!?！？]+|./g), m => {
    let c = m[0];
    if (c.match(/[0-9０-９]+/)) {
      const offset1 = '0'.charCodeAt(0) - '０'.charCodeAt(0);
      c = c.replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) + offset1));
      if (c.length > 1) {
        const offset2 = '\u{E030}'.charCodeAt(0) - '0'.charCodeAt(0);
        c = c.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + offset2));
      }
    } else if (c.match(/[!?！？]+/)) {
      const chars = c.split('').map(d => (d == '！' ? '!' : d == '？' ? '?' : d));
      c = '';
      while (chars.length != 0) {
        if (chars[0] == '!' && chars[1] == '!' && chars[2] == '!') {
          c += '\u{E007}';
          chars.splice(0, 3);
        } else if (chars[0] == '!' && chars[1] == '?') {
          c += '\u{E005}';
          chars.splice(0, 2);
        } else if (chars[0] == '?' && chars[1] == '!') {
          c += '\u{E004}';
          chars.splice(0, 2);
        } else if (chars[0] == '?' && chars[1] == '?') {
          c += '\u{E003}';
          chars.splice(0, 2);
        } else if (chars[0] == '!' && chars[1] == '!') {
          c += '\u{E002}';
          chars.splice(0, 2);
        } else if (chars[0] == '?') {
          c += '\u{E001}';
          chars.splice(0, 1);
        } else {
          c += '\u{E000}';
          chars.splice(0, 1);
        }
      }
    }
    return c;
  });
}

export interface VerticalLabelStyle {
  style: React.CSSProperties;
  transform(ctx: CanvasRenderingContext2D, em: number): void;
}

export function verticalLabelStyle(c: string): VerticalLabelStyle {
  if (c.match(/[、。]/)) {
    return {
      style: { transform: 'translate(0.5em, -0.5em)' },
      transform: (ctx, em) => ctx.translate(0.5 * em, -0.5 * em),
    };
  } else if (c.match(/[ぁぃぅぇぉっゃゅょゎヶヵ]/)) {
    return {
      style: { transform: 'translate(0.1em, -0.1em)' },
      transform: (ctx, em) => ctx.translate(0.1 * em, -0.1 * em),
    };
  } else if (c.match(/[（）｛｝「」『』…(){}[\]【】―]/)) {
    return {
      style: { transform: 'rotateZ(90deg)' },
      transform: ctx => ctx.rotate(Math.PI / 2),
    };
  } else if (c.match(/[ー～]/)) {
    return {
      style: { transform: 'scaleX(-1) rotateZ(90deg)' },
      transform(ctx) {
        ctx.scale(-1, 1);
        ctx.rotate(Math.PI / 2);
      },
    };
  }

  return {
    style: {},
    transform() {},
  };
}
