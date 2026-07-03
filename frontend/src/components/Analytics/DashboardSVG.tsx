import React from 'react';
import LineChart from './Widget/LineChart';
import BarChart from './widgets/BarChart';
import Sparkline from './Widget/Sparkline';

interface TrendPoint {
  date: string;
  value: number;
}

interface AnalyticsData {
  views: { total: number; trend: TrendPoint[] };
  earnings: { total: number; trend: TrendPoint[] };
  hours: { total: number; trend: TrendPoint[] };
}

interface Props {
  data: AnalyticsData;
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#6b7280',
  marginBottom: '4px',
};

const totalStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#111827',
  marginBottom: '16px',
};

const DashboardSVG: React.FC<Props> = ({ data }) => {
  return (
    <section aria-label="Analytics visualizations" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Summary Totals Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div style={{ ...cardStyle, borderTop: '3px solid #10b981' }}>
          <div style={labelStyle}>Total Earnings (7d)</div>
          <div style={{ ...totalStyle, color: '#059669' }}>
            ₹{data.earnings.total.toLocaleString('en-IN')}
          </div>
        </div>
        <div style={{ ...cardStyle, borderTop: '3px solid #4f46e5' }}>
          <div style={labelStyle}>Consultation Hours (7d)</div>
          <div style={{ ...totalStyle, color: '#4f46e5' }}>
            {data.hours.total.toFixed(1)} hrs
          </div>
        </div>
        <div style={{ ...cardStyle, borderTop: '3px solid #f59e0b' }}>
          <div style={labelStyle}>Listing Views (7d)</div>
          <div style={{ ...totalStyle, color: '#d97706' }}>
            {data.views.total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={cardStyle}>
          <div style={labelStyle}>Earnings Over Time</div>
          <LineChart width={520} height={180} trend={data.earnings.trend} color="#10b981" />
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Consultation Hours</div>
          <BarChart width={360} height={180} trend={data.hours.trend} color="#4f46e5" />
        </div>
      </div>

      {/* Sparkline Full Width */}
      <div style={cardStyle}>
        <div style={labelStyle}>Listing Views Trend</div>
        <Sparkline width={900} height={70} trend={data.views.trend} color="#f59e0b" />
      </div>

    </section>
  );
};

export default DashboardSVG;
