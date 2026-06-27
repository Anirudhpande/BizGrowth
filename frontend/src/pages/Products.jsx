import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Electronics & Gadgets',
  'Industrial & Machinery',
  'Software & SaaS',
  'Apparel & Fashion',
  'Food & Agriculture',
  'Healthcare & Medical',
  'Chemicals & Materials',
  'Office Supplies',
  'Consumer Goods',
  'Automotive & Spares',
  'Other Services & Utilities'
];

export default function Products() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [targetMarket, setTargetMarket] = useState(''); // '', 'domestic', 'global', 'both'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        ...(search && { search }),
        ...(category && { category }),
        ...(targetMarket && { targetMarket }),
      });
      const res = await api.get(`/api/products?${queryParams.toString()}`);
      setProducts(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
      setTotal(res?.pagination?.total || 0);
    } catch {
      setError('Could not load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [search, category, targetMarket, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setTargetMarket('');
    setPage(1);
  };

  const hasFilters = search || category || targetMarket;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c2417] via-[#091b10] to-[#05110a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.15),transparent)]" />
        {/* floating orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-80 h-80 bg-teal-400/8 rounded-full blur-3xl" />

        <div className="relative max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-20 md:py-28 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase">
                B2B Products Marketplace
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Domestic &amp; Global
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Product Sales Portal
              </span>
            </h1>
            <p className="text-lg text-emerald-100/80 leading-relaxed max-w-xl">
              Source and sell products seamlessly across local Indian markets and international trade networks. Discover certified B2B suppliers.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/products/new"
                  className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add</span>
                  List Your Product
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Sign In to Sell
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md w-full max-w-xs shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="material-symbols-outlined text-emerald-400 text-3xl">storefront</span>
              <div>
                <h4 className="text-white font-bold text-lg">Marketplace Stats</h4>
                <p className="text-xs text-white/50">Real-time indicators</p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Total Products Listed</span>
                <span className="text-emerald-400 font-bold">{total || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Trade Scope</span>
                <span className="text-white font-semibold">Domestic &amp; Global</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Secure Payments</span>
                <span className="text-teal-400 font-bold">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">filter_list</span>
                  Filters
                </h3>
                {hasFilters && (
                  <button 
                    onClick={clearFilters}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Search Keywords</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search name, description..."
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-primary focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">
                    search
                  </span>
                </div>
              </div>

              {/* Target Market Tab buttons */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Market Scope</label>
                <div className="flex flex-col gap-2">
                  {[
                    { label: '🌍 All Markets', value: '' },
                    { label: '🇮🇳 Domestic (India)', value: 'domestic' },
                    { label: '🌐 Global Markets', value: 'global' },
                    { label: '🤝 Both Markets', value: 'both' }
                  ].map((market) => (
                    <button
                      key={market.value}
                      onClick={() => { setTargetMarket(market.value); setPage(1); }}
                      className={`text-left text-sm py-2 px-3 rounded-xl font-medium transition-colors ${
                        targetMarket === market.value
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                          : 'text-on-surface-variant hover:bg-surface-container border border-transparent'
                      }`}
                    >
                      {market.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Category</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-2.5 px-3 text-sm text-primary focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3 space-y-8">
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 border border-error/20">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-surface border border-outline-variant/20 rounded-2xl p-4 space-y-4 animate-pulse">
                    <div className="w-full h-44 bg-surface-container rounded-xl" />
                    <div className="h-4 bg-surface-container rounded w-2/3" />
                    <div className="h-3 bg-surface-container rounded w-1/2" />
                    <div className="h-6 bg-surface-container rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-surface border border-outline-variant/20 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">shopping_bag</span>
                <h3 className="text-xl font-bold text-primary">No Products Found</h3>
                <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                  We couldn't find any products matching your selection. Try clearing filters or list your own product.
                </p>
                {hasFilters && (
                  <button 
                    onClick={clearFilters}
                    className="bg-emerald-600 text-white font-bold py-2 px-5 rounded-full hover:bg-emerald-500 transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-surface border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col group relative"
                    >
                      {/* Product Image */}
                      <div className="w-full h-44 bg-surface-container-low relative overflow-hidden flex items-center justify-center border-b border-outline-variant/10">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">inventory_2</span>
                        )}
                        
                        {/* Market Scope Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          {item.targetMarket === 'domestic' && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/50 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                              🇮🇳 Domestic
                            </span>
                          )}
                          {item.targetMarket === 'global' && (
                            <span className="bg-blue-100 text-blue-800 border border-blue-200/50 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                              🌐 Global
                            </span>
                          )}
                          {item.targetMarket === 'both' && (
                            <span className="bg-purple-100 text-purple-800 border border-purple-200/50 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                              🤝 Both Markets
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold tracking-wide uppercase text-on-surface-variant/70">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-primary text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-on-surface-variant line-clamp-2">
                            {item.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="flex justify-between items-end pt-2 border-t border-outline-variant/10">
                          <div>
                            <span className="text-[10px] text-on-surface-variant/60 block font-semibold">PRICE</span>
                            <span className="font-bold text-secondary text-lg">
                              {item.currency} {item.price.toLocaleString()}
                            </span>
                          </div>
                          <Link 
                            to={`/products/${item.id}`}
                            className="bg-surface border border-outline-variant/40 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1"
                          >
                            View
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </Link>
                        </div>
                      </div>

                      {/* Small Bottom bar: Stock & Views */}
                      <div className="bg-surface-container-low px-5 py-2 flex items-center justify-between text-[11px] text-on-surface-variant/70 border-t border-outline-variant/10">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[14px]">inventory</span>
                          {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          {item.views || 0} views
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="bg-surface border border-outline-variant/30 text-primary py-2 px-4 rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-surface"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-semibold text-on-surface-variant">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="bg-surface border border-outline-variant/30 text-primary py-2 px-4 rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-surface"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
