import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function Discovery() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDiscoveryUsers = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/api/users/discover')
        if (res.success && res.data) {
          setUsers(res.data)
        } else {
          setUsers([])
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve strategic directory')
      } finally {
        setLoading(false)
      }
    }

    fetchDiscoveryUsers()
  }, [])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedRole('All')
  }

  // Client-side filtration logic combining search query and role selection
  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
    const company = (u.companyName || '').toLowerCase()
    const industry = (u.industry || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch = 
      fullName.includes(query) ||
      company.includes(query) ||
      industry.includes(query)

    const matchesRole = 
      selectedRole === 'All' || 
      (u.role || '').toLowerCase() === selectedRole.toLowerCase()

    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface relative z-10 px-margin-mobile">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
          <p className="font-label-md text-label-md font-semibold text-on-surface-variant tracking-wider">
            Accessing Discovery Network...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-margin-mobile md:px-margin-desktop py-12 relative z-10">
      <div className="max-w-[1280px] mx-auto space-y-8 animate-fade-in">
        
        {/* Header Title Section */}
        <div className="border-b border-outline-variant/20 pb-6 space-y-1">
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
            Strategic Ecosystem Directory
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Discover, evaluate, and establish secure connections with corporate and consultant nodes.
          </p>
        </div>

        {/* Global Inline Error Box */}
        {error && (
          <div className="p-4 bg-red-500/10 text-error rounded-lg text-left text-body-md border border-red-500/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Search & Filter Matrix */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-3.5 text-outline text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, or industry..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[200px]">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md font-semibold appearance-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="client">Client Node</option>
                <option value="consultant">Consultant</option>
                <option value="admin">Administrator</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-3.5 text-outline pointer-events-none text-[20px]">
                arrow_drop_down
              </span>
            </div>
            {(searchQuery || selectedRole !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="px-5 py-3 border border-outline-variant text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-all font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">clear_all</span>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Members Responsive Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/30 shadow-sm text-center space-y-4 py-16">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mx-auto">
              <span className="material-symbols-outlined text-[36px]">group_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline-md text-headline-md text-primary font-semibold">No Nodes Located</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                No matching members exist in the active directory with your specified query filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => {
              const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Anonymous Node'
              const initial = u.firstName ? u.firstName[0].toUpperCase() : (fullName ? fullName[0].toUpperCase() : 'U')
              const locationStr = [u.city, u.country].filter(Boolean).join(', ') || 'Location unmapped'

              return (
                <div 
                  key={u.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all hover:border-primary/45 flex flex-col justify-between space-y-6 relative"
                >
                  {/* Card Main Link */}
                  <Link to={`/users/${u.id}`} className="space-y-4 block flex-grow">
                    <div className="flex items-center gap-4">
                      {u.avatarUrl ? (
                        <img 
                          src={u.avatarUrl} 
                          alt={fullName} 
                          className="w-14 h-14 rounded-full object-cover border border-outline-variant/30 shadow-inner shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentNode.innerHTML = `<div class="w-14 h-14 rounded-full bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary font-headline-md text-headline-md font-bold shrink-0">${initial}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary font-headline-md text-headline-md font-bold shrink-0">
                          {initial}
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <h3 className="font-headline-md text-[16px] leading-5 text-primary font-bold line-clamp-1">
                          {fullName}
                        </h3>
                        <span className={`inline-block font-label-md text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                          u.role === 'admin'
                            ? 'bg-red-500/5 text-error border-red-500/10 font-bold'
                            : u.role === 'consultant'
                            ? 'bg-secondary/5 text-secondary border-secondary/10'
                            : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                        }`}>
                          {u.role === 'admin' ? 'Administrator' : u.role === 'consultant' ? 'Consultant' : 'Client'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-body-md text-body-sm text-primary font-bold line-clamp-1">
                        {u.companyName || 'Independent Node'}
                      </h4>
                      {u.industry && (
                        <p className="font-body-sm text-[12px] text-secondary font-semibold line-clamp-1">
                          {u.industry}
                        </p>
                      )}
                      <p className="font-body-sm text-[12px] text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span>{locationStr}</span>
                      </p>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 pt-2 border-t border-outline-variant/10">
                      {u.bio || 'No professional bio summary provided.'}
                    </p>
                  </Link>

                  {/* Footer Social Actions */}
                  {(u.website || u.linkedinUrl) && (
                    <div className="pt-4 border-t border-outline-variant/10 flex items-center gap-3 relative z-20">
                      {u.website && (
                        <a
                          href={u.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-outline hover:text-primary transition-all"
                          title="Enterprise Website"
                        >
                          <span className="material-symbols-outlined text-[18px]">language</span>
                        </a>
                      )}
                      {u.linkedinUrl && (
                        <a
                          href={u.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-outline hover:text-primary transition-all"
                          title="LinkedIn Profile"
                        >
                          <span className="material-symbols-outlined text-[18px]">link</span>
                        </a>
                      )}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
