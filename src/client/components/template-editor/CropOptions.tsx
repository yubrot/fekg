import { Crop } from '../../hooks/template-editor/crop';

export interface Props {
  crop: Crop;
  className?: string;
}

export default function CropOptions({ className }: Props): React.ReactElement {
  return <div className={`text-sm ${className || ''}`}>Crop the image by drag &amp; drop</div>;
}
