import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const COUNTRIES = [
  'USA', 'UK', 'Germany', 'Japan', 'China', 'South Korea', 'Singapore',
  'Australia', 'Canada', 'France', 'UAE', 'Netherlands', 'Sweden', 'Italy',
  'Switzerland', 'Israel', 'Brazil', 'Mexico', 'South Africa', 'New Zealand',
];

const CATEGORIES = [
  'Technology & Software', 'Manufacturing & Industrial', 'Healthcare & Pharma',
  'Consumer Goods & FMCG', 'Agriculture & Food', 'Automotive', 'Fashion & Apparel',
  'Electronics & Semiconductors', 'Financial Services', 'Education & EdTech',
  'Energy & Cleantech', 'Logistics & Supply Chain', 'Media & Entertainment',
  'Retail & E-commerce', 'Chemicals', 'Real Estate', 'Consulting & Advisory',
];

const countryFlags = {
  'USA': '🇺🇸', 'UK': '🇬🇧', 'Germany': '🇩🇪', 'Japan': '🇯🇵', 'China': '🇨🇳',
  'South Korea': '🇰🇷', 'Singapore': '🇸🇬', 'Australia': '🇦🇺', 'Canada': '🇨🇦',
  'France': '🇫🇷', 'UAE': '🇦🇪', 'Netherlands': '🇳🇱', 'Sweden': '🇸🇪',
  'Italy': '🇮🇹', 'Switzerland': '🇨🇭', 'Israel': '🇮🇱', 'Brazil': '🇧🇷',
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'New Zealand': '🇳🇿',
};

export default function GlobalToIndia() {
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        ...(search && { search }),
        ...(country && { country }),
        ...(category && { category }),
      });
      const res = await api.get(`/api/global-trade?${queryParams.toString()}`);
      setListings(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
      setTotal(res?.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setError('Could not load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [search, country, category, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchListings(); }, [fetchListings]);

  const clearFilters = () => { setSearch(''); setCountry(''); setCategory(''); setPage(1); };
  const hasFilters = search || country || category;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a2d5a] to-[#0d2847]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.18),transparent)]" />
        {/* floating orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-80 h-80 bg-yellow-400/8 rounded-full blur-3xl" />

        <div className="relative max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-20 md:py-28 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase">
                Global → India
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Global Products &amp;
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-yellow-300 bg-clip-text text-transparent">
                Services for India
              </span>
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed max-w-xl">
              Discover world-class international businesses ready to serve the Indian market. Connect with global leaders in technology, manufacturing, healthcare, and more.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/global-to-india/new"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-blue-400/40 hover:scale-105 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">add_business</span>
                  List Your Business
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Join to List Your Business
                </Link>
              )}
              <div className="flex items-center gap-2 text-blue-300/80 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                {total} verified global businesses
              </div>
            </div>
          </div>
          {/* Stats Panel */}
          <div className="hidden lg:flex flex-col gap-4 shrink-0">
            {[
              { icon: 'public', label: 'Countries', value: '20+' },
              { icon: 'category', label: 'Categories', value: '17' },
              { icon: 'handshake', label: 'Live Listings', value: total.toString() },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 backdrop-blur-sm min-w-[180px]">
                <span className="material-symbols-outlined text-blue-400 text-[32px]">{s.icon}</span>
                <div>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-blue-300/70 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop -mt-8 relative z-10">
        <div className="bg-surface border border-outline-variant/30 rounded-2xl shadow-xl p-5 flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/3 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search by company, product, description…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 flex-grow justify-end items-center">
            <select
              value={country}
              aria-label="Filter by Country"
              onChange={(e) => { setCountry(e.target.value); setPage(1); }}
              className="w-full sm:w-52 bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">🌍 All Countries</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{countryFlags[c] || '🏳'} {c}</option>
              ))}
            </select>
            <select
              value={category}
              aria-label="Filter by Category"
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full sm:w-52 bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">📦 All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-body-sm text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Listings ─────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-10 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-on-surface-variant">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-body-md">Loading global listings…</span>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold text-center">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-2xl border border-dashed border-outline-variant/50 max-w-lg mx-auto">
            <span className="text-6xl mb-4 block">🌍</span>
            <h3 className="font-headline-md text-headline-md font-bold text-primary">No Listings Found</h3>
            <p className="text-body-sm text-on-surface-variant mt-2">
              {hasFilters ? 'Try different filters or clear them.' : 'Be the first to list your global business for the Indian market!'}
            </p>
            {isAuthenticated && (
              <Link to="/global-to-india/new" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500 transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
                List Your Business
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-on-surface-variant text-sm font-semibold">
              Showing <span className="text-primary font-bold">{listings.length}</span> of <span className="text-primary font-bold">{total}</span> global businesses
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="group bg-surface border border-outline-variant/30 hover:border-blue-400/40 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-[#0d1f3c] to-[#1a3260] p-5 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{countryFlags[item.countryOfOrigin] || '🏳'}</div>
                      <div>
                        <p className="text-white font-bold text-base leading-tight line-clamp-1">{item.companyName}</p>
                        <p className="text-blue-300/80 text-xs font-medium mt-0.5">{item.countryOfOrigin}</p>
                      </div>
                    </div>
                    {item.isVerified && (
                      <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Verified
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow space-y-4">
                    <span className="bg-blue-500/10 text-blue-600 border border-blue-200/30 px-3 py-1 rounded-full text-[11px] font-bold self-start">
                      {item.productCategory}
                    </span>
                    <p className="text-body-sm text-on-surface-variant/80 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {item.products?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.products.slice(0, 3).map((p, i) => (
                          <span key={i} className="bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-[11px] px-2.5 py-1 rounded-lg font-medium">
                            {p}
                          </span>
                        ))}
                        {item.products.length > 3 && (
                          <span className="text-[11px] text-on-surface-variant/60 px-2 py-1">+{item.products.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {item.priceRange && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60">payments</span>
                        <span className="font-semibold text-primary">{item.currency} {item.priceRange}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-outline-variant/20 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-xs text-on-surface-variant/60">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      {item.views} views
                    </div>
                    <Link
                      to={`/global-to-india/${item.id}`}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 font-bold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1 group-hover:shadow-md"
                    >
                      View Details
                      <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="border border-outline disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-body-sm text-primary font-bold">Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="border border-outline disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
