import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const countryFlags = {
  'USA': '🇺🇸', 'UK': '🇬🇧', 'Germany': '🇩🇪', 'Japan': '🇯🇵', 'China': '🇨🇳',
  'South Korea': '🇰🇷', 'Singapore': '🇸🇬', 'Australia': '🇦🇺', 'Canada': '🇨🇦',
  'France': '🇫🇷', 'UAE': '🇦🇪', 'Netherlands': '🇳🇱', 'Sweden': '🇸🇪',
  'Italy': '🇮🇹', 'Switzerland': '🇨🇭', 'Israel': '🇮🇱', 'Brazil': '🇧🇷',
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'New Zealand': '🇳🇿',
};

export default function GlobalToIndiaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/global-trade/${id}`);
        setListing(res?.data || null);
      } catch (err) {
        setError('Could not load listing details.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/global-trade/${id}`);
      navigate('/global-to-india');
    } catch (err) {
      alert('Failed to delete listing.');
      setDeleting(false);
    }
  };

  const isOwner = user && listing && user.id === listing.userId;
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-on-surface-variant font-semibold">Loading…</span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-lg mx-auto py-32 text-center">
        <span className="text-6xl">😕</span>
        <h2 className="font-headline-md text-headline-md font-bold text-primary mt-4">{error || 'Listing not found'}</h2>
        <Link to="/global-to-india" className="mt-6 inline-block text-blue-500 hover:underline font-semibold">← Back to Global Listings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to="/global-to-india" className="hover:text-blue-500 transition-colors font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">public</span>
          Global → India
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-bold text-primary">{listing.companyName}</span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Header */}
          <div className="relative bg-gradient-to-br from-[#0d1f3c] to-[#1a3260] rounded-2xl p-8 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="text-7xl">{countryFlags[listing.countryOfOrigin] || '🏳'}</div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white">{listing.companyName}</h1>
                  {listing.isVerified && (
                    <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span> Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="text-blue-300 font-semibold text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                    {listing.countryOfOrigin}
                  </span>
                  <span className="bg-blue-500/20 text-blue-200 border border-blue-400/20 px-3 py-0.5 rounded-full text-xs font-bold">
                    {listing.productCategory}
                  </span>
                </div>
                {listing.website && (
                  <a href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">language</span>
                    {listing.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-4">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">About the Business</h2>
            <p className="text-body-md text-on-surface-variant/90 leading-relaxed">{listing.description}</p>
          </div>

          {/* Products */}
          {listing.products?.length > 0 && (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">inventory_2</span>
                Products Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.products.map((p, i) => (
                  <span key={i} className="bg-blue-50 border border-blue-200/60 text-blue-700 text-sm px-3.5 py-1.5 rounded-full font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {listing.services?.length > 0 && (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">support_agent</span>
                Services Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.services.map((s, i) => (
                  <span key={i} className="bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-sm px-3.5 py-1.5 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Markets */}
          {listing.targetIndianMarkets?.length > 0 && (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">place</span>
                Target Indian Markets
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.targetIndianMarkets.map((m, i) => (
                  <span key={i} className="bg-orange-50 border border-orange-200/60 text-orange-700 text-sm px-3.5 py-1.5 rounded-full font-medium flex items-center gap-1">
                    🇮🇳 {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {listing.certifications?.length > 0 && (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">workspace_premium</span>
                Certifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.certifications.map((c, i) => (
                  <span key={i} className="bg-yellow-50 border border-yellow-300/60 text-yellow-800 text-sm px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-yellow-600">verified_user</span> {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Contact Card */}
          <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 space-y-4">
            <h3 className="font-bold text-lg">Contact This Business</h3>
            {listing.priceRange && (
              <div className="bg-white/15 rounded-xl p-4">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Price Range</p>
                <p className="text-xl font-extrabold mt-1">{listing.currency} {listing.priceRange}</p>
              </div>
            )}
            {listing.contactEmail && (
              <a href={`mailto:${listing.contactEmail}`}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors group">
                <span className="material-symbols-outlined text-blue-200">email</span>
                <div>
                  <p className="text-xs text-blue-200 font-semibold">Email</p>
                  <p className="font-bold text-sm break-all">{listing.contactEmail}</p>
                </div>
              </a>
            )}
            {listing.contactPhone && (
              <a href={`tel:${listing.contactPhone}`}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors">
                <span className="material-symbols-outlined text-blue-200">phone</span>
                <div>
                  <p className="text-xs text-blue-200 font-semibold">Phone</p>
                  <p className="font-bold text-sm">{listing.contactPhone}</p>
                </div>
              </a>
            )}
            {listing.contactEmail && (
              <a href={`mailto:${listing.contactEmail}?subject=Business Enquiry from BizGrowth&body=Hello, I found your listing on BizGrowth and would like to explore a business opportunity.`}
                className="block w-full text-center bg-white text-blue-600 font-extrabold py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                Send Enquiry →
              </a>
            )}
          </div>

          {/* Meta Info */}
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-primary text-sm uppercase tracking-wider">Listing Info</h3>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Views</span>
              <span className="font-bold text-primary">{listing.views}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Listed</span>
              <span className="font-bold text-primary">{new Date(listing.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Status</span>
              <span className={`font-bold capitalize px-2 py-0.5 rounded-full text-xs ${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{listing.status}</span>
            </div>
          </div>

          {/* Owner Actions */}
          {(isOwner || isAdmin) && (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-primary text-sm uppercase tracking-wider">Manage Listing</h3>
              <Link to={`/global-to-india/${id}/edit`}
                className="flex items-center gap-2 justify-center w-full border border-outline text-primary hover:bg-surface-container-low py-2.5 rounded-xl font-bold text-sm transition-colors">
                <span className="material-symbols-outlined text-[18px]">edit</span> Edit Listing
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 justify-center w-full bg-error-container text-on-error-container hover:bg-error/20 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                {deleting ? 'Deleting…' : 'Delete Listing'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
