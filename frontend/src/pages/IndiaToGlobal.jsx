import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const CATEGORIES = [
  'Technology & Software', 'Manufacturing & Industrial', 'Healthcare & Pharma',
  'Consumer Goods & FMCG', 'Agriculture & Food', 'Automotive', 'Fashion & Apparel',
  'Electronics & Semiconductors', 'Financial Services', 'Education & EdTech',
  'Energy & Cleantech', 'Logistics & Supply Chain', 'Media & Entertainment',
  'Retail & E-commerce', 'Chemicals', 'Real Estate', 'Consulting & Advisory',
  'Handicrafts & Artisans', 'Gems & Jewellery', 'Textiles',
];

const stateColors = {
  'Maharashtra': 'from-orange-400 to-orange-600',
  'Tamil Nadu': 'from-red-400 to-red-600',
  'Karnataka': 'from-yellow-400 to-yellow-600',
  'Gujarat': 'from-green-400 to-green-600',
  'Delhi': 'from-blue-400 to-blue-600',
  'Rajasthan': 'from-pink-400 to-pink-600',
};

export default function IndiaToGlobal() {
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
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
        ...(state && { state }),
        ...(category && { category }),
      });
      const res = await api.get(`/api/india-trade?${queryParams.toString()}`);
      setListings(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
      setTotal(res?.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setError('Could not load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [search, state, category, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchListings(); }, [fetchListings]);

  const clearFilters = () => { setSearch(''); setState(''); setCategory(''); setPage(1); };
  const hasFilters = search || state || category;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Saffron → White → Green Indian tricolour gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2d1a00] to-[#001a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,153,51,0.15),transparent)]" />
        {/* floating orbs */}
        <div className="absolute top-8 left-16 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-24 right-10 w-96 h-96 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-orange-500/60 via-white/20 to-green-500/60" />

        <div className="relative max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-20 md:py-28 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-500/20 border border-orange-400/30 text-orange-300 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase">
                🇮🇳 India → Global
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Made in India,
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-white to-green-400 bg-clip-text text-transparent">
                Going Global
              </span>
            </h1>
            <p className="text-lg text-orange-100/80 leading-relaxed max-w-xl">
              Discover exceptional Indian businesses ready to serve the world. From technology to textiles, pharmaceuticals to handicrafts — India's best, now globally accessible.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/india-to-global/new"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-400/40 hover:scale-105 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  List Your Indian Business
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Join to List Your Business
                </Link>
              )}
              <div className="flex items-center gap-2 text-orange-300/80 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">factory</span>
                {total} Indian businesses listed
              </div>
            </div>

            {/* Tricolour bar */}
            <div className="flex gap-1 w-48 h-1.5 rounded-full overflow-hidden">
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-white/70" />
              <div className="flex-1 bg-green-500" />
            </div>
          </div>

          {/* Stats Panel */}
          <div className="hidden lg:flex flex-col gap-4 shrink-0">
            {[
              { icon: 'location_city', label: 'States', value: '24' },
              { icon: 'category', label: 'Sectors', value: '20+' },
              { icon: 'public', label: 'Export Markets', value: '50+' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 backdrop-blur-sm min-w-[180px]">
                <span className="material-symbols-outlined text-orange-400 text-[32px]">{s.icon}</span>
                <div>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-orange-300/70 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
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
              placeholder="Search company, product, city…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 flex-grow justify-end items-center">
            <select
              value={state}
              aria-label="Filter by Indian State"
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="w-full sm:w-52 bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
            >
              <option value="">🇮🇳 All States</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={category}
              aria-label="Filter by Category"
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full sm:w-52 bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
            >
              <option value="">📦 All Sectors</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-body-sm text-orange-500 hover:text-orange-400 font-bold flex items-center gap-1 whitespace-nowrap"
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
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-body-md">Loading Indian exporters…</span>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold text-center">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-2xl border border-dashed border-outline-variant/50 max-w-lg mx-auto">
            <span className="text-6xl mb-4 block">🇮🇳</span>
            <h3 className="font-headline-md text-headline-md font-bold text-primary">No Listings Found</h3>
            <p className="text-body-sm text-on-surface-variant mt-2">
              {hasFilters ? 'Try different filters or clear them.' : 'Be the first to showcase your Indian business globally!'}
            </p>
            {isAuthenticated && (
              <Link to="/india-to-global/new" className="mt-6 inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
                List Your Business
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-on-surface-variant text-sm font-semibold">
              Showing <span className="text-primary font-bold">{listings.length}</span> of <span className="text-primary font-bold">{total}</span> Indian exporters
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => {
                const gradColor = stateColors[item.indianState] || 'from-orange-500 to-red-500';
                return (
                  <div
                    key={item.id}
                    className="group bg-surface border border-outline-variant/30 hover:border-orange-400/40 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Card Header */}
                    <div className={`bg-gradient-to-br ${gradColor} p-5 flex justify-between items-start relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative z-10">
                        <p className="text-white font-extrabold text-base leading-tight line-clamp-1">{item.companyName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/80 text-xs font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                            {item.city ? `${item.city}, ` : ''}{item.indianState}
                          </span>
                        </div>
                      </div>
                      <div className="relative z-10 flex flex-col items-end gap-1">
                        <span className="text-3xl">🇮🇳</span>
                        {item.isVerified && (
                          <span className="bg-white/20 text-white border border-white/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">verified</span> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-grow space-y-4">
                      <span className="bg-orange-500/10 text-orange-600 border border-orange-200/30 px-3 py-1 rounded-full text-[11px] font-bold self-start">
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
                            <span className="text-[11px] text-on-surface-variant/60 px-2 py-1">+{item.products.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* IEC indicator */}
                      <div className="flex flex-wrap gap-2">
                        {item.iecCode && (
                          <span className="bg-green-100 border border-green-300/50 text-green-700 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">badge</span> IEC Registered
                          </span>
                        )}
                        {item.exportCertifications?.length > 0 && (
                          <span className="bg-yellow-100 border border-yellow-300/50 text-yellow-800 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                            {item.exportCertifications[0]}
                            {item.exportCertifications.length > 1 ? ` +${item.exportCertifications.length - 1}` : ''}
                          </span>
                        )}
                      </div>

                      {item.targetGlobalMarkets?.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/70">
                          <span className="material-symbols-outlined text-[14px]">public</span>
                          <span className="font-medium">Targets: {item.targetGlobalMarkets.slice(0, 3).join(', ')}{item.targetGlobalMarkets.length > 3 ? ` +${item.targetGlobalMarkets.length - 3}` : ''}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-outline-variant/20 p-4 flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant/60">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {item.views} views
                      </div>
                      <Link
                        to={`/india-to-global/${item.id}`}
                        className="bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 font-bold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1 group-hover:shadow-md"
                      >
                        View Details
                        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

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
