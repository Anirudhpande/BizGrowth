import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PaymentModal from '../components/PaymentModal';
import ReviewModal from '../components/ReviewModal';
import ImageUpload from '../components/ImageUpload';
import RecommendationsWidget from '../components/RecommendationsWidget';


export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tab);
    }
  }, [location.search]);

  // Consultant Profile State
  const [consultantProfile, setConsultantProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Data States
  const [notifications, setNotifications] = useState([]);
  const [clientBookings, setClientBookings] = useState([]);
  const [consultantBookings, setConsultantBookings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Availability States
  const [weeklySlots, setWeeklySlots] = useState([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [maxConsultations, setMaxConsultations] = useState(10);
  const [blockedDates, setBlockedDates] = useState([]);
  const [breakTimes, setBreakTimes] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBreakStart, setNewBreakStart] = useState('12:00');
  const [newBreakEnd, setNewBreakEnd] = useState('13:00');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Portfolio States
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [showPortForm, setShowPortForm] = useState(false);
  const [portEditId, setPortEditId] = useState(null);
  const [portFormData, setPortFormData] = useState({ title: '', description: '', projectUrl: '', imageUrl: '' });
  const [portSubmitting, setPortSubmitting] = useState(false);
  
  // Loading & Error States
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Transaction States
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  // Services Form State (for Consultant tab)
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('60');

  // Check if consultant
  const checkConsultantProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/consultants/me');
      const profile = res?.data || res;
      if (profile && profile.id) {
        setConsultantProfile(profile);
      }
    } catch {
      // Not a consultant or request failed
      setConsultantProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const loadTabData = useCallback(async (tab) => {
    if (!user) return;
    setLoadingData(true);
    setError('');

    try {
      if (tab === 'overview') {
        // Fetch summary metrics
        const listRes = await api.get('/api/marketplace/my');
        setMyListings(listRes?.data || []);
        
        const regEvents = await api.get('/api/events/registered');
        setRegisteredEvents(regEvents?.data || []);

        const clientB = await api.get(`/api/bookings/client/${user.id}`);
        setClientBookings(clientB || []);

        if (consultantProfile) {
          const consB = await api.get(`/api/bookings/consultant/${user.id}`);
          setConsultantBookings(consB || []);
        }
      } else if (tab === 'notifications') {
        const notifs = await api.get(`/api/notifications/user/${user.id}`);
        setNotifications(notifs?.notifications || []);
      } else if (tab === 'bookings') {
        const clientB = await api.get(`/api/bookings/client/${user.id}`);
        setClientBookings(clientB || []);

        if (consultantProfile) {
          const consB = await api.get(`/api/bookings/consultant/${user.id}`);
          setConsultantBookings(consB || []);
        }
      } else if (tab === 'listings') {
        const listRes = await api.get('/api/marketplace/my');
        setMyListings(listRes?.data || []);
      } else if (tab === 'events') {
        const regEvents = await api.get('/api/events/registered');
        setRegisteredEvents(regEvents?.data || []);

        const orgEvents = await api.get('/api/events/my');
        setMyEvents(orgEvents?.data || []);
      } else if (tab === 'services' && consultantProfile) {
        const servRes = await api.get('/api/consultants/services/my');
        setMyServices(servRes?.data || []);
      } else if (tab === 'analytics' && consultantProfile) {
        const res = await api.get('/api/analytics/dashboard');
        setAnalyticsData(res?.data || null);
      } else if (tab === 'schedule' && consultantProfile) {
        try {
          const availRes = await api.get(`/api/availability/${user.id}`);
          if (availRes) {
            setTimezone(availRes.timezone || 'Asia/Kolkata');
            setMaxConsultations(availRes.max_consultations_per_day || 10);
            setBlockedDates(availRes.blocked_dates || []);
            setBreakTimes(availRes.break_times || []);
            
            if (availRes.slots && Array.isArray(availRes.slots)) {
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
            } else {
              setWeeklySlots(Array.from({ length: 7 }, (_, i) => ({
                day_of_week: i, start_time: '09:00', end_time: '17:00', is_available: false
              })));
            }
          } else {
            setWeeklySlots(Array.from({ length: 7 }, (_, i) => ({
              day_of_week: i, start_time: '09:00', end_time: '17:00', is_available: false
            })));
          }
        } catch (availErr) {
          console.warn('No availability calendar found:', availErr);
          setWeeklySlots(Array.from({ length: 7 }, (_, i) => ({
            day_of_week: i, start_time: '09:00', end_time: '17:00', is_available: false
          })));
        }
      } else if (tab === 'portfolio' && consultantProfile) {
        const portRes = await api.get('/api/portfolio/my');
        setPortfolioItems(portRes?.data || []);
      }
    } catch (err) {
      console.error(`Error loading data for tab ${tab}:`, err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoadingData(false);
    }
  }, [user, consultantProfile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkConsultantProfile();
  }, [checkConsultantProfile]);

  useEffect(() => {
    if (!loadingProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadTabData(activeTab);
    }
  }, [activeTab, loadingProfile, loadTabData]);

  // ---- Notifications Actions ----
  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`, { isRead: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch(`/api/notifications/user/${user.id}/mark-all-read`, {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleDeleteAllNotifs = async () => {
    try {
      await api.delete(`/api/notifications/user/${user.id}`);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  };

  // ---- Bookings Actions ----
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/status`, { status });
      // Reload bookings
      loadTabData('bookings');
    } catch (err) {
      console.error('Failed to update booking status:', err);
      alert('Error updating status: ' + err.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.delete(`/api/bookings/${bookingId}`);
      loadTabData('bookings');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Error cancelling booking: ' + err.message);
    }
  };

  // ---- Availability Actions ----
  const handleSlotChange = (index, field, value) => {
    setWeeklySlots(prev => prev.map((s, idx) => idx === index ? { ...s, [field]: value } : s));
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const availPayload = {
        consultantId: user.id,
        slots: weeklySlots,
        timezone,
        maxConsultationsPerDay: parseInt(maxConsultations) || 10
      };

      try {
        await api.put(`/api/availability/${user.id}/slots`, { slots: weeklySlots });
      } catch {
        await api.post('/api/availability', availPayload);
      }
      
      await api.post('/api/availability', availPayload);
      
      alert('Availability settings updated successfully!');
      loadTabData('schedule');
    } catch (err) {
      console.error('Failed to save availability settings:', err);
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    try {
      await api.post(`/api/availability/${user.id}/blocked-dates`, { dates: [newBlockedDate] });
      setNewBlockedDate('');
      loadTabData('schedule');
    } catch (err) {
      console.error('Failed to block date:', err);
    }
  };

  const handleRemoveBlockedDate = async (dateStr) => {
    try {
      await api.delete(`/api/availability/${user.id}/blocked-dates/${dateStr}`);
      loadTabData('schedule');
    } catch (err) {
      console.error('Failed to remove blocked date:', err);
    }
  };

  const handleAddBreakTime = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/availability/${user.id}/break-time`, { startTime: newBreakStart, endTime: newBreakEnd });
      loadTabData('schedule');
    } catch (err) {
      console.error('Failed to add break time:', err);
    }
  };

  // ---- Portfolio Actions ----
  const openPortForm = (item = null) => {
    if (item) {
      setPortEditId(item.id);
      setPortFormData({ title: item.title, description: item.description || '', projectUrl: item.projectUrl || '', imageUrl: item.imageUrl || '' });
    } else {
      setPortEditId(null);
      setPortFormData({ title: '', description: '', projectUrl: '', imageUrl: '' });
    }
    setShowPortForm(true);
  };

  const closePortForm = () => {
    setShowPortForm(false);
    setPortEditId(null);
  };

  const handlePortSave = async (e) => {
    e.preventDefault();
    if (!portFormData.title.trim()) return;
    setPortSubmitting(true);
    try {
      if (portEditId) {
        await api.put(`/api/portfolio/${portEditId}`, portFormData);
      } else {
        await api.post('/api/portfolio', portFormData);
      }
      closePortForm();
      loadTabData('portfolio');
    } catch (err) {
      console.error('Portfolio save failed:', err);
    } finally {
      setPortSubmitting(false);
    }
  };

  const handlePortDelete = async (itemId) => {
    if (!window.confirm('Delete this portfolio item?')) return;
    try {
      await api.delete(`/api/portfolio/${itemId}`);
      loadTabData('portfolio');
    } catch (err) {
      console.error('Portfolio delete failed:', err);
    }
  };

  // ---- Services Actions (Consultant Only) ----
  const handleOpenServiceForm = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.name);
      setServiceDesc(service.description);
      setServicePrice(service.price.toString());
      setServiceDuration(service.duration.toString());
    } else {
      setEditingService(null);
      setServiceName('');
      setServiceDesc('');
      setServicePrice('');
      setServiceDuration('60');
    }
    setShowServiceForm(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: serviceName,
        description: serviceDesc,
        price: parseFloat(servicePrice),
        duration: parseInt(serviceDuration)
      };

      if (editingService) {
        await api.patch(`/api/consultants/services/${editingService.id}`, payload);
      } else {
        await api.post('/api/consultants/services', payload);
      }

      setShowServiceForm(false);
      loadTabData('services');
    } catch (err) {
      console.error('Error saving service:', err);
      alert('Failed to save service: ' + err.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Delete this service permanently?')) return;
    try {
      await api.delete(`/api/consultants/services/${serviceId}`);
      loadTabData('services');
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Failed to delete service: ' + err.message);
    }
  };

  // ---- Events Actions ----
  const handleCancelEventRegistration = async (eventId) => {
    if (!confirm('Cancel registration for this event?')) return;
    try {
      await api.delete(`/api/events/${eventId}/register`);
      loadTabData('events');
    } catch (err) {
      console.error('Failed to cancel registration:', err);
    }
  };

  // ---- Listings Actions ----
  const handleDeleteListing = async (listingId) => {
    if (!confirm('Are you sure you want to delete this marketplace listing?')) return;
    try {
      await api.delete(`/api/marketplace/${listingId}`);
      loadTabData('listings');
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-container to-secondary text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="space-y-1 z-10">
          <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight">User Portal</h2>
          <p className="text-body-md text-white/85">Welcome back, {user?.name}. Manage your business interactions here.</p>
        </div>
        {consultantProfile ? (
          <span className="bg-white/10 backdrop-blur border border-white/20 text-white font-label-md text-label-md px-4 py-2 rounded-full font-bold flex items-center gap-1.5 z-10">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Consultant Verified
          </span>
        ) : (
          <Link
            to="/consultants/setup"
            className="bg-white text-primary hover:bg-white/90 font-label-md text-label-md px-6 py-3 rounded-full font-bold shadow-md transition-all z-10"
          >
            Become a Consultant
          </Link>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-outline-variant/30 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: 'dashboard' },
          { id: 'notifications', label: 'Notifications', icon: 'notifications' },
          { id: 'bookings', label: 'Bookings', icon: 'calendar_month' },
          { id: 'listings', label: 'My Listings', icon: 'store' },
          { id: 'events', label: 'My Events', icon: 'event' },
          ...(consultantProfile ? [
            { id: 'services', label: 'Consulting Services', icon: 'home_repair_service' },
            { id: 'portfolio', label: 'Portfolio Manager', icon: 'folder_open' },
            { id: 'schedule', label: 'Schedule Settings', icon: 'schedule' },
            { id: 'analytics', label: 'Analytics', icon: 'trending_up' }
          ] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 px-6 font-semibold text-body-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-secondary text-secondary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {loadingData || loadingProfile ? (
        <div className="flex items-center justify-center py-20 gap-2 text-on-surface-variant">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-body-md">Loading portal data...</span>
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold text-center">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Quick Summary Cards */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-body-sm text-on-surface-variant font-semibold">Active Bookings</span>
                    <h3 className="text-headline-lg font-bold text-primary mt-1">
                      {clientBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length +
                       (consultantProfile ? consultantBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length : 0)}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-secondary">calendar_month</span>
                </div>
                
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-body-sm text-on-surface-variant font-semibold">Marketplace Listings</span>
                    <h3 className="text-headline-lg font-bold text-primary mt-1">{myListings.length}</h3>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-secondary">store</span>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-body-sm text-on-surface-variant font-semibold">Registered Events</span>
                    <h3 className="text-headline-lg font-bold text-primary mt-1">{registeredEvents.length}</h3>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-secondary">event</span>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-body-sm text-on-surface-variant font-semibold">Joined Groups</span>
                    <h3 className="text-headline-lg font-bold text-primary mt-1">1</h3>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-secondary">group</span>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="md:col-span-3 bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                      Recommended For You
                    </h3>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">Personalised B2B opportunities matched to your industry</p>
                  </div>
                  <a href="/marketplace" className="text-body-sm text-secondary hover:underline font-bold">Browse All</a>
                </div>
                <RecommendationsWidget />
              </div>

              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-body-sm text-secondary hover:underline font-bold">View All</button>
                </div>
                
                {clientBookings.length === 0 && consultantBookings.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant py-4">No recent bookings scheduled.</p>
                ) : (
                  <div className="divide-y divide-outline-variant/20">
                    {[...clientBookings, ...consultantBookings].slice(0, 3).map((b) => (
                      <div key={b.id} className="py-3 flex justify-between items-center text-body-sm">
                        <div>
                          <p className="font-bold text-primary">
                            {b.client_id === user.id ? `Booking with Consultant` : `Consultation Session`}
                          </p>
                          <p className="text-[13px] text-on-surface-variant/80 mt-0.5">
                            {new Date(b.scheduled_at).toLocaleString()} ({b.duration_minutes} min)
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          b.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications Widget */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Alerts</h3>
                  <button onClick={() => setActiveTab('notifications')} className="text-body-sm text-secondary hover:underline font-bold">Details</button>
                </div>
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-3xl opacity-30">notifications_off</span>
                    <p className="mt-1">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((n) => (
                      <div key={n.id} className={`p-3 rounded-xl border text-body-sm transition-all ${
                        n.is_read ? 'bg-surface border-outline-variant/10' : 'bg-secondary/5 border-secondary/15 font-medium'
                      }`}>
                        <div className="flex justify-between items-start">
                          <p className="text-primary pr-3 leading-snug">{n.message}</p>
                          {!n.is_read && (
                            <button 
                              onClick={() => handleMarkRead(n.id)}
                              className="text-[11px] text-secondary font-bold hover:underline whitespace-nowrap"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">In-App Notifications</h3>
                  <p className="text-body-sm text-on-surface-variant font-medium">Keep track of booking status, listings, and platform updates.</p>
                </div>
                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkAllRead}
                      className="border border-outline text-primary hover:bg-surface-container-high px-4 py-2 rounded-full font-bold text-body-sm transition-all"
                    >
                      Mark All Read
                    </button>
                    <button
                      onClick={handleDeleteAllNotifs}
                      className="border border-error text-error hover:bg-error/10 px-4 py-2 rounded-full font-bold text-body-sm transition-all"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant bg-surface rounded-xl border border-dashed border-outline-variant/55">
                  <span className="material-symbols-outlined text-5xl opacity-40 mb-1">notifications_off</span>
                  <p className="text-body-sm font-semibold">You don't have any notifications at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                        n.is_read ? 'bg-surface border-outline-variant/20' : 'bg-secondary/5 border-secondary/20 shadow-sm font-medium'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-primary text-body-sm">{n.message}</p>
                        <span className="text-[11px] text-on-surface-variant/60 block">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-body-sm text-secondary hover:underline font-bold"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotif(n.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              
              {/* Clients Section */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-headline-md text-headline-md text-primary font-bold">My Consultations (As Client)</h3>
                
                {clientBookings.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant bg-surface border border-dashed border-outline-variant/40 rounded-xl">
                    <p className="text-body-sm">You haven't booked any sessions yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-body-sm border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/30 text-on-surface-variant font-bold">
                          <th className="py-3 px-4">Date/Time</th>
                          <th className="py-3 px-4">Notes</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {clientBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-primary">
                              {new Date(b.scheduled_at).toLocaleString()}
                              <span className="block text-[11px] font-normal text-on-surface-variant mt-0.5">
                                Duration: {b.duration_minutes} min
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate">{b.notes || '-'}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                b.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => setSelectedBookingForPayment({ ...b })}
                                  className="bg-secondary text-white hover:bg-secondary/90 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all shadow-sm"
                                >
                                  Pay Now
                                </button>
                              )}
                              {b.status === 'completed' && (
                                <button
                                  onClick={() => setSelectedBookingForReview(b)}
                                  className="border border-secondary text-secondary hover:bg-secondary/10 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                                >
                                  Leave Review
                                </button>
                              )}
                              {(b.status === 'pending' || b.status === 'confirmed') && (
                                <button
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="border border-outline text-error hover:bg-error/10 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Consultants Section (If Consultant) */}
              {consultantProfile && (
                <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Incoming Requests (As Consultant)</h3>
                  
                  {consultantBookings.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant bg-surface border border-dashed border-outline-variant/40 rounded-xl">
                      <p className="text-body-sm">No bookings requested by clients yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-body-sm border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant/30 text-on-surface-variant font-bold">
                            <th className="py-3 px-4">Date/Time</th>
                            <th className="py-3 px-4">Notes</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {consultantBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-primary">
                                {new Date(b.scheduled_at).toLocaleString()}
                                <span className="block text-[11px] font-normal text-on-surface-variant mt-0.5">
                                  Duration: {b.duration_minutes} min
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate">{b.notes || '-'}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                  b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  b.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                                {b.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                      className="bg-secondary text-white hover:bg-secondary/90 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all shadow-sm"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                      className="border border-outline text-error hover:bg-error/10 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                                {b.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                    className="bg-primary text-white hover:bg-primary/90 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all shadow-sm"
                                  >
                                    Mark Completed
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB: MY LISTINGS */}
          {activeTab === 'listings' && (
            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">My Marketplace Listings</h3>
                  <p className="text-body-sm text-on-surface-variant font-medium">Offers, service requests, and collaborations you listed on the marketplace.</p>
                </div>
                <Link
                  to="/marketplace/new"
                  className="bg-secondary text-white hover:bg-secondary/90 font-label-md text-label-md px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Create Listing
                </Link>
              </div>

              {myListings.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant bg-surface rounded-xl border border-dashed border-outline-variant/55">
                  <span className="material-symbols-outlined text-5xl opacity-40 mb-1">storefront</span>
                  <p className="text-body-sm font-semibold">You haven't created any business listings.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myListings.map((l) => (
                    <div key={l.id} className="bg-surface border border-outline-variant/20 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-headline-md text-headline-md font-bold text-primary truncate pr-4">{l.title}</h4>
                          <span className="bg-secondary-container/30 text-on-secondary-container px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            {l.type}
                          </span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant/85 line-clamp-3">{l.description}</p>
                        <p className="text-[13px] font-bold text-secondary">
                          Budget: {l.currency || 'INR'} {l.budget}
                        </p>
                      </div>
                      <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-4 mt-4">
                        <Link
                          to={`/marketplace/${l.id}/edit`}
                          className="border border-outline text-primary hover:bg-surface-container-high px-4 py-2 rounded-full font-bold text-body-sm transition-all"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(l.id)}
                          className="border border-error text-error hover:bg-error/10 px-4 py-2 rounded-full font-bold text-body-sm transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MY EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              
              {/* Registered Events */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Registered Events</h3>
                {registeredEvents.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant bg-surface border border-dashed border-outline-variant/40 rounded-xl">
                    <p className="text-body-sm">You aren't registered for any upcoming events.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {registeredEvents.map((e) => (
                      <div key={e.id} className="bg-surface border border-outline-variant/20 p-5 rounded-2xl flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-primary text-body-md">{e.title}</h4>
                          <p className="text-[12px] text-on-surface-variant mt-1">
                            📅 {new Date(e.date).toLocaleDateString()} at {e.time || 'TBD'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCancelEventRegistration(e.id)}
                          className="border border-error text-error hover:bg-error/10 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                        >
                          Cancel Join
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Organized Events */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Organized Events</h3>
                  <Link
                    to="/events/new"
                    className="bg-secondary text-white hover:bg-secondary/90 font-label-md text-label-md px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Create Event
                  </Link>
                </div>
                {myEvents.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant bg-surface border border-dashed border-outline-variant/40 rounded-xl">
                    <p className="text-body-sm">You haven't organized any events.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myEvents.map((e) => (
                      <div key={e.id} className="bg-surface border border-outline-variant/20 p-5 rounded-2xl flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-primary text-body-md">{e.title}</h4>
                          <p className="text-[12px] text-on-surface-variant mt-1">
                            📅 {new Date(e.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Link
                            to={`/events/${e.id}/edit`}
                            className="border border-outline text-primary hover:bg-surface-container-high px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: CONSULTING SERVICES */}
          {activeTab === 'services' && consultantProfile && (
            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">My Consulting Services</h3>
                  <p className="text-body-sm text-on-surface-variant font-medium">Add or manage services clients can book you for.</p>
                </div>
                <button
                  onClick={() => handleOpenServiceForm()}
                  className="bg-secondary text-white hover:bg-secondary/90 font-label-md text-label-md px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add Service
                </button>
              </div>

              {/* Add/Edit Form Overlay */}
              {showServiceForm && (
                <form 
                  onSubmit={handleSaveService}
                  className="bg-surface border border-outline-variant/30 p-6 rounded-2xl shadow-md space-y-4 max-w-lg"
                >
                  <h4 className="font-bold text-primary text-body-lg">
                    {editingService ? 'Edit Service' : 'Add New Consulting Service'}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="service-name-input" className="block text-body-sm font-bold text-primary mb-1">Service Title</label>
                      <input
                        id="service-name-input"
                        type="text"
                        required
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="e.g. 1-on-1 Marketing Strategy Review"
                        className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="service-price-input" className="block text-body-sm font-bold text-primary mb-1">Price (INR)</label>
                      <input
                        id="service-price-input"
                        type="number"
                        required
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="service-duration-input" className="block text-body-sm font-bold text-primary mb-1">Duration (minutes)</label>
                      <select
                        id="service-duration-input"
                        value={serviceDuration}
                        onChange={(e) => setServiceDuration(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="service-desc-input" className="block text-body-sm font-bold text-primary mb-1">Description</label>
                      <textarea
                        id="service-desc-input"
                        rows={3}
                        required
                        value={serviceDesc}
                        onChange={(e) => setServiceDesc(e.target.value)}
                        placeholder="Provide details on what the client gets during this session..."
                        className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowServiceForm(false)}
                      className="border border-outline text-primary hover:bg-surface-container-high px-5 py-2 rounded-full font-bold text-body-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2 rounded-full font-bold text-body-sm transition-all shadow"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              )}

              {/* Services List */}
              {myServices.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant bg-surface rounded-xl border border-dashed border-outline-variant/55">
                  <span className="material-symbols-outlined text-5xl opacity-40 mb-1">home_repair_service</span>
                  <p className="text-body-sm font-semibold">You haven't defined any consulting services yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myServices.map((s) => (
                    <div key={s.id} className="bg-surface border border-outline-variant/20 p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-primary text-body-md truncate pr-4">{s.name}</h4>
                          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[11px] font-bold">
                            {s.duration} min
                          </span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant/85 line-clamp-3">{s.description}</p>
                        <p className="text-body-sm font-bold text-secondary">
                          ₹{s.price}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-outline-variant/20 pt-4 mt-4">
                        <button
                          onClick={() => handleOpenServiceForm(s)}
                          className="border border-outline text-primary hover:bg-surface-container-high px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="border border-error text-error hover:bg-error/10 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PERFORMANCE ANALYTICS */}
          {activeTab === 'analytics' && consultantProfile && analyticsData && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-2">
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Performance Analytics</h3>
                <p className="text-body-sm text-on-surface-variant font-medium">Review your earnings, consulting hours, and profile views over the last 7 days.</p>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-sm relative overflow-hidden">
                  <div className="space-y-2">
                    <span className="text-body-sm text-on-surface-variant font-bold">Total Earnings (7 Days)</span>
                    <h3 className="text-headline-lg font-bold text-green-600 mt-1">
                      ₹{analyticsData.earnings?.total?.toLocaleString('en-IN') || 0}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-green-500 bg-green-50 p-3 rounded-full">payments</span>
                </div>

                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-sm relative overflow-hidden">
                  <div className="space-y-2">
                    <span className="text-body-sm text-on-surface-variant font-bold">Consultation Hours</span>
                    <h3 className="text-headline-lg font-bold text-blue-600 mt-1">
                      {analyticsData.hours?.total?.toFixed(1) || 0} hrs
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-blue-500 bg-blue-50 p-3 rounded-full">schedule</span>
                </div>

                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-sm relative overflow-hidden">
                  <div className="space-y-2">
                    <span className="text-body-sm text-on-surface-variant font-bold">Listing Views</span>
                    <h3 className="text-headline-lg font-bold text-amber-600 mt-1">
                      {analyticsData.views?.total || 0}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-amber-500 bg-amber-50 p-3 rounded-full">trending_up</span>
                </div>
              </div>

              {/* Daily Trend Table */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                <h4 className="font-bold text-primary text-body-lg">7-Day Daily Trend Metrics</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body-sm border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-on-surface-variant font-bold">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Listing Views</th>
                        <th className="py-3 px-4">Earnings (INR)</th>
                        <th className="py-3 px-4">Hours Scheduled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {analyticsData.views?.trend?.map((item, idx) => {
                        const dateStr = item.date;
                        const viewsVal = item.value;
                        const earningsVal = analyticsData.earnings?.trend?.[idx]?.value || 0;
                        const hoursVal = analyticsData.hours?.trend?.[idx]?.value || 0;
                        
                        return (
                          <tr key={dateStr} className="hover:bg-surface-container-lowest/50 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-primary">
                              {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-on-surface">{viewsVal}</span>
                                <div className="w-24 bg-outline-variant/20 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                  <div 
                                    className="bg-amber-500 h-full rounded-full" 
                                    style={{ width: `${Math.min(100, (viewsVal / (analyticsData.views.total || 1)) * 300)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-green-700">
                              ₹{earningsVal.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-blue-700">
                              {hoursVal.toFixed(1)} hrs
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SCHEDULE SETTINGS */}
          {activeTab === 'schedule' && consultantProfile && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-2">
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Schedule Settings</h3>
                <p className="text-body-sm text-on-surface-variant font-medium">Manage your calendar timezone, booking limits, and daily availability slots.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Slots Form */}
                <form onSubmit={handleSaveSchedule} className="lg:col-span-2 bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-6">
                  <h4 className="font-bold text-primary text-body-lg border-b border-outline-variant/15 pb-2">Weekly Availability Slots</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="timezone-select" className="block text-body-sm font-bold text-primary mb-1">Timezone</label>
                      <select
                        id="timezone-select"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-surface border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      >
                        <option value="Asia/Kolkata">India (IST) — Asia/Kolkata</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="America/New_York">US Eastern Time — America/New_York</option>
                        <option value="Europe/London">London — Europe/London</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="max-consultations" className="block text-body-sm font-bold text-primary mb-1">Max Bookings Per Day</label>
                      <input
                        id="max-consultations"
                        type="number"
                        min={1}
                        max={50}
                        value={maxConsultations}
                        onChange={(e) => setMaxConsultations(e.target.value)}
                        className="w-full bg-surface border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {weeklySlots.map((slot, i) => (
                      <div 
                        key={slot.day_of_week} 
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-outline-variant/15 bg-surface"
                      >
                        <div className="flex items-center gap-3 font-semibold text-body-sm text-primary">
                          <input
                            id={`schedule-checkbox-${slot.day_of_week}`}
                            type="checkbox"
                            checked={slot.is_available}
                            onChange={(e) => handleSlotChange(i, 'is_available', e.target.checked)}
                            className="w-5 h-5 rounded focus:ring-secondary text-secondary"
                          />
                          <label htmlFor={`schedule-checkbox-${slot.day_of_week}`} className="w-24 cursor-pointer">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day_of_week]}
                          </label>
                        </div>

                        {slot.is_available ? (
                          <div className="flex items-center gap-2 self-stretch sm:self-auto">
                            <input
                              aria-label="Start Time"
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => handleSlotChange(i, 'start_time', e.target.value)}
                              className="bg-surface-container-low border border-outline-variant text-primary text-body-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-secondary transition-all"
                            />
                            <span className="text-on-surface-variant">to</span>
                            <input
                              aria-label="End Time"
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => handleSlotChange(i, 'end_time', e.target.value)}
                              className="bg-surface-container-low border border-outline-variant text-primary text-body-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-secondary transition-all"
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-on-surface-variant/40 font-bold uppercase tracking-wider select-none py-1.5">
                            Closed / Offline
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end border-t border-outline-variant/10 pt-4">
                    <button
                      type="submit"
                      disabled={savingSchedule}
                      className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all shadow"
                    >
                      {savingSchedule ? 'Saving Settings...' : 'Save Availability'}
                    </button>
                  </div>
                </form>

                {/* Blocked Dates & Break Times Widgets */}
                <div className="space-y-6">
                  {/* Blocked Dates */}
                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                    <h4 className="font-bold text-primary text-body-lg border-b border-outline-variant/15 pb-2">Blocked Dates</h4>
                    
                    <form onSubmit={handleAddBlockedDate} className="flex gap-2">
                      <input
                        aria-label="Block Date"
                        type="date"
                        required
                        value={newBlockedDate}
                        onChange={(e) => setNewBlockedDate(e.target.value)}
                        className="flex-grow bg-surface border border-outline-variant text-primary text-body-sm px-3 py-2 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      />
                      <button type="submit" className="bg-primary text-white hover:bg-primary/95 px-4 py-2 rounded-xl font-bold text-body-sm transition-all shadow">
                        Block
                      </button>
                    </form>

                    {blockedDates.length === 0 ? (
                      <p className="text-body-sm text-on-surface-variant/70 italic py-2">No blocked dates defined.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {blockedDates.map((date) => {
                          const dateObj = new Date(date);
                          const dateStr = dateObj.toISOString().split('T')[0];
                          return (
                            <div key={dateStr} className="flex justify-between items-center bg-surface p-2.5 rounded-xl border border-outline-variant/10 text-body-sm">
                              <span className="font-semibold text-primary">{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <button type="button" onClick={() => handleRemoveBlockedDate(dateStr)} className="text-error hover:text-error-hover p-1">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Break Times */}
                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                    <h4 className="font-bold text-primary text-body-lg border-b border-outline-variant/15 pb-2">Daily Rest Break Times</h4>
                    
                    <form onSubmit={handleAddBreakTime} className="space-y-3 bg-surface p-3 rounded-xl border border-outline-variant/10">
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-1.5">
                          <input
                            aria-label="Break Start"
                            type="time"
                            value={newBreakStart}
                            onChange={(e) => setNewBreakStart(e.target.value)}
                            className="bg-surface-container-low border border-outline-variant text-primary text-body-sm px-2.5 py-1.5 rounded-lg focus:outline-none"
                          />
                          <span className="text-on-surface-variant">to</span>
                          <input
                            aria-label="Break End"
                            type="time"
                            value={newBreakEnd}
                            onChange={(e) => setNewBreakEnd(e.target.value)}
                            className="bg-surface-container-low border border-outline-variant text-primary text-body-sm px-2.5 py-1.5 rounded-lg focus:outline-none"
                          />
                        </div>
                        <button type="submit" className="bg-secondary text-white hover:bg-secondary/95 px-3 py-1.5 rounded-lg font-bold text-body-sm transition-all shadow">
                          Add
                        </button>
                      </div>
                    </form>

                    {breakTimes.length === 0 ? (
                      <p className="text-body-sm text-on-surface-variant/70 italic py-2">No break times defined.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {breakTimes.map((bt, index) => (
                          <div key={index} className="flex justify-between items-center bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/10 text-body-sm">
                            <span className="font-semibold text-primary">☕ Break: {bt.start_time} - {bt.end_time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PORTFOLIO MANAGER */}
          {activeTab === 'portfolio' && consultantProfile && (
            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Portfolio Manager</h3>
                  <p className="text-body-sm text-on-surface-variant font-medium">Add, update, or remove projects shown on your public consultant page.</p>
                </div>
                <button
                  onClick={() => openPortForm()}
                  className="bg-secondary text-white hover:bg-secondary/90 font-label-md text-label-md px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add Project
                </button>
              </div>

              {/* Add/Edit Portfolio Modal Form */}
              {showPortForm && (
                <form onSubmit={handlePortSave} className="bg-surface border border-outline-variant/30 p-6 rounded-2xl shadow-md space-y-4 max-w-lg">
                  <h4 className="font-bold text-primary text-body-lg">
                    {portEditId ? 'Edit Project Details' : 'Add New Portfolio Project'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="port-title-input" className="block text-body-sm font-bold text-primary mb-1">Project Title</label>
                      <input
                        id="port-title-input"
                        type="text"
                        required
                        value={portFormData.title}
                        onChange={(e) => setPortFormData({ ...portFormData, title: e.target.value })}
                        placeholder="e.g. Enterprise Cloud ERP Deployment"
                        className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="port-url-input" className="block text-body-sm font-bold text-primary mb-1">Project URL</label>
                      <input
                        id="port-url-input"
                        type="url"
                        value={portFormData.projectUrl}
                        onChange={(e) => setPortFormData({ ...portFormData, projectUrl: e.target.value })}
                        placeholder="e.g. https://github.com/my-project"
                        className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-body-sm font-bold text-primary mb-1">Cover Image</label>
                      <ImageUpload 
                        defaultPreview={portFormData.imageUrl}
                        onUploadSuccess={(url) => setPortFormData({ ...portFormData, imageUrl: url })}
                        onUploadError={(err) => console.error(err)}
                      />
                    </div>

                    <div>
                      <label htmlFor="port-desc-input" className="block text-body-sm font-bold text-primary mb-1">Description / Key Outcomes</label>
                      <textarea
                        id="port-desc-input"
                        rows={3}
                        value={portFormData.description}
                        onChange={(e) => setPortFormData({ ...portFormData, description: e.target.value })}
                        placeholder="Provide details on scope, budget, and business growth outcomes achieved..."
                        className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={closePortForm}
                      className="border border-outline text-primary hover:bg-surface-container-high px-5 py-2 rounded-full font-bold text-body-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={portSubmitting}
                      className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2 rounded-full font-bold text-body-sm transition-all shadow"
                    >
                      {portSubmitting ? 'Saving...' : 'Save Project'}
                    </button>
                  </div>
                </form>
              )}

              {/* Portfolio Grid list */}
              {portfolioItems.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant bg-surface rounded-xl border border-dashed border-outline-variant/55">
                  <span className="material-symbols-outlined text-5xl opacity-40 mb-1">folder_open</span>
                  <p className="text-body-sm font-semibold">You haven't added any projects to your portfolio yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolioItems.map((p) => (
                    <div key={p.id} className="bg-surface border border-outline-variant/20 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-sm">
                      <div>
                        {p.imageUrl && (
                          <div className="w-full h-32 bg-surface-container-high overflow-hidden">
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 space-y-2">
                          <h4 className="font-bold text-primary text-body-md truncate pr-4">{p.title}</h4>
                          <p className="text-body-sm text-on-surface-variant/85 line-clamp-3">{p.description || '-'}</p>
                          {p.projectUrl && (
                            <a
                              href={p.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-secondary text-body-sm font-semibold hover:underline"
                            >
                              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              View Project
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-outline-variant/20 p-4 bg-surface-container-lowest">
                        <button
                          onClick={() => openPortForm(p)}
                          className="border border-outline text-primary hover:bg-surface-container-high px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePortDelete(p.id)}
                          className="border border-error text-error hover:bg-error/10 px-4 py-1.5 rounded-full font-bold text-[12px] transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* RENDER MODALS IN PORTAL DYNAMICALLY */}
      {selectedBookingForPayment && (
        <PaymentModal
          booking={selectedBookingForPayment}
          amount={selectedBookingForPayment.duration_minutes * 25} // simulated ₹25/min rate or base price
          serviceName="Consulting Session"
          consultantName="Consultant"
          onClose={() => setSelectedBookingForPayment(null)}
          onSuccess={() => {
            setSelectedBookingForPayment(null);
            loadTabData('bookings');
          }}
        />
      )}

      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onSuccess={() => {
            setSelectedBookingForReview(null);
            loadTabData('bookings');
          }}
        />
      )}
    </div>
  );
}
