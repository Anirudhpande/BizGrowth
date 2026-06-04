import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function UserProfile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orgs, setOrgs] = useState([])
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [orgsError, setOrgsError] = useState('')

  const isSelf = id === currentUser?.id

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get(`/api/users/${id}`)
        if (res.success && res.user) {
          setProfile(res.user)
        } else {
          throw new Error('User profile details could not be found.')
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve profile credentials')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [id])

  useEffect(() => {
    if (!id) return

    const fetchOrgs = async () => {
      try {
        setOrgsLoading(true)
        setOrgsError('')
        const res = await api.get(`/api/organizations/user/${id}`)
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
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface relative z-10 px-margin-mobile">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
          <p className="font-label-md text-label-md font-semibold text-on-surface-variant tracking-wider">
            Loading Node Credentials...
          </p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-surface px-margin-mobile py-12 relative z-10">
        <div className="max-w-[800px] mx-auto space-y-6">
          <Link to="/discovery" className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Discovery
          </Link>
          <div className="p-4 bg-red-500/10 text-error rounded-lg text-left text-body-md border border-red-500/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <span>{error || 'User profile not found.'}</span>
          </div>
        </div>
      </div>
    )
  }

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Anonymous Node'
  const initial = profile.firstName ? profile.firstName[0].toUpperCase() : (fullName ? fullName[0].toUpperCase() : 'U')
  const locationStr = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location coordinates unmapped'
  const joinedDate = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-surface px-margin-mobile md:px-margin-desktop py-12 relative z-10">
      <div className="max-w-[800px] mx-auto space-y-6 animate-fade-in">
        
        {/* Navigation Breadcrumb */}
        <Link to="/discovery" className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Discovery
        </Link>

        {/* Profile Card Wrapper */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-lg space-y-8">
          
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-outline-variant/20 pb-6">
            <div className="flex items-center gap-5">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={fullName} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-sm shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentNode.innerHTML = `<div class="w-20 h-20 rounded-full bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary font-headline-md text-[28px] font-bold shrink-0">${initial}</div>`;
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary font-headline-md text-[28px] font-bold shrink-0">
                  {initial}
                </div>
              )}
              <div className="space-y-1">
                <h1 className="font-headline-xl text-[26px] leading-8 text-primary font-bold">
                  {fullName}
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`inline-block font-label-md text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                    profile.role === 'admin'
                      ? 'bg-red-500/5 text-error border-red-500/10 font-bold'
                      : profile.role === 'consultant'
                      ? 'bg-secondary/5 text-secondary border-secondary/10'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                  }`}>
                    {profile.role === 'admin' ? 'Administrator' : profile.role === 'consultant' ? 'Consultant' : 'Client'}
                  </span>
                  {profile.experienceYears > 0 && (
                    <span className="font-label-md text-[10px] text-outline font-semibold">
                      • {profile.experienceYears} Years Experience
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* If viewing own profile, show Edit button instead of read-only context */}
            {isSelf && (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-primary/95 transition-all shadow-sm font-semibold justify-center scale-95 active:scale-90"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Your Profile
              </Link>
            )}
          </div>

          {/* Biography Text Block */}
          <div className="space-y-3">
            <h3 className="font-headline-md text-[18px] text-primary font-semibold border-l-4 border-secondary pl-3">
              Professional Biography
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">
              {profile.bio || 'No detailed professional biography summary has been mapped for this node yet.'}
            </p>
          </div>

          {/* Node Metadata Matrix */}
          <div className="space-y-6 pt-4 border-t border-outline-variant/20">
            <h3 className="font-headline-md text-[18px] text-primary font-semibold border-l-4 border-secondary pl-3">
              Node Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              
              {/* Corporate Metadata */}
              <div className="space-y-2">
                <h4 className="font-label-md text-secondary tracking-wide uppercase text-[10px]">Corporate Node</h4>
                <div className="space-y-1.5 font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <span className="material-symbols-outlined text-[18px] text-outline">domain</span>
                    <span>{profile.companyName || 'Independent Node'}</span>
                  </div>
                  {profile.industry && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-outline">work</span>
                      <span>{profile.industry}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Geographic Coordinates */}
              <div className="space-y-2">
                <h4 className="font-label-md text-secondary tracking-wide uppercase text-[10px]">Location Coordinates</h4>
                <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                  <span>{locationStr}</span>
                </div>
              </div>

              {/* Portal Links */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/10 md:col-span-2">
                <h4 className="font-label-md text-secondary tracking-wide uppercase text-[10px]">Connections</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                  {profile.website && (
                    <div className="flex items-center gap-2 font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[18px] text-outline">language</span>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all font-semibold">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.linkedinUrl && (
                    <div className="flex items-center gap-2 font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[18px] text-outline">link</span>
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all font-semibold">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Node Info - ONLY rendered when viewing own profile */}
              {isSelf && (profile.email || profile.phone) && (
                <div className="space-y-2 pt-2 border-t border-outline-variant/10 md:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-label-md text-error tracking-wide uppercase text-[10px]">Private Contact Details</h4>
                    <span className="font-label-md text-[8px] bg-red-500/10 text-error px-1.5 py-0.2 rounded border border-red-500/25 uppercase tracking-wider font-bold">
                      Visible Only to You
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-outline">mail</span>
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-outline">call</span>
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Joined Date Coordinates */}
              <div className="space-y-1 pt-4 border-t border-outline-variant/10 md:col-span-2 text-outline font-label-md text-[10px] uppercase tracking-wider">
                Enterprise Node Joined: {joinedDate}
              </div>

            </div>
          </div>

        </div>

        {/* Organizations Card List */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-lg space-y-6">
          <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
            Organizations
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
                  This user is not currently linked to any enterprise nodes.
                </p>
              </div>
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
