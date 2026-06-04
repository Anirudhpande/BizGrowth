import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function Profile() {
  const { verifyToken, user: currentUser } = useAuth()
  
  // Fields state holding all 13 editable fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    industry: '',
    city: '',
    state: '',
    country: '',
    website: '',
    linkedinUrl: '',
    experienceYears: 0,
    bio: '',
    phone: '',
    avatarUrl: ''
  })
  
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [orgs, setOrgs] = useState([])
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [orgsError, setOrgsError] = useState('')

  useEffect(() => {
    if (!currentUser?.id) return

    const fetchOrgs = async () => {
      try {
        setOrgsLoading(true)
        setOrgsError('')
        const res = await api.get(`/api/organizations/user/${currentUser.id}`)
        if (res.success && res.data) {
          setOrgs(res.data)
        } else {
          setOrgs([])
        }
      } catch (err) {
        setOrgsError(err.message || 'Failed to retrieve organizations list')
      } finally {
        setOrgsLoading(false)
      }
    }

    fetchOrgs()
  }, [currentUser?.id])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true)
        setError('')
        const data = await api.get('/api/users/me')
        if (data.success && data.user) {
          const u = data.user
          setFormData({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            companyName: u.companyName || u.company || '',
            industry: u.industry || '',
            city: u.city || '',
            state: u.state || '',
            country: u.country || '',
            website: u.website || '',
            linkedinUrl: u.linkedinUrl || '',
            experienceYears: u.experienceYears || 0,
            bio: u.bio || '',
            phone: u.phone || '',
            avatarUrl: u.avatarUrl || ''
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve profile data')
      } finally {
        setFetching(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const payload = {
        ...formData,
        experienceYears: Number(formData.experienceYears) || 0
      }
      
      const data = await api.patch('/api/users/me', payload)
      if (data.success) {
        setSuccess('Strategic profile node successfully updated.')
        // Reload global user details so Navbar and greetings update immediately
        await verifyToken()
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving profile changes.')
    } finally {
      setSaving(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface relative z-10 px-margin-mobile">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
          <p className="font-label-md text-label-md font-semibold text-on-surface-variant tracking-wider">
            Accessing Profile Credentials...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-margin-mobile md:px-margin-desktop py-12 relative z-10">
      <div className="max-w-[800px] mx-auto space-y-8 animate-fade-in">
        
        {/* Profile Details Edit Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-lg space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-outline-variant/20 pb-6">
            <div className="relative">
              {formData.avatarUrl ? (
                <img 
                  src={formData.avatarUrl} 
                  alt="User Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250&h=250';
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant text-primary shadow-inner">
                  <span className="material-symbols-outlined text-[48px]">person</span>
                </div>
              )}
            </div>
            <div className="text-center md:text-left space-y-1">
              <h1 className="font-headline-xl text-headline-xl text-primary font-semibold">
                {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'Enterprise Representative'}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Manage your C-suite metadata and professional credentials.
              </p>
            </div>
          </div>

          {/* Inline Alerts */}
          {error && (
            <div className="p-4 bg-red-500/10 text-error rounded-lg text-left text-body-md border border-red-500/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-500/10 text-green-700 rounded-lg text-left text-body-md border border-green-500/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          {/* Profile Update Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Identity */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
                Identity Node
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="phone">
                    Phone Connection
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="avatarUrl">
                    Avatar Image URL
                  </label>
                  <input
                    id="avatarUrl"
                    name="avatarUrl"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Metadata */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
                Professional Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="companyName">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enterprise Inc."
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="experienceYears">
                    Experience (Years)
                  </label>
                  <input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="industry">
                    Target Industry
                  </label>
                  <input
                    id="industry"
                    name="industry"
                    type="text"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Technology / Strategy"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="website">
                    Enterprise Portal URL
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="linkedinUrl">
                  LinkedIn Profile URL
                  </label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                />
              </div>
            </div>

            {/* Section 3: Location */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
                Geographic Node
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="state">
                    State / Region
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="California"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="country">
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="United States"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Bio */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
                Biography
              </h2>
              <div className="space-y-1">
                <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="bio">
                  Professional Bio Summary
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share a summary of your professional background, capabilities, and executive leadership goals."
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md resize-y"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className={`px-8 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/95 transition-all shadow-sm font-semibold flex items-center justify-center gap-2 ${
                  saving ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving changes...' : 'Save Credentials'}
                {!saving && <span className="material-symbols-outlined text-sm">save</span>}
              </button>
            </div>

          </form>
        </div>

        {/* Organizations Card List */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-lg space-y-6">
          <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
            My Organizations
          </h2>

          {orgsLoading ? (
            <div className="py-8 flex justify-center">
              <span className="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
            </div>
          ) : orgsError ? (
            <div className="p-4 bg-red-500/10 text-error rounded-lg text-left text-body-md border border-red-500/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
              <span>{orgsError}</span>
            </div>
          ) : orgs.length === 0 ? (
            <div className="border border-dashed border-outline-variant/50 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mx-auto">
                <span className="material-symbols-outlined text-[28px]">corporate_fare</span>
              </div>
              <div className="space-y-1">
                <p className="font-headline-md text-[16px] text-primary font-semibold">No Registered Organizations</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                  You are not currently linked to any enterprise nodes. Register a new business node to connect.
                </p>
              </div>
              <Link
                to="/organizations/new"
                className="inline-flex items-center gap-1.5 bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-primary/95 transition-all font-semibold shadow-sm text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Create Your First Organization
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgs.map((org) => {
                const initial = org.name ? org.name[0].toUpperCase() : 'O'
                const locationStr = [org.city, org.country].filter(Boolean).join(', ') || 'Location unmapped'

                return (
                  <Link
                    key={org.id}
                    to={`/organizations/${org.id}`}
                    className="group bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/45 rounded-xl p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/30 text-primary shrink-0">
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="font-headline-md text-[18px] font-bold text-primary">{initial}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-headline-md text-[15px] leading-5 text-primary font-bold group-hover:text-secondary transition-colors line-clamp-1">
                            {org.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {org.type && (
                              <span className="font-label-md text-[8px] uppercase tracking-wider text-on-surface-variant bg-surface-container px-1.5 py-0.2 rounded border border-outline-variant/30">
                                {org.type}
                              </span>
                            )}
                            {org.industry && (
                              <span className="font-label-md text-[8px] uppercase tracking-wider text-secondary bg-secondary/5 px-1.5 py-0.2 rounded border border-secondary/10">
                                {org.industry}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                        {org.description || 'No business description summary provided.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/10 flex items-center gap-1 font-body-sm text-[12px] text-outline">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span className="line-clamp-1">{locationStr}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
