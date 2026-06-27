import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import ImageUpload from '../components/ImageUpload';

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

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'SGD', 'AED'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  currency: 'INR',
  category: '',
  targetMarket: 'both', // 'domestic', 'global', 'both'
  imageUrl: '',
  stock: 1,
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        const d = res?.data;
        if (d) {
          setForm({
            name: d.name || '',
            description: d.description || '',
            price: d.price || '',
            currency: d.currency || 'INR',
            category: d.category || '',
            targetMarket: d.targetMarket || 'both',
            imageUrl: d.imageUrl || '',
            stock: d.stock !== undefined ? d.stock : 1,
          });
        }
      } catch {
        setError('Failed to load product details for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value === '' ? '' : Number(value) }));
  };

  const handleUploadSuccess = (url) => {
    setForm((f) => ({ ...f, imageUrl: url }));
  };

  const handleUploadError = (msg) => {
    setError(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || form.price === '' || !form.category || !form.targetMarket) {
      setError('Please fill in all required fields (marked with *).');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/api/products/${id}`, form);
      } else {
        await api.post('/api/products', form);
      }
      navigate('/products');
    } catch (err) {
      setError(err.message || 'Failed to save product listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-on-surface-variant font-semibold">Loading product info...</span>
      </div>
    );
  }

  const steps = ['Product Info', 'Pricing & Market', 'Product Image'];

  return (
    <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-3">
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          <span>Products Marketplace</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-bold text-primary">{isEdit ? 'Edit Product' : 'New Product'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-primary">
          {isEdit ? '✏️ Edit Your Product' : '🛍️ List Your Product'}
        </h1>
        <p className="text-on-surface-variant text-body-md">
          {isEdit ? 'Update your product listing details.' : 'Offer your products to domestic and global B2B buyers.'}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-outline-variant/30 -z-0" />
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i + 1)}
            className="relative z-10 flex flex-col items-center gap-1.5 group transition-all"
          >
            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold border-2 transition-all ${step === i + 1 ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-400/30' : step > i + 1 ? 'bg-green-500 border-green-500 text-white' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
              {step > i + 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
            </span>
            <span className={`text-xs font-bold hidden sm:block ${step === i + 1 ? 'text-emerald-600' : 'text-on-surface-variant/60'}`}>{s}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 text-on-error-container px-5 py-3 rounded-xl font-semibold text-sm mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Product Info */}
        {step === 1 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">info</span>
              Product General Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Product Name *</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Premium Grade Organic Cotton"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all" 
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Category *</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Product Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  rows={5}
                  placeholder="Describe your product details, specifications, minimum order quantity, packaging, etc..."
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Market */}
        {step === 2 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">payments</span>
              Pricing &amp; Market Scope
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Price *</label>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price} 
                  onChange={handleNumberChange} 
                  placeholder="e.g. 500"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Currency</label>
                <select 
                  name="currency" 
                  value={form.currency} 
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all"
                >
                  {CURRENCIES.map((cur) => <option key={cur} value={cur}>{cur}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Target Market Scope *</label>
                <select 
                  name="targetMarket" 
                  value={form.targetMarket} 
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="domestic">Domestic Only (India)</option>
                  <option value="global">Global Only (Export)</option>
                  <option value="both">Both Domestic &amp; Global</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Initial Stock Qty</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={form.stock} 
                  onChange={handleNumberChange} 
                  placeholder="e.g. 10"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Product Image */}
        {step === 3 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">image</span>
              Product Photo
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">Upload Image</label>
              <ImageUpload 
                onUploadSuccess={handleUploadSuccess} 
                onUploadError={handleUploadError} 
                defaultPreview={form.imageUrl}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="border border-outline-variant/60 text-primary py-2.5 px-6 rounded-xl hover:bg-surface-container-high transition-colors font-bold text-sm disabled:opacity-40"
          >
            Back
          </button>
          
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              className="bg-emerald-600 text-white py-2.5 px-6 rounded-xl hover:bg-emerald-500 transition-colors font-bold text-sm flex items-center gap-1"
            >
              Next
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white py-2.5 px-6 rounded-xl hover:bg-emerald-500 transition-colors font-bold text-sm shadow-md flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  List Product
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
