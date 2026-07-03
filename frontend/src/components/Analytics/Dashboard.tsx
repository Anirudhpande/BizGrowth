import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import DashboardSVG from './DashboardSVG';

interface TrendPoint {
  date: string;
  value: number;
}

interface AnalyticsData {
  views: { total: number; trend: TrendPoint[] };
  earnings: { total: number; trend: TrendPoint[] };
  hours: { total: number; trend: TrendPoint[] };
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/api/analytics/dashboard');
        setData(res?.data || res);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '260px', gap: '16px',
      }}>
        <svg width="48" height="48" viewBox="0 0 48 48" style={{ animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="24" cy="24" r="20" fill="none" stroke="#e0e0e0" strokeWidth="4" />
          <path d="M24 4 a20 20 0 0 1 20 20" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>Loading analytics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
        padding: '16px 20px', color: '#991b1b', fontSize: '14px',
      }}>
        <span>⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>
      <DashboardSVG data={data} />
    </div>
  );
};

export default Dashboard;
