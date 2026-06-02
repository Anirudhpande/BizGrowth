import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      return
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.user)
      } else {
        // Token invalid or expired
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (err) {
      console.error('Auth verification error:', err)
      setUser(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    checkAuth()
    
    // Listen to local storage changes to trigger auth check in real-time
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-outline-variant/30 ${
        isScrolled 
          ? 'bg-surface/90 backdrop-blur-md shadow-md h-16' 
          : 'bg-surface/70 backdrop-blur-md shadow-sm h-20'
      }`}
      id="main-nav"
    >
      <div className="max-w-[1280px] mx-auto flex justify-between items-center px-margin-mobile md:px-margin-desktop h-full">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-85 transition-opacity">
          <span className="material-symbols-outlined icon-fill text-primary" style={{ fontSize: '28px' }}>public</span>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">BizGrowth</span>
        </Link>

        {/* Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink 
            to="/ecosystem" 
            className={({ isActive }) => 
              `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 ${
                isActive 
                  ? 'text-secondary font-bold border-secondary' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
              }`
            }
          >
            Ecosystem
          </NavLink>
          <NavLink 
            to="/resources" 
            className={({ isActive }) => 
              `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 ${
                isActive 
                  ? 'text-secondary font-bold border-secondary' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
              }`
            }
          >
            Resources
          </NavLink>
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5 px-3 py-2">
                <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                Hi, <span className="font-bold text-primary">{user.name}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="border border-outline text-primary hover:text-on-primary bg-transparent hover:bg-primary font-label-md text-label-md px-5 py-2.5 rounded-full transition-all duration-300 scale-95 active:scale-90 flex items-center justify-center font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="font-label-md text-label-md text-primary hover:bg-surface-container-low px-4 py-2 rounded-full transition-all duration-300 scale-95 active:scale-90 flex items-center justify-center font-semibold"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-md scale-95 active:scale-90 flex items-center justify-center font-semibold"
              >
                Join BizGrowth
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-primary p-2 hover:bg-surface-container-low rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer (Drop-down) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface border-b border-outline-variant/30 shadow-lg px-margin-mobile py-6 flex flex-col gap-4 animate-fade-in-up">
          <NavLink 
            to="/ecosystem" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-label-md text-label-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Ecosystem
          </NavLink>
          <NavLink 
            to="/resources" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-label-md text-label-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Resources
          </NavLink>
          <div className="h-[1px] bg-outline-variant/30 my-2"></div>
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-center font-label-md text-label-md text-on-surface-variant py-2 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                  Hi, <span className="font-bold text-primary">{user.name}</span>
                </div>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="text-center border border-outline text-primary font-label-md text-label-md py-3 rounded-full hover:bg-surface-container-low transition-all font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center font-label-md text-label-md text-primary hover:bg-surface-container-low py-3 rounded-full transition-all border border-outline-variant/50 font-semibold"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center bg-primary text-on-primary font-label-md text-label-md py-3 rounded-full hover:bg-primary/90 transition-all shadow-md font-semibold"
                >
                  Join BizGrowth
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
