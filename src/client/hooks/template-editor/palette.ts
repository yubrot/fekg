import { useState, useCallback } from 'react';

export interface Palette {
  colors: string[];
  selectColor(color: string): void;
  selectedColor: string;
  addColor(color: string): void;
}

const defaultColors = '0123456789abcdef'.split('').map(c => `#${c}${c}${c}`);

const maxColors = 18;

export function usePalette(initialColors: () => string[]): Palette {
  const [colors, setColors] = useState<string[]>(() => {
    const set = new Set<string>();
    return [...initialColors(), ...defaultColors]
      .filter(color => !set.has(color) && set.add(color))
      .slice(0, maxColors);
  });
  const [selectedColor, selectColor] = useState<string>(colors[0]);

  const addColor = useCallback((color: string) => {
    selectColor(color);
    setColors(colors => [color, ...colors.filter(c => c != color).slice(0, maxColors)]);
  }, []);

  return { colors, selectColor, selectedColor, addColor };
}

export const dummyColor = '#ff00ff';
