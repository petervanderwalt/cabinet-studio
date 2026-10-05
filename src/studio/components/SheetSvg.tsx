import type { Panel, Rect, Sheet, SheetPlacement, NestingPlan } from '../../types';
import { formatPanelNumber } from '../../lib/format';
import { fitLabel } from '../../lib/labelFit';

function transformFeatureRect(placement: SheetPlacement, rect: Rect): Rect {
  if (!placement.rotated) {
    return { x: placement.x + rect.x, y: placement.y + rect.y, width: rect.width, height: rect.height };
  }
  const sourceHeight = Math.max(0, placement.panel?.cutHeight || 0);
  return {
    x: placement.x + (sourceHeight - rect.y - rect.height),
    y: placement.y + rect.x,
    width: rect.height,
    height: rect.width,
  };
}

function partDims(panel: Panel, rotated: boolean): string {
  return rotated
    ? `${formatPanelNumber(panel.cutHeight)} x ${formatPanelNumber(panel.cutWidth)}`
    : `${formatPanelNumber(panel.cutWidth)} x ${formatPanelNumber(panel.cutHeight)}`;
}

interface Props {
  sheet: Sheet;
  options: NestingPlan['options'];
}

export function SheetSvg({ sheet, options }: Props) {
  const width = Math.max(1, sheet.sheetWidth);
  const height = Math.max(1, sheet.sheetHeight);
  const pad = Math.max(width, height) * 0.08;
  const labelSize = Math.max(12, Math.min(width, height) * 0.038);
  // Below this the text is unreadable at any zoom, so a smaller label is dropped rather than drawn.
  const labelMin = Math.max(6, Math.min(width, height) * 0.011);
  const gap = Math.max(0, options.gap ?? options.kerf ?? 0);
  const notchStroke = Math.max(1.2, width / 700);

  return (
    <svg
      className="nesting-sheet-svg"
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
      role="img"
      aria-label={`Nested layout for sheet ${sheet.index + 1}`}
    >
      <g transform={`translate(0 ${height}) scale(1 -1)`}>
        <rect x={0} y={0} width={width} height={height} style={{ fill: 'var(--svg-sheet-fill)', stroke: 'var(--svg-sheet-stroke)' }} strokeWidth={Math.max(2, width / 360)} />
        {sheet.freeRects.map((rect, i) => (
          <rect
            key={`free${i}`}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill="rgba(111, 141, 189, 0.06)"
            stroke="rgba(111, 141, 189, 0.18)"
            strokeDasharray={`${Math.max(6, width / 120)} ${Math.max(4, width / 180)}`}
            strokeWidth={Math.max(1, width / 900)}
          />
        ))}
        {sheet.placements.map((placement, index) => {
          const { panel } = placement;
          const cx = placement.x + placement.width / 2;
          const cy = placement.y + placement.height / 2;
          const label = fitLabel(placement.width, placement.height, panel.name, partDims(panel, placement.rotated), index + 1, labelSize, labelMin);
          const inset = gap > 0 ? gap / 2 : 0;
          const gapX = Math.max(0, placement.x - inset);
          const gapY = Math.max(0, placement.y - inset);
          const gapWidth = Math.min(width, placement.x + placement.width + inset) - gapX;
          const gapHeight = Math.min(height, placement.y + placement.height + inset) - gapY;

          return (
            <g key={`${panel.id}-${index}`}>
              {gap > 0 && (
                <rect
                  x={gapX}
                  y={gapY}
                  width={gapWidth}
                  height={gapHeight}
                  fill="rgba(255, 196, 82, 0.14)"
                  stroke="rgba(214, 144, 24, 0.35)"
                  strokeDasharray={`${Math.max(5, width / 180)} ${Math.max(3, width / 260)}`}
                  strokeWidth={Math.max(1, width / 1100)}
                />
              )}
              <rect
                x={placement.x}
                y={placement.y}
                width={placement.width}
                height={placement.height}
                style={{ fill: 'var(--svg-part-fill)', stroke: 'var(--svg-part-stroke)' }}
                strokeWidth={Math.max(1.5, width / 500)}
              />
              {(panel?.notches || []).map((notch, i) => {
                const rect = transformFeatureRect(placement, notch);
                return (
                  <rect key={`notch${i}`} x={rect.x} y={rect.y} width={rect.width} height={rect.height} style={{ fill: 'var(--svg-sheet-fill)', stroke: 'var(--svg-part-stroke)' }} strokeWidth={notchStroke} />
                );
              })}
              {label && (
                <g transform={`translate(${cx} ${cy}) scale(1 -1) rotate(${label.angle})`}>
                  {label.lines.map((line, lineIndex) => (
                    <text
                      key={lineIndex}
                      x={0}
                      y={line.y}
                      textAnchor="middle"
                      fontSize={line.size}
                      fontWeight={line.weight}
                      style={{ fill: lineIndex === 0 ? 'var(--svg-text)' : 'var(--svg-text-muted)' }}
                    >
                      {line.text}
                    </text>
                  ))}
                </g>
              )}
            </g>
          );
        })}
        {gap > 0 && (
          <g transform={`translate(${width - pad * 0.15} ${height - pad * 0.25}) scale(1 -1)`}>
            <text x={0} y={0} textAnchor="end" fontSize={labelSize * 0.7} style={{ fill: 'var(--svg-text-muted)' }}>
              {`Gap ${formatPanelNumber(gap)}mm`}
            </text>
          </g>
        )}
      </g>
      <text x={width / 2} y={-pad * 0.18} textAnchor="middle" fontSize={labelSize * 0.72} style={{ fill: 'var(--svg-text-muted)' }}>
        {formatPanelNumber(width)} mm
      </text>
      <text
        x={-pad * 0.35}
        y={height / 2}
        textAnchor="middle"
        fontSize={labelSize * 0.72}
        style={{ fill: 'var(--svg-text-muted)' }}
        transform={`rotate(-90 ${-pad * 0.35} ${height / 2})`}
      >
        {formatPanelNumber(height)} mm
      </text>
    </svg>
  );
}
