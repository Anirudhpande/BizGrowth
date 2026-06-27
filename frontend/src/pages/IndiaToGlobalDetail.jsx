import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function IndiaToGlobalDetail() {
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
        const res = await api.get(`/api/india-trade/${id}`);
        setListing(res?.data || null);
      } catch {
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
      await api.delete(`/api/india-trade/${id}`);
      navigate('/india-to-global');
    } catch {
      alert('Failed to delete listing.');
      setDeleting(false);
    }
  };

  const isOwner = user && listing && user.id === listing.userId;
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-on-surface-variant font-semibold">Loading…</span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-lg mx-auto py-32 text-center">
        <span className="text-6xl">😕</span>
        <h2 className="font-headline-md text-headline-md font-bold text-primary mt-4">{error || 'Listing not found'}</h2>
        <Link to="/india-to-global" className="mt-6 inline-block text-orange-500 hover:underline font-semibold">← Back to India Exporters</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to="/india-to-global" className="hover:text-orange-500 transition-colors font-semibold flex items-center gap-1">
          <span>🇮🇳</span>
          India → Global
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-bold text-primary">{listing.companyName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Header */}
          <div className="relative bg-gradient-to-br from-[#2d1200] to-[#001a08] rounded-2xl p-8 overflow-hidden shadow-xl">
            {/* Tricolour stripe at top */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-white/60" />
              <div className="flex-1 bg-green-500" />
            </div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="text-7xl">🇮🇳</div>
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
                  <span className="text-orange-300 font-semibold text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {listing.city ? `${listing.city}, ` : ''}{listing.indianState}
                  </span>
                  <span className="bg-orange-500/20 text-orange-200 border border-orange-400/20 px-3 py-0.5 rounded-full text-xs font-bold">
                    {listing.productCategory}
                  </span>
                </div>
                {listing.website && (
                  <a href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 text-sm font-semibold flex items-center gap-1 transition-colors">
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
                <span className="material-symbols-outlined text-orange-500">inventory_2</span>
                Export Products
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.products.map((p, i) => (
                  <span key={i} className="bg-orange-50 border border-orange-200/60 text-orange-700 text-sm px-3.5 py-1.5 rounded-full font-medium">
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
                <span className="material-symbols-outlined text-orange-500">support_agent</span>
                Services Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.services.map((s, i) => (
                  <span key={i} className="bg-amber-50 border border-amber-200/60 text-amber-800 text-sm px-3.5 py-1.5 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Global Markets */}
          {listing.targetGlobalMarkets?.length > 0 && (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">public</span>
                Target Export Markets
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.targetGlobalMarkets.map((m, i) => (
                  <span key={i} className="bg-blue-50 border border-blue-200/60 text-blue-700 text-sm px-3.5 py-1.5 rounded-full font-medium flex items-center gap-1">
                    🌍 {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Compliance */}
          {(listing.exportCertifications?.length > 0 || listing.iecCode || listing.gstNumber) && (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">workspace_premium</span>
                Compliance &amp; Certifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.iecCode && (
                  <div className="bg-green-50 border border-green-200/60 rounded-xl p-4">
                    <p className="text-green-700 text-xs font-bold uppercase tracking-wider mb-1">IEC Code (Import Export)</p>
                    <p className="text-green-800 font-extrabold font-mono text-lg">{listing.iecCode}</p>
                  </div>
                )}
                {listing.gstNumber && (
                  <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-4">
                    <p className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">GST Registration</p>
                    <p className="text-blue-800 font-extrabold font-mono text-lg">{listing.gstNumber}</p>
                  </div>
                )}
              </div>
              {listing.exportCertifications?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {listing.exportCertifications.map((c, i) => (
                    <span key={i} className="bg-yellow-50 border border-yellow-300/60 text-yellow-800 text-sm px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-yellow-600">verified_user</span> {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Contact Card */}
          <div className="bg-gradient-to-b from-orange-600 to-orange-700 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-xl">🤝</span> Contact This Exporter
            </h3>
            {listing.priceRange && (
              <div className="bg-white/15 rounded-xl p-4">
                <p className="text-orange-200 text-xs font-bold uppercase tracking-wider">Price Range</p>
                <p className="text-xl font-extrabold mt-1">{listing.currency} {listing.priceRange}</p>
              </div>
            )}
            {listing.contactEmail && (
              <a href={`mailto:${listing.contactEmail}`}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors">
                <span className="material-symbols-outlined text-orange-200">email</span>
                <div>
                  <p className="text-xs text-orange-200 font-semibold">Email</p>
                  <p className="font-bold text-sm break-all">{listing.contactEmail}</p>
                </div>
              </a>
            )}
            {listing.contactPhone && (
              <a href={`tel:${listing.contactPhone}`}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors">
                <span className="material-symbols-outlined text-orange-200">phone</span>
                <div>
                  <p className="text-xs text-orange-200 font-semibold">Phone</p>
                  <p className="font-bold text-sm">{listing.contactPhone}</p>
                </div>
              </a>
            )}
            {listing.contactEmail && (
              <a href={`mailto:${listing.contactEmail}?subject=Export Enquiry from BizGrowth&body=Hello, I found your listing on BizGrowth and I'm interested in your export products/services.`}
                className="block w-full text-center bg-white text-orange-600 font-extrabold py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-sm">
                Send Export Enquiry →
              </a>
            )}
          </div>

          {/* Listing Meta */}
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
              <Link to={`/india-to-global/${id}/edit`}
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
