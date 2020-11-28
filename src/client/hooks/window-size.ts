import { useEffect, useState } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export function computeWindowSize(): WindowSize {
  if (typeof window == 'undefined') return { width: 1024, height: 768 };
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(computeWindowSize());

  useEffect(() => {
    const update = () => setSize(computeWindowSize());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}
