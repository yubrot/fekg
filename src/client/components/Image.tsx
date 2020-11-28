import { useEffect, useState } from 'react';
import { useBaseImage } from '../hooks/templates';
import type { BaseImageId } from '../template';
import LoadingSpinner from './LoadingSpinner';

export interface Props {
  src?: string | null;
  baseImage?: BaseImageId | null;
  blob?: Blob | null;
  loadingClassName?: string;
  className?: string;
}

export default function Image({
  src,
  baseImage,
  blob,
  loadingClassName,
  className,
}: Props): React.ReactElement {
  const { url: baseImageUrl } = useBaseImage(baseImage || null);
  const [blobUrl, setBlobUrl] = useState<string | null | undefined>(null);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBlobUrl(null);
    }
  }, [blob]);

  const url = src || baseImageUrl || blobUrl;

  return url ? (
    <img
      src={url}
      className={className}
      onLoad={() => url == blobUrl && URL.revokeObjectURL(url)}
    />
  ) : (
    <LoadingSpinner className={loadingClassName} />
  );
}
