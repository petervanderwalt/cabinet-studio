import type { Panel } from '../../types';

export function PanelPreview({ panel }: { panel: Panel }) {
  const width = Math.max(1, panel.cutWidth || panel.sizeX || 1);
  const height = Math.max(1, panel.cutHeight || panel.sizeY || 1);
  const pad = Math.max(width, height) * 0.06;
  const strokeWidth = Math.max(1, Math.max(width, height) / 280);
  const eb = panel.edgeBanding || {};
  const ebStroke = '#f07f2f';
  const ebWidth = Math.max(2, Math.min(width, height) / 42);
  const line = (x1: number, y1: number, x2: number, y2: number, key: string) => (
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ebStroke} strokeWidth={ebWidth} strokeLinecap="round" />
  );

  return (
    <svg
      className="panel-preview-svg"
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
      role="img"
      aria-label={`${panel.name} preview`}
    >
      <g transform={`translate(0 ${height}) scale(1 -1)`}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={Math.min(width, height) * 0.015}
          style={{ fill: 'var(--svg-panel-fill)', stroke: 'var(--svg-panel-stroke)' }}
          strokeWidth={strokeWidth}
        />
        {(panel.notches || []).map((notch, i) => (
          <rect key={`n${i}`} x={notch.x} y={notch.y} width={notch.width} height={notch.height} style={{ fill: 'var(--svg-notch-fill)' }} stroke="#d18a68" strokeWidth={strokeWidth} />
        ))}
        {(panel.grooves || []).map((groove, i) => (
          <rect
            key={`g${i}`}
            x={groove.x}
            y={groove.y}
            width={groove.width}
            height={groove.height}
            fill="none"
            stroke="#3a6df0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${strokeWidth * 3} ${strokeWidth * 2}`}
          />
        ))}
        {(panel.holes || []).map((hole, i) => (
          <circle
            key={`h${i}`}
            cx={hole.x}
            cy={hole.y}
            r={Math.max(1.5, (hole.diameter || 5) / 2)}
            fill="none"
            stroke="#2f7d78"
            strokeWidth={strokeWidth}
          />
        ))}
        {eb.top && line(0, height, width, height, 'top')}
        {eb.bottom && line(0, 0, width, 0, 'bottom')}
        {eb.left && line(0, 0, 0, height, 'left')}
        {eb.right && line(width, 0, width, height, 'right')}
      </g>
    </svg>
  );
}
