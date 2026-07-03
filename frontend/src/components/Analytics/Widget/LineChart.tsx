import React from 'react';

interface TrendPoint {
  date: string;
  value: number;
}

interface Props {
  width?: number;
  height?: number;
  trend?: TrendPoint[];
  color?: string;
}

const MARGIN = { top: 12, right: 12, bottom: 28, left: 40 };

const LineChart: React.FC<Props> = ({
  width = 520,
  height = 180,
  trend = [],
  color = '#4f46e5',
}) => {
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  if (!trend || trend.length === 0) {
    return (
      <svg width={width} height={height} role="img" aria-label="No data">
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="#9ca3af" fontSize={13}>
          No data yet
        </text>
      </svg>
    );
  }

  const values = trend.map((p) => p.value);
  const maxVal = Math.max(...values, 1);
  const step = innerW / Math.max(trend.length - 1, 1);

  const toX = (i: number) => MARGIN.left + i * step;
  const toY = (v: number) => MARGIN.top + innerH - (v / maxVal) * innerH;

  const points = trend.map((p, i) => `${toX(i)},${toY(p.value)}`).join(' ');

  // Area fill path
  const areaPath = [
    `M ${toX(0)},${toY(trend[0].value)}`,
    ...trend.slice(1).map((p, i) => `L ${toX(i + 1)},${toY(p.value)}`),
    `L ${toX(trend.length - 1)},${MARGIN.top + innerH}`,
    `L ${toX(0)},${MARGIN.top + innerH}`,
    'Z',
  ].join(' ');

  return (
    <svg width={width} height={height} role="img" aria-label="Line chart">
      <defs>
        <linearGradient id={`grad-line-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = MARGIN.top + innerH * (1 - frac);
        const label = Math.round(maxVal * frac);
        return (
          <g key={frac}>
            <line x1={MARGIN.left} y1={y} x2={width - MARGIN.right} y2={y}
              stroke="#f3f4f6" strokeWidth={1} />
            <text x={MARGIN.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
              {label > 999 ? `${(label / 1000).toFixed(0)}k` : label}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#grad-line-${color.replace('#', '')})`} />

      {/* Line */}
      <polyline fill="none" stroke={color} strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" points={points} />

      {/* Data points */}
      {trend.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.value)} r={3.5}
          fill={color} stroke="#fff" strokeWidth={1.5}>
          <title>{p.date}: {p.value}</title>
        </circle>
      ))}

      {/* X-axis date labels */}
      {trend.map((p, i) => (
        <text key={i} x={toX(i)} y={height - 6} textAnchor="middle"
          fontSize={9} fill="#9ca3af">
          {new Date(p.date).toLocaleDateString(undefined, { weekday: 'short' })}
        </text>
      ))}
    </svg>
  );
};

export default LineChart;
