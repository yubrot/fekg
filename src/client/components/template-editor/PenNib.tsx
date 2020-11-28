export interface Props {
  scale: number;
  radius: number;
  color: string;
  position: [number, number];
}

export default function PenNib({
  scale,
  radius,
  color,
  position: [x, y],
}: Props): React.ReactElement {
  return (
    <div
      className="absolute rounded-full"
      style={{
        border: `${1.5 / scale}px solid ${color}`,
        width: `${2 * radius}px`,
        height: `${2 * radius}px`,
        top: `${y - radius}px`,
        left: `${x - radius}px`,
        boxShadow: '0 0 1px #ffffff',
      }}
    />
  );
}
