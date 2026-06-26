import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';

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

const GLOBAL_REGIONS = [
  'North America', 'Europe', 'Middle East', 'Southeast Asia', 'Africa',
  'Australia & Oceania', 'South America', 'East Asia', 'Global (Anywhere)',
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

const emptyForm = {
  companyName: '',
  indianState: '',
  city: '',
  productCategory: '',
  description: '',
  products: '',
  services: '',
  targetGlobalMarkets: [],
  priceRange: '',
  currency: 'USD',
  exportCertifications: '',
  gstNumber: '',
  iecCode: '',
  website: '',
  contactEmail: '',
  contactPhone: '',
};

export default function IndiaTradeForm() {
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
        const res = await api.get(`/api/india-trade/${id}`);
        const d = res?.data;
        if (d) {
          setForm({
            companyName: d.companyName || '',
            indianState: d.indianState || '',
            city: d.city || '',
            productCategory: d.productCategory || '',
            description: d.description || '',
            products: (d.products || []).join(', '),
            services: (d.services || []).join(', '),
            targetGlobalMarkets: d.targetGlobalMarkets || [],
            priceRange: d.priceRange || '',
            currency: d.currency || 'USD',
            exportCertifications: (d.exportCertifications || []).join(', '),
            gstNumber: d.gstNumber || '',
            iecCode: d.iecCode || '',
            website: d.website || '',
            contactEmail: d.contactEmail || '',
            contactPhone: d.contactPhone || '',
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
      targetGlobalMarkets: f.targetGlobalMarkets.includes(market)
        ? f.targetGlobalMarkets.filter((m) => m !== market)
        : [...f.targetGlobalMarkets, market],
    }));
  };

  const parseList = (str) =>
    str.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.companyName || !form.indianState || !form.productCategory || !form.description) {
      setError('Please fill in all required fields (marked with *).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        products: parseList(form.products),
        services: parseList(form.services),
        exportCertifications: parseList(form.exportCertifications),
      };
      if (isEdit) {
        await api.patch(`/api/india-trade/${id}`, payload);
      } else {
        await api.post('/api/india-trade', payload);
      }
      navigate('/india-to-global');
    } catch (err) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-on-surface-variant font-semibold">Loading listing…</span>
      </div>
    );
  }

  const steps = ['Business Details', 'Export Offerings', 'Compliance & Markets'];

  return (
    <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-3">
          <span>🇮🇳</span>
          <span>India → Global</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-bold text-primary">{isEdit ? 'Edit Listing' : 'New Listing'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-primary">
          {isEdit ? '✏️ Edit Your Export Profile' : '🇮🇳 Showcase Your Business Globally'}
        </h1>
        <p className="text-on-surface-variant text-body-md">
          {isEdit ? 'Update your Indian business export listing.' : 'Create an export profile to reach international buyers and partners.'}
        </p>
      </div>

      {/* Step Indicator (Tricolour theme) */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-outline-variant/30 -z-0" />
        {steps.map((s, i) => {
          let stepColor = 'bg-surface border-outline-variant text-on-surface-variant';
          let activeColor = 'bg-orange-600 border-orange-600 shadow-orange-400/30 text-white';
          
          if (step > i + 1) {
            stepColor = 'bg-green-500 border-green-500 text-white';
          } else if (step === i + 1) {
            stepColor = activeColor;
          }

          return (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i + 1)}
              className={`relative z-10 flex flex-col items-center gap-1.5 group transition-all`}
            >
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold border-2 transition-all shadow-sm ${stepColor}`}>
                {step > i + 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
              </span>
              <span className={`text-xs font-bold hidden sm:block ${step === i + 1 ? 'text-orange-600' : 'text-on-surface-variant/60'}`}>{s}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 text-on-error-container px-5 py-3 rounded-xl font-semibold text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">storefront</span>
              Indian Business Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Company Name *</label>
                <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Bharat Exports Pvt Ltd"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">State (India) *</label>
                <select name="indianState" value={form.indianState} onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Primary Sector / Category *</label>
                <select name="productCategory" value={form.productCategory} onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all">
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Business Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                  placeholder="Describe your manufacturing capabilities, scale, quality standards, and why international buyers should work with you…"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all resize-none" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Website</label>
                <input name="website" value={form.website} onChange={handleChange} placeholder="https://yourcompany.in"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setStep(2)}
                className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-all flex items-center gap-2">
                Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Export Offerings */}
        {step === 2 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">inventory_2</span>
              Export Offerings
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Export Products (comma-separated)</label>
                <textarea name="products" value={form.products} onChange={handleChange} rows={3}
                  placeholder="e.g. Cotton Textiles, Spices, Auto Parts, IT Hardware"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Export Services (comma-separated)</label>
                <textarea name="services" value={form.services} onChange={handleChange} rows={3}
                  placeholder="e.g. Software Development, BPO, Engineering Design"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">Typical Order Value / Price Range</label>
                  <input name="priceRange" value={form.priceRange} onChange={handleChange} placeholder="e.g. $10,000 - $100,000"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">Preferred Currency</label>
                  <select name="currency" value={form.currency} onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="border border-outline text-primary px-6 py-3 rounded-full font-bold hover:bg-surface-container-low transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
              </button>
              <button type="button" onClick={() => setStep(3)}
                className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-all flex items-center gap-2">
                Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Compliance & Markets */}
        {step === 3 && (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">public</span>
              Compliance &amp; Target Markets
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Target Global Markets</label>
                <div className="flex flex-wrap gap-2">
                  {GLOBAL_REGIONS.map((m) => (
                    <button key={m} type="button" onClick={() => toggleMarket(m)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${form.targetGlobalMarkets.includes(m) ? 'bg-orange-600 border-orange-600 text-white' : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-orange-400'}`}>
                      🌍 {m}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">IEC Code (Import Export Code)</label>
                  <input name="iecCode" value={form.iecCode} onChange={handleChange} placeholder="10-digit IEC"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">GST Number</label>
                  <input name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="15-digit GSTIN"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant">Export Certifications</label>
                <input name="exportCertifications" value={form.exportCertifications} onChange={handleChange}
                  placeholder="ISO, FIEO, RCMC, CE (comma-separated)"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">Export Contact Email</label>
                  <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="exports@yourcompany.in"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-on-surface-variant">Export Contact Phone</label>
                  <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+91 98765 43210"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-all" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 mt-4 border-t border-outline-variant/30">
              <button type="button" onClick={() => setStep(2)}
                className="border border-outline text-primary px-6 py-3 rounded-full font-bold hover:bg-surface-container-low transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
              </button>
              <button type="submit" disabled={saving}
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-10 py-3 rounded-full font-extrabold hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-400/30 disabled:opacity-60 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">{saving ? 'hourglass_empty' : 'check_circle'}</span>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Export Profile'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
