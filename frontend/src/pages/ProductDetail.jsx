import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProductPaymentModal from '../components/ProductPaymentModal';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res?.data || null);
      } catch {
        setError('Could not load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/products/${id}`);
      navigate('/products');
    } catch {
      alert('Failed to delete product.');
      setDeleting(false);
    }
  };

  const handlePurchaseSuccess = async () => {
    setShowPaymentModal(false);
    setPurchaseSuccess(true);
    // Refresh product details
    try {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res?.data || null);
    } catch {
      // non-blocking
    }
  };

  const isOwner = user && product && user.id === product.userId;
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-on-surface-variant font-semibold">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto py-32 text-center">
        <span className="text-6xl">😕</span>
        <h2 className="font-headline-md text-headline-md font-bold text-primary mt-4">{error || 'Product not found'}</h2>
        <Link to="/products" className="mt-6 inline-block text-emerald-600 hover:underline font-semibold">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to="/products" className="hover:text-emerald-600 transition-colors font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          Products Marketplace
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-bold text-primary">{product.name}</span>
      </div>

      {purchaseSuccess && (
        <div className="bg-emerald-50 border border-emerald-200/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 text-emerald-800 animate-fade-in shadow-sm">
          <span className="material-symbols-outlined text-4xl text-emerald-600">task_alt</span>
          <div className="space-y-1 text-center md:text-left flex-1">
            <h4 className="font-bold text-lg">Purchase Complete!</h4>
            <p className="text-sm text-emerald-700/90">
              Your payment has been successfully processed. The seller has been notified and will contact you shortly to coordinate delivery.
            </p>
          </div>
          <button 
            onClick={() => setPurchaseSuccess(false)}
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="w-full h-96 bg-surface-container-low flex items-center justify-center border-b border-outline-variant/10 relative">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant/30">
                  <span className="material-symbols-outlined text-7xl">inventory_2</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">No Image Available</span>
                </div>
              )}

              {/* Target Market Pill */}
              <div className="absolute top-4 left-4 z-10">
                {product.targetMarket === 'domestic' && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/50 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    🇮🇳 Domestic Market
                  </span>
                )}
                {product.targetMarket === 'global' && (
                  <span className="bg-blue-100 text-blue-800 border border-blue-200/50 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    🌐 Global Market
                  </span>
                )}
                {product.targetMarket === 'both' && (
                  <span className="bg-purple-100 text-purple-800 border border-purple-200/50 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    🤝 Domestic &amp; Global Markets
                  </span>
                )}
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant">
                  {product.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary pt-1">{product.name}</h1>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                  <span className="material-symbols-outlined">description</span>
                  Product Description
                </h3>
                <p className="text-on-surface-variant leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {product.description || 'No description provided for this product.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Sales & Seller Info */}
        <div className="space-y-6">
          {/* Price & Checkout Card */}
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant/60 block font-semibold">UNIT PRICE</span>
              <div className="text-3xl font-extrabold text-emerald-700 flex items-baseline gap-2">
                {product.currency} {product.price.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-container/60 border border-outline-variant/20 p-3.5 rounded-xl text-sm">
              <span className="text-on-surface-variant font-semibold">Availability</span>
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-error font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">block</span>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Buying logic */}
            {isOwner ? (
              <div className="space-y-3">
                <p className="text-xs text-on-surface-variant text-center bg-surface-container p-2 rounded-xl">
                  You listed this product. You can update or delete it.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/products/${product.id}/edit`}
                    className="bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-500 transition-all text-sm text-center shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="border border-error text-error hover:bg-error/5 font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={product.stock <= 0}
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-full hover:bg-emerald-500 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                Buy Now
              </button>
            )}

            {/* Admin Delete Action if admin is not owner */}
            {!isOwner && isAdmin && (
              <div className="border-t border-outline-variant/10 pt-4">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full border border-error/50 text-error hover:bg-error/5 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  {deleting ? 'Deleting...' : 'Admin: Delete Listing'}
                </button>
              </div>
            )}
          </div>

          {/* Seller Profile Card */}
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-2">
              <span className="material-symbols-outlined">contact_mail</span>
              Seller Information
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-on-surface-variant/60 block">Contact Person</span>
                <span className="font-bold text-primary">{product.sellerName || 'Verified Seller'}</span>
              </div>
              {product.sellerCompany && (
                <div>
                  <span className="text-xs text-on-surface-variant/60 block">Company</span>
                  <span className="font-semibold text-primary">{product.sellerCompany}</span>
                </div>
              )}
              <div className="pt-2 border-t border-outline-variant/10 space-y-2">
                {product.sellerEmail && (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    <a href={`mailto:${product.sellerEmail}`} className="hover:text-emerald-600 transition-colors font-semibold text-xs truncate">
                      {product.sellerEmail}
                    </a>
                  </div>
                )}
                {product.sellerPhone && (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    <span className="font-semibold text-xs">{product.sellerPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Payment Modal */}
      {showPaymentModal && (
        <ProductPaymentModal
          listing={{
            id: product.id,
            title: product.name,
            currency: product.currency,
          }}
          amount={product.price}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
