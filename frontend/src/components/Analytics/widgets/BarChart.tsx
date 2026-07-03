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

const MARGIN = { top: 12, right: 12, bottom: 28, left: 36 };

const BarChart: React.FC<Props> = ({
  width = 360,
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
  const barW = innerW / trend.length;
  const gap = barW * 0.25;

  return (
    <svg width={width} height={height} role="img" aria-label="Bar chart">
      <defs>
        <linearGradient id={`grad-bar-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.5, 1].map((frac) => {
        const y = MARGIN.top + innerH * (1 - frac);
        const label = (maxVal * frac).toFixed(1);
        return (
          <g key={frac}>
            <line x1={MARGIN.left} y1={y} x2={width - MARGIN.right} y2={y}
              stroke="#f3f4f6" strokeWidth={1} />
            <text x={MARGIN.left - 4} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
              {label}
            </text>
          </g>
        );
      })}

      {trend.map((p, i) => {
        const barH = (p.value / maxVal) * innerH;
        const x = MARGIN.left + i * barW + gap / 2;
        const y = MARGIN.top + innerH - barH;

        return (
          <g key={i}>
            <rect
              x={x} y={y}
              width={barW - gap}
              height={Math.max(barH, 2)}
              rx={4}
              fill={`url(#grad-bar-${color.replace('#', '')})`}
            >
              <title>{p.date}: {p.value.toFixed(2)} hrs</title>
            </rect>
            <text x={x + (barW - gap) / 2} y={height - 6}
              textAnchor="middle" fontSize={9} fill="#9ca3af">
              {new Date(p.date).toLocaleDateString(undefined, { weekday: 'short' })}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default BarChart;
