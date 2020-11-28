import { useState } from 'react';
import { Palette } from './palette';
import { Tool } from './tool';
import { Label, createLabel, getLabelRect } from '../../template';
import { isInRect } from '../../rect';

export interface Text extends Tool<'text'> {
  currentLabel: number | null;
  setCurrentLabel(index: number | null): void;
}

export interface TextOptions {
  labels: Label[];
  changeLabels(labels: Label[]): void;
  palette: Palette;
}

export function useText({ labels, changeLabels, palette }: TextOptions): Text {
  const name = 'text';
  const [currentLabel, setCurrentLabel] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);

  return {
    name,
    currentLabel,
    setCurrentLabel,
    cursor,

    onMove(x, y) {
      const isOnLabel = labels.some(l => isInRect(x, y, getLabelRect(l)));
      setCursor(isOnLabel ? 'move' : null);
    },
    onDrag(x, y, state) {
      switch (state) {
        case 'down': {
          const targetLabels = labels
            .map((l, i) => [l, i] as const)
            .filter(([l]) => isInRect(x, y, getLabelRect(l)));

          if (targetLabels.length == 0) {
            changeLabels([
              ...labels,
              createLabel(labels[labels.length - 1], palette.selectedColor, x, y),
            ]);
            setCurrentLabel(labels.length);
            break;
          }

          const [, i] = targetLabels.find(([, i]) => i == currentLabel) || targetLabels[0];
          setCurrentLabel(i);
          setDragPosition({ x, y });
          break;
        }
        case 'move': {
          if (currentLabel == null || !labels[currentLabel] || !dragPosition) break;
          const label = labels[currentLabel];
          const movedLabel = {
            ...label,
            x: label.x + x - dragPosition.x,
            y: label.y + y - dragPosition.y,
          };
          changeLabels(labels.map((l, i) => (i == currentLabel ? movedLabel : l)));
          setDragPosition({ x, y });
          break;
        }
        case 'up': {
          setDragPosition(null);
          break;
        }
      }
    },
  };
}
