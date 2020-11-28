import { Label, labelFont, labelCharacters, verticalLabelStyle } from '../../template';

export interface Props {
  scale: number;
  isSelected: boolean;
  showBorder: boolean;
  label: Label;
}

export default function LabelPreview({
  scale,
  isSelected,
  showBorder,
  label,
}: Props): React.ReactElement {
  const lines = labelCharacters(label.text);
  const [border, borderOffset] = showBorder
    ? [`${1 / scale}px solid ${isSelected ? '#8bf' : '#777'}`, '0']
    : [undefined, `${1 / scale}px`];

  return (
    <div style={{ position: 'absolute', width: 0, top: `${label.y}px`, left: `${label.x}px` }}>
      <div
        style={{
          position: 'absolute',
          top: borderOffset,
          left: label.vertical ? undefined : borderOffset,
          right: label.vertical ? borderOffset : undefined,
          border,
          display: 'flex',
          flexDirection: label.vertical ? 'row-reverse' : 'column',
          minWidth: '10px',
          minHeight: '10px',
          whiteSpace: 'pre',
          letterSpacing: '0',
          lineHeight: '1',
          color: label.color,
          fontSize: `${label.size}px`,
          fontFamily: labelFont,
          fontWeight: label.bold ? 'bold' : 'normal',
        }}
      >
        {lines.map((line, i) => (
          <div key={i} className={`flex items-center ${label.vertical ? 'flex-col' : ''}`}>
            {line.map((c, j) => (
              <div key={j} style={label.vertical ? verticalLabelStyle(c).style : undefined}>
                {c}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
