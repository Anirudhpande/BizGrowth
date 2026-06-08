import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function OrganizationDiscovery() {
  const [organizations, setOrganizations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/api/organizations?limit=100')
        if (res.success && res.data) {
          setOrganizations(res.data)
        } else {
          setOrganizations([])
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve organization directory')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  const handleResetFilters = () => {
    setSearchQuery('')
    setIndustryFilter('')
  }

  // Derive unique industries from data for the dropdown
  const uniqueIndustries = [...new Set(
    organizations.map(org => org.industry).filter(Boolean)
  )].sort()

  // Client-side filtration logic
  const filteredOrgs = organizations.filter(org => {
    const name = (org.name || '').toLowerCase()
    const industry = (org.industry || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch = !query || name.includes(query) || industry.includes(query)
    const matchesIndustry = !industryFilter || org.industry === industryFilter

    return matchesSearch && matchesIndustry
  })

  const hasActiveFilters = searchQuery || industryFilter

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface relative z-10 px-margin-mobile">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
          <p className="font-label-md text-label-md font-semibold text-on-surface-variant tracking-wider">
            Accessing Organization Registry...
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
            Organization Directory
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Browse, evaluate, and connect with registered corporate and business entities across the ecosystem.
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
              placeholder="Search by organization name or industry..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
            />
          </div>
          <div className="relative w-full md:w-auto">
            <span className="material-symbols-outlined absolute left-4 top-3.5 text-outline text-[20px]">factory</span>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full md:w-[220px] pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md appearance-none cursor-pointer"
            >
              <option value="">All Industries</option>
              {uniqueIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {hasActiveFilters && (
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

        {/* Organizations Responsive Grid */}
        {filteredOrgs.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/30 shadow-sm text-center space-y-4 py-16">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mx-auto">
              <span className="material-symbols-outlined text-[36px]">corporate_fare</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline-md text-headline-md text-primary font-semibold">
                {hasActiveFilters ? 'No Organizations Found' : 'No Registered Organizations'}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'No matching organizations exist in the directory with your specified query filters.'
                  : 'No organizations have been registered in the ecosystem yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrgs.map((org) => {
              const initial = org.name ? org.name[0].toUpperCase() : 'O'

              return (
                <Link
                  key={org.id}
                  to={`/organizations/${org.id}`}
                  className="group bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all hover:border-primary/45 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary font-headline-md text-headline-md font-bold shrink-0">
                        {initial}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-headline-md text-[16px] leading-5 text-primary font-bold group-hover:text-secondary transition-colors line-clamp-1">
                          {org.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {org.industry && (
                            <span className="inline-block font-label-md text-[9px] uppercase tracking-wider text-secondary bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10">
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

                  <div className="pt-3 border-t border-outline-variant/10 flex items-center gap-1 font-body-sm text-[12px] text-outline">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    <span>Registered {new Date(org.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
