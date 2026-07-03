import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const TYPE_COLORS = {
  sell: { bg: '#f0fdf4', text: '#16a34a', label: 'Sell' },
  buy: { bg: '#eff6ff', text: '#2563eb', label: 'Buy' },
  partner: { bg: '#faf5ff', text: '#7c3aed', label: 'Partner' },
  supplier: { bg: '#fff7ed', text: '#ea580c', label: 'Supplier' },
  investor: { bg: '#fefce8', text: '#ca8a04', label: 'Investor' },
};

export default function RecommendationsWidget() {
  const [listings, setListings] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/recommendations');
        setListings(res?.data || []);
        setIndustries(res?.industries || []);
      } catch (err) {
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⟳</span>
        Loading recommendations…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', background: '#fef2f2', borderRadius: 12, color: '#991b1b', fontSize: 13 }}>
        ⚠️ {error}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div style={{
        padding: '24px', textAlign: 'center', color: '#6b7280',
        background: '#f9fafb', borderRadius: 12, fontSize: 14,
      }}>
        No recommendations yet. Add your industry to your profile to get personalised matches!
      </div>
    );
  }

  return (
    <div>
      {industries.length > 0 && (
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Based on your interests in:{' '}
          {industries.map((ind, i) => (
            <span key={i} style={{
              background: '#ede9fe', color: '#5b21b6', borderRadius: 99,
              padding: '2px 10px', fontSize: 12, fontWeight: 600, marginRight: 6,
            }}>{ind}</span>
          ))}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {listings.map((listing) => {
          const typeStyle = TYPE_COLORS[listing.type] || TYPE_COLORS.sell;
          return (
            <Link
              key={listing.id}
              to={`/marketplace/${listing.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
                padding: '16px 18px', transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.10)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Type badge */}
                <span style={{
                  display: 'inline-block', background: typeStyle.bg, color: typeStyle.text,
                  fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 10px',
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
                }}>
                  {typeStyle.label}
                </span>

                {/* Title */}
                <div style={{
                  fontWeight: 700, fontSize: 14, color: '#111827',
                  marginBottom: 6, lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {listing.title}
                </div>

                {/* Description */}
                <div style={{
                  fontSize: 12, color: '#6b7280', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10,
                }}>
                  {listing.description}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {listing.industry && (
                    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                      🏭 {listing.industry}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    👁 {listing.views} views
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
