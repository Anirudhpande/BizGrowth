import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ConsultantSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profile Form States
  const [profileExists, setProfileExists] = useState(false);
  const [tagline, setTagline] = useState('');
  const [expertise, setExpertise] = useState('');
  const [certifications, setCertifications] = useState('');
  const [languages, setLanguages] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [minEngagement, setMinEngagement] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Weekly Slots State
  // Array of 7 days: day_of_week, start_time, end_time, is_available
  const [weeklySlots, setWeeklySlots] = useState(() => 
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: '09:00',
      end_time: '17:00',
      is_available: i > 0 && i < 6 // Mon-Fri default available
    }))
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchProfileAndAvailability = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Get profile
        let existingProfile = null;
        try {
          const profRes = await api.get('/api/consultants/me');
          if (profRes && profRes.success && profRes.data) {
            existingProfile = profRes.data;
          } else if (profRes && profRes.id) {
            existingProfile = profRes;
          }
        } catch (e) {
          // Profile not created yet (404)
        }

        if (existingProfile) {
          setProfileExists(true);
          setTagline(existingProfile.tagline || '');
          setHourlyRate(existingProfile.hourly_rate ? existingProfile.hourly_rate.toString() : '');
          setAvailabilityStatus(existingProfile.availability || 'available');
          setMinEngagement(existingProfile.min_engagement || '');
          setPortfolioUrl(existingProfile.portfolio_url || '');

          setExpertise(Array.isArray(existingProfile.expertise) ? existingProfile.expertise.join(', ') : '');
          setCertifications(Array.isArray(existingProfile.certifications) ? existingProfile.certifications.join(', ') : '');
          setLanguages(Array.isArray(existingProfile.languages) ? existingProfile.languages.join(', ') : '');
        }

        // 2. Get availability weekly slots
        try {
          const availRes = await api.get(`/api/availability/${user.id}`);
          if (availRes && availRes.slots && Array.isArray(availRes.slots)) {
            // Map slots from backend
            const mappedSlots = Array.from({ length: 7 }, (_, i) => {
              const matched = availRes.slots.find(s => s.day_of_week === i);
              return matched 
                ? { 
                    day_of_week: i, 
                    start_time: matched.start_time || '09:00', 
                    end_time: matched.end_time || '17:00', 
                    is_available: !!matched.is_available 
                  }
                : { day_of_week: i, start_time: '09:00', end_time: '17:00', is_available: false };
            });
            setWeeklySlots(mappedSlots);
          }
        } catch (availErr) {
          console.warn('No availability calendar found (will create on save):', availErr);
        }

      } catch (err) {
        console.error('Failed to load profile details:', err);
        setError('Failed to fetch consultant profile information.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileAndAvailability();
    }
  }, [user]);

  const handleSlotChange = (dayIndex, field, value) => {
    setWeeklySlots(prev => prev.map((s, idx) => {
      if (idx === dayIndex) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Parse array inputs
    const expArray = expertise.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const certArray = certifications.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const langArray = languages.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const profilePayload = {
      tagline,
      expertise: expArray,
      certifications: certArray,
      languages: langArray,
      hourly_rate: parseFloat(hourlyRate) || 0,
      currency: 'INR',
      availability: availabilityStatus,
      min_engagement: minEngagement,
      portfolio_url: portfolioUrl
    };

    try {
      // 1. Create/Update Profile
      if (profileExists) {
        await api.patch('/api/consultants/profile', profilePayload);
      } else {
        await api.post('/api/consultants/profile', profilePayload);
      }

      // 2. Create/Update Availability schedule
      try {
        const availPayload = {
          consultantId: user.id,
          slots: weeklySlots,
          timezone: 'Asia/Kolkata',
          maxConsultationsPerDay: 10
        };

        // Try updating slots
        try {
          await api.put(`/api/availability/${user.id}/slots`, { slots: weeklySlots });
        } catch (updateErr) {
          // If update fail (availability does not exist yet), call create post
          await api.post('/api/availability', availPayload);
        }
      } catch (availErr) {
        console.error('Availability schedule save failed:', availErr);
        // Do not crash the entire flow if availability slots failed to sync, but warn
        setError('Profile saved, but calendar slots could not sync. Check calendar setup in Dashboard.');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(err.message || 'Onboarding failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading onboarding portal...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-md space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">
            {profileExists ? 'Update Consultant Profile' : 'Become a Business Consultant'}
          </h2>
          <p className="text-body-sm text-on-surface-variant font-medium">
            Setup your hourly rates, bio, specialties, and weekly calendar slots so clients can book consulting sessions.
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-3 rounded-xl text-body-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="font-bold text-primary text-body-lg border-b border-outline-variant/15 pb-2">1. Profile Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tagline */}
            <div className="col-span-2">
              <label htmlFor="consultant-tagline" className="block text-body-sm font-bold text-primary mb-1.5">
                Tagline / Professional Summary
              </label>
              <input
                id="consultant-tagline"
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Pre-Seed Pitch Deck & Go-To-Market Consultant for FinTech startups"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Hourly Rate */}
            <div>
              <label htmlFor="consultant-rate" className="block text-body-sm font-bold text-primary mb-1.5">
                Hourly Rate (INR)
              </label>
              <input
                id="consultant-rate"
                type="number"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Availability status */}
            <div>
              <label htmlFor="consultant-status" className="block text-body-sm font-bold text-primary mb-1.5">
                Current Availability
              </label>
              <select
                id="consultant-status"
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                <option value="available">Available (Booking calendar active)</option>
                <option value="busy">Busy (Temporary pause)</option>
                <option value="unavailable">Unavailable (Disabled bookings)</option>
              </select>
            </div>

            {/* Expertise */}
            <div>
              <label htmlFor="consultant-expertise" className="block text-body-sm font-bold text-primary mb-1.5">
                Expertise / Specialties (Comma-separated)
              </label>
              <input
                id="consultant-expertise"
                type="text"
                required
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g. pitch decks, marketing, fundraising"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Certifications */}
            <div>
              <label htmlFor="consultant-certs" className="block text-body-sm font-bold text-primary mb-1.5">
                Certifications (Comma-separated)
              </label>
              <input
                id="consultant-certs"
                type="text"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="e.g. MBA Finance, CFA L3"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Languages */}
            <div>
              <label htmlFor="consultant-langs" className="block text-body-sm font-bold text-primary mb-1.5">
                Languages (Comma-separated)
              </label>
              <input
                id="consultant-langs"
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, Hindi, German"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label htmlFor="consultant-portfolio" className="block text-body-sm font-bold text-primary mb-1.5">
                Portfolio / LinkedIn URL
              </label>
              <input
                id="consultant-portfolio"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="e.g. https://linkedin.com/in/username"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>

          <h3 className="font-bold text-primary text-body-lg border-b border-outline-variant/15 pb-2 pt-4">2. Weekly Time Slots</h3>
          <div className="space-y-3">
            {weeklySlots.map((slot, i) => (
              <div 
                key={slot.day_of_week} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low"
              >
                <div className="flex items-center gap-3 font-semibold text-body-sm text-primary">
                  <input
                    id={`available-checkbox-${slot.day_of_week}`}
                    type="checkbox"
                    checked={slot.is_available}
                    onChange={(e) => handleSlotChange(i, 'is_available', e.target.checked)}
                    className="w-5 h-5 rounded focus:ring-secondary text-secondary"
                  />
                  <label htmlFor={`available-checkbox-${slot.day_of_week}`} className="w-24 cursor-pointer">{daysOfWeekNames[slot.day_of_week]}</label>
                </div>

                {slot.is_available ? (
                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <input
                      aria-label="Start Time"
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => handleSlotChange(i, 'start_time', e.target.value)}
                      className="bg-surface border border-outline-variant text-primary text-body-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-secondary transition-all"
                    />
                    <span className="text-on-surface-variant">to</span>
                    <input
                      aria-label="End Time"
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => handleSlotChange(i, 'end_time', e.target.value)}
                      className="bg-surface border border-outline-variant text-primary text-body-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                ) : (
                  <span className="text-[12px] text-on-surface-variant/50 font-bold uppercase tracking-wider select-none py-1.5">
                    Closed / Unavailable
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/15">
            <Link
              to="/dashboard"
              className="border border-outline text-primary hover:bg-surface-container-high px-6 py-2.5 rounded-full font-bold text-body-sm transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-secondary text-white hover:bg-secondary/90 px-8 py-2.5 rounded-full font-bold text-body-sm transition-all shadow-md flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                profileExists ? 'Update Profile' : 'Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
