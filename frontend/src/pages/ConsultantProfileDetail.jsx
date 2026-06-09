import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BookingFlowModal from '../components/BookingFlowModal';
import PaymentModal from '../components/PaymentModal';

export default function ConsultantProfileDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Transaction States
  const [bookingService, setBookingService] = useState(null);
  const [unpaidBooking, setUnpaidBooking] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const fetchProfileDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch profile
      const profRes = await api.get(`/api/consultants/${id}`);
      if (profRes && profRes.success && profRes.data) {
        setProfile(profRes.data);
      } else {
        throw new Error('Profile not found.');
      }

      // 2. Fetch services
      const servRes = await api.get(`/api/consultants/${id}/services`);
      if (servRes && servRes.success) {
        setServices(servRes.data || []);
      }

      // 3. Fetch reviews
      try {
        const revRes = await api.get(`/api/reviews/consultant/${id}`);
        if (revRes && revRes.reviews) {
          setReviews(revRes.reviews);
        } else if (revRes && revRes.success && Array.isArray(revRes.data)) {
          setReviews(revRes.data);
        }
      } catch (e) {
        console.warn('Reviews fetch failed:', e);
      }

      // 4. Fetch stats
      try {
        const statsRes = await api.get(`/api/reviews/consultant/${id}/stats`);
        if (statsRes) {
          setStats(statsRes);
        }
      } catch (e) {
        console.warn('Stats fetch failed:', e);
      }

    } catch (err) {
      console.error('Error loading consultant profile:', err);
      setError(err.message || 'Failed to load consultant details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading consultant profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold">
          {error || 'Consultant profile not found'}
        </div>
        <Link to="/consultants" className="text-secondary font-bold hover:underline">
          Back to Consultant Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-6">
      
      {/* Back Link */}
      <Link to="/consultants" className="text-secondary font-bold text-body-sm flex items-center gap-1 hover:underline">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Expert Consultants
      </Link>

      {paymentCompleted && (
        <div className="bg-green-100 border border-green-200 text-green-800 p-5 rounded-2xl text-body-sm font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-800 text-[24px]">check_circle</span>
            <span>Your booking session has been successfully booked and paid for! Review status in your dashboard.</span>
          </div>
          <button 
            onClick={() => setPaymentCompleted(false)} 
            className="text-green-800 hover:text-green-950 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Span): Profile details, Services & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info Card */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center text-primary font-bold border border-outline-variant/20 shrink-0">
                  <span className="material-symbols-outlined text-[36px]">account_circle</span>
                </div>
                <div className="space-y-1">
                  <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight flex items-center gap-2">
                    Expert Consultant
                    {profile.is_verified && (
                      <span className="material-symbols-outlined text-[20px] text-secondary icon-fill">verified</span>
                    )}
                  </h2>
                  <p className="text-body-md text-on-surface-variant font-semibold">{profile.tagline}</p>
                </div>
              </div>
              
              <div className="bg-surface border border-outline-variant/30 px-5 py-3 rounded-2xl text-center self-stretch sm:self-auto flex flex-col justify-center min-w-[120px]">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Hourly Rate</span>
                <span className="font-headline-md text-headline-md font-bold text-secondary mt-0.5">
                  {profile.currency || 'INR'} {profile.hourly_rate ? parseFloat(profile.hourly_rate).toFixed(0) : 'Free'}
                </span>
              </div>
            </div>

            {/* Specialties & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/15 text-body-sm">
              <div className="space-y-2">
                <h4 className="font-bold text-primary">Specialties & Expertise</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.expertise && profile.expertise.length > 0 ? (
                    profile.expertise.map(exp => (
                      <span key={exp} className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-lg font-medium text-xs">
                        {exp}
                      </span>
                    ))
                  ) : (
                    <span className="text-on-surface-variant/60">No specialties listed.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-primary">Spoken Languages</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.languages && profile.languages.length > 0 ? (
                    profile.languages.map(lang => (
                      <span key={lang} className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-lg font-medium text-xs">
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-on-surface-variant/60">English</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Services Offered Section */}
          <div className="space-y-4">
            <h3 className="font-headline-md text-headline-md text-primary font-bold">Consulting Services</h3>
            {services.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant bg-surface-container-low border border-outline-variant/30 rounded-2xl">
                <p className="text-body-sm font-medium">No active packages offered by this consultant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-primary text-body-md pr-4 leading-tight">{service.title}</h4>
                        <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold shrink-0">
                          {service.duration_hours ? `${service.duration_hours} hr` : '60 min'}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant/85 line-clamp-3">{service.description}</p>
                    </div>
                    
                    <div className="border-t border-outline-variant/15 pt-4 mt-6 flex justify-between items-center">
                      <span className="font-headline-md text-headline-md font-bold text-secondary">
                        {service.currency || 'INR'} {parseFloat(service.price).toFixed(0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            alert('Please login to book a session.');
                            return;
                          }
                          setBookingService(service);
                        }}
                        className="bg-secondary hover:bg-secondary/90 text-white font-bold text-body-sm px-5 py-2 rounded-full transition-colors shadow"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Reviews Section */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-headline-md text-headline-md text-primary font-bold">Client Feedback & Reviews</h3>
            
            {reviews.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant font-medium py-4">No reviews recorded for this consultant.</p>
            ) : (
              <div className="divide-y divide-outline-variant/15">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-4 space-y-2 text-body-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-tertiary">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span 
                              key={i} 
                              className={`material-symbols-outlined text-[18px] ${i < rev.rating ? 'icon-fill' : ''}`}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="font-bold text-primary">{rev.title}</span>
                      </div>
                      <span className="text-xs text-on-surface-variant/60">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-on-surface-variant/90 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Mini Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-primary text-body-lg">Ratings Overview</h3>
            
            {stats ? (
              <div className="space-y-4 text-center">
                <div className="space-y-1">
                  <h4 className="text-5xl font-extrabold text-secondary">
                    {stats.averageRating ? parseFloat(stats.averageRating).toFixed(1) : '0.0'}
                  </h4>
                  <p className="text-body-sm text-on-surface-variant font-semibold">Out of 5 stars</p>
                </div>

                <div className="flex justify-center text-tertiary">
                  {Array.from({ length: 5 }, (_, i) => {
                    const avg = parseFloat(stats.averageRating || '0');
                    const isFilled = i < Math.round(avg);
                    return (
                      <span key={i} className={`material-symbols-outlined text-2xl ${isFilled ? 'icon-fill' : ''}`}>
                        star
                      </span>
                    );
                  })}
                </div>

                <p className="text-body-sm text-on-surface-variant font-medium border-t border-outline-variant/15 pt-3">
                  Based on <strong>{stats.totalReviews} reviews</strong> left by verified clients.
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-on-surface-variant/60 text-body-sm">
                No ratings metrics recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RENDER MODAL FLOWS */}
      {bookingService && (
        <BookingFlowModal
          consultantId={profile.user_id} // we book based on user_id references in bookings
          consultantName="Verified Expert"
          service={bookingService}
          onClose={() => setBookingService(null)}
          onSuccess={(newBooking) => {
            setBookingService(null);
            setUnpaidBooking(newBooking);
          }}
        />
      )}

      {unpaidBooking && (
        <PaymentModal
          booking={unpaidBooking}
          amount={bookingService?.price || 1500}
          serviceName={bookingService?.title || 'Consultation Session'}
          consultantName="Verified Expert"
          onClose={() => setUnpaidBooking(null)}
          onSuccess={() => {
            setUnpaidBooking(null);
            setPaymentCompleted(true);
            fetchProfileDetails(); // refresh reviews/stats
          }}
        />
      )}
    </div>
  );
}
