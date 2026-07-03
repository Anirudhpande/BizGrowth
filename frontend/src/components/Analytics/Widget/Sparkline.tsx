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

const Sparkline: React.FC<Props> = ({
  width = 900,
  height = 70,
  trend = [],
  color = '#f59e0b',
}) => {
  const PAD = { x: 6, y: 6 };
  const innerW = width - PAD.x * 2;
  const innerH = height - PAD.y * 2;

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

  const toX = (i: number) => PAD.x + i * step;
  const toY = (v: number) => PAD.y + innerH - (v / maxVal) * innerH;

  const polyPoints = trend.map((p, i) => `${toX(i)},${toY(p.value)}`).join(' ');

  const areaPath = [
    `M ${toX(0)},${toY(trend[0].value)}`,
    ...trend.slice(1).map((p, i) => `L ${toX(i + 1)},${toY(p.value)}`),
    `L ${toX(trend.length - 1)},${PAD.y + innerH}`,
    `L ${toX(0)},${PAD.y + innerH}`,
    'Z',
  ].join(' ');

  return (
    <svg width={width} height={height} role="img" aria-label="Sparkline views trend">
      <defs>
        <linearGradient id={`grad-spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Area */}
      <path d={areaPath} fill={`url(#grad-spark-${color.replace('#', '')})`} />

      {/* Line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={polyPoints}
      />

      {/* Dots */}
      {trend.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.value)} r={3}
          fill={color} stroke="#fff" strokeWidth={1.5}>
          <title>{p.date}: {p.value} views</title>
        </circle>
      ))}
    </svg>
  );
};

export default Sparkline;
