import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';

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

const INDIAN_MARKETS = [
  'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune',
  'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'PAN India',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD', 'CAD', 'AED', 'CNY', 'CHF'];

const emptyForm = {
  companyName: '',
  countryOfOrigin: '',
  productCategory: '',
  description: '',
  products: '',
  services: '',
  targetIndianMarkets: [],
  priceRange: '',
  currency: 'USD',
  website: '',
  contactEmail: '',
  contactPhone: '',
  certifications: '',
};

export default function GlobalTradeForm() {
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
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/global-trade/${id}`);
        const d = res?.data;
        if (d) {
          setForm({
            companyName: d.companyName || '',
            countryOfOrigin: d.countryOfOrigin || '',
            productCategory: d.productCategory || '',
            description: d.description || '',
            products: (d.products || []).join(', '),
            services: (d.services || []).join(', '),
            targetIndianMarkets: d.targetIndianMarkets || [],
            priceRange: d.priceRange || '',
            currency: d.currency || 'USD',
            website: d.website || '',
            contactEmail: d.contactEmail || '',
            contactPhone: d.contactPhone || '',
            certifications: (d.certifications || []).join(', '),
          });
        }
      } catch (err) {
        setError('Failed to load listing for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toggleMarket = (market) => {
    setForm((f) => ({
      ...f,
      targetIndianMarkets: f.targetIndianMarkets.includes(market)
        ? f.targetIndianMarkets.filter((m) => m !== market)
        : [...f.targetIndianMarkets, market],
    }));
  };

  const parseList = (str) =>
    str.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.companyName || !form.countryOfOrigin || !form.productCategory || !form.description) {
      setError('Please fill in all required fields (marked with *).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        products: parseList(form.products),
        services: parseList(form.services),
        certifications: parseList(form.certifications),
      };
      if (isEdit) {
        await api.patch(`/api/global-trade/${id}`, payload);
      } else {
        await api.post('/api/global-trade', payload);
      }
      navigate('/global-to-india');
    } catch (err) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-on-surface-variant font-semibold">Loading listing…</span>
      </div>
    );
  }

  const steps = ['Company Info', 'Products & Services', 'Market & Contact'];

  return (
    <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-3">
          <span className="material-symbols-outlined text-[16px]">public</span>
          <span>Global → India</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-bold text-primary">{isEdit ? 'Edit Listing' : 'New Listing'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-primary">
          {isEdit ? '✏️ Edit Your Global Listing' : '🌍 List Your Global Business'}
        </h1>
        <p className="text-on-surface-variant text-body-md">
          {isEdit ? 'Update your global business listing for the Indian market.' : 'Showcase your company's products and services to Indian businesses and customers.'}
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
            className={`relative z-10 flex flex-col items-center gap-1.5 group transition-all`}
          >
            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold border-2 transition-all ${step === i + 1 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-400/30' : step > i + 1 ? 'bg-green-500 border-green-500 text-white' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
              {step > i + 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
            </span>
            <span className={`text-xs font-bold hidden sm:block ${step === i + 1 ? 'text-blue-600' : 'text-on-surface-variant/60'}`}>{s}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 text-on-error-container px-5 py-3 rounded-xl font-semibold text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Company Info */}
        {step === 1 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">business</span>
              Company Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Company Name *</label>
                <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Acme Global Inc."
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Country of Origin *</label>
                <select name="countryOfOrigin" value={form.countryOfOrigin} onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all">
                  <option value="">Select Country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Product / Industry Category *</label>
                <select name="productCategory" value={form.productCategory} onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all">
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Business Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                  placeholder="Describe your company, what you offer, and why Indian businesses should connect with you…"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Certifications</label>
                <input name="certifications" value={form.certifications} onChange={handleChange}
                  placeholder="ISO 9001, CE Marking, FDA (comma-separated)"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Website</label>
                <input name="website" value={form.website} onChange={handleChange} placeholder="https://yourcompany.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Products & Services */}
        {step === 2 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">inventory_2</span>
              Products &amp; Services
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Products (comma-separated)</label>
                <textarea name="products" value={form.products} onChange={handleChange} rows={3}
                  placeholder="e.g. CNC Machines, Industrial Pumps, Automation Software"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Services (comma-separated)</label>
                <textarea name="services" value={form.services} onChange={handleChange} rows={3}
                  placeholder="e.g. Technical Support, Installation, Training, After-sales Service"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all resize-none" />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="border border-outline text-primary px-6 py-3 rounded-full font-bold hover:bg-surface-container-low transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
              </button>
              <button type="button" onClick={() => setStep(3)}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Market & Contact */}
        {step === 3 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">contact_page</span>
              Market Reach &amp; Contact
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Target Indian Markets</label>
                <div className="flex flex-wrap gap-2">
                  {INDIAN_MARKETS.map((m) => (
                    <button key={m} type="button" onClick={() => toggleMarket(m)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${form.targetIndianMarkets.includes(m) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-blue-400'}`}>
                      🇮🇳 {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">Price Range</label>
                  <input name="priceRange" value={form.priceRange} onChange={handleChange} placeholder="e.g. $5,000 - $50,000"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">Currency</label>
                  <select name="currency" value={form.currency} onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">Contact Email</label>
                  <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="trade@yourcompany.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">Contact Phone</label>
                  <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+1 (555) 000-0000"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(2)}
                className="border border-outline text-primary px-6 py-3 rounded-full font-bold hover:bg-surface-container-low transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
              </button>
              <button type="submit" disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-3 rounded-full font-extrabold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-400/30 disabled:opacity-60 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">{saving ? 'hourglass_empty' : 'check_circle'}</span>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Listing'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
