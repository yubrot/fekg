import { useRef, useEffect, useState } from 'react';

export interface Image {
  el: HTMLImageElement | null;
  error: unknown | null;
}

export function useImage(url: string | null, crossOrigin?: string): Image {
  const isMounted = useRef(false);
  const [state, setState] = useState<Image>({ el: null, error: null });

  useEffect(() => {
    if (!url) {
      setState({ el: null, error: null });
      return;
    }

    isMounted.current = true;

    const img = new Image();
    img.onload = () => isMounted.current && setState({ el: img, error: null });
    img.onerror = (e, s, l, c, error) => isMounted.current && setState({ el: null, error });
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.src = url;

    return () => {
      isMounted.current = false;
      img.src = '';
    };
  }, [url, crossOrigin]);

  return state;
}
