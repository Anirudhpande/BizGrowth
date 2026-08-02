import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/^http/, 'ws')

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const wsRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // ── Load initial unread count via REST, then upgrade to WebSocket ──
  useEffect(() => {
    if (!user) return

    // Initial HTTP fetch for badge count
    const fetchInitialCount = async () => {
      try {
        const notifs = await api.get(`/api/notifications/user/${user.id}`)
        const list = notifs?.notifications || []
        setUnreadNotifications(list.filter(n => !n.read).length)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }
    fetchInitialCount()

    // WebSocket upgrade for real-time badge updates
    const token = localStorage.getItem('token')
    if (!token) return

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}?token=${token}`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          // Any notification event → increment badge
          if (msg.type === 'notification') {
            setUnreadNotifications(prev => prev + 1)
          }
        } catch { /* non-JSON WebSocket frames are intentionally ignored */ }
      }

      ws.onclose = () => {
        // Auto-reconnect after 5s if user still logged in
        setTimeout(() => {
          if (localStorage.getItem('token')) connect()
        }, 5000)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [user])

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


  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-outline-variant/30 ${
        isScrolled 
          ? 'bg-surface/90 backdrop-blur-md shadow-md h-16' 
          : 'bg-surface/70 backdrop-blur-md shadow-sm h-20'
      }`}
      id="main-nav"
    >
      {/* 3-column layout: Logo Left | Nav Links Center | Actions Right */}
      <div className="max-w-[1280px] mx-auto w-full h-full px-4 md:px-8 flex flex-row justify-between items-center">
        {/* LEFT — Brand/Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-85 transition-opacity shrink-0 py-2">
          <span className="material-symbols-outlined icon-fill text-primary" style={{ fontSize: '28px' }}>public</span>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight leading-none">BizGrowth</span>
        </Link>

        {/* CENTER — Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink 
            to="/ecosystem" 
            className={({ isActive }) => 
              `text-[15px] font-semibold py-2 transition-all border-b-2 leading-none flex items-center ${
                isActive 
                  ? 'text-secondary border-secondary font-bold' 
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Ecosystem
          </NavLink>
          <NavLink 
            to="/marketplace" 
            className={({ isActive }) => 
              `text-[15px] font-semibold py-2 transition-all border-b-2 leading-none flex items-center ${
                isActive 
                  ? 'text-secondary border-secondary font-bold' 
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Marketplace
          </NavLink>
          <NavLink 
            to="/products" 
            className={({ isActive }) => 
              `text-[15px] font-semibold py-2 transition-all border-b-2 leading-none flex items-center ${
                isActive 
                  ? 'text-secondary border-secondary font-bold' 
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Products
          </NavLink>
          <div className="relative group flex items-center py-2">
            <span className="text-[15px] font-semibold text-on-surface-variant hover:text-primary transition-all border-b-2 border-transparent cursor-pointer flex items-center gap-1 leading-none">
              Trade <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </span>
            <div className="absolute left-0 top-full mt-2 w-48 bg-surface border border-outline-variant/30 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden z-50">
              <NavLink to="/global-to-india" className="px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                🌍 Global → India
              </NavLink>
              <NavLink to="/india-to-global" className="px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-2">
                🇮🇳 India → Global
              </NavLink>
            </div>
          </div>
          <NavLink 
            to="/consultants" 
            className={({ isActive }) => 
              `text-[15px] font-semibold py-2 transition-all border-b-2 leading-none flex items-center ${
                isActive 
                  ? 'text-secondary border-secondary font-bold' 
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Consultants
          </NavLink>
          <NavLink 
            to="/events" 
            className={({ isActive }) => 
              `text-[15px] font-semibold py-2 transition-all border-b-2 leading-none flex items-center ${
                isActive 
                  ? 'text-secondary border-secondary font-bold' 
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Events
          </NavLink>
          <NavLink 
            to="/resources" 
            className={({ isActive }) => 
              `text-[15px] font-semibold py-2 transition-all border-b-2 leading-none flex items-center ${
                isActive 
                  ? 'text-secondary border-secondary font-bold' 
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Resources
          </NavLink>
        </div>

        {/* RIGHT — Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            <>
              <NavLink 
                to="/messages" 
                className={({ isActive }) => 
                  `text-[15px] font-semibold py-2 transition-all border-b-2 leading-none flex items-center ${
                    isActive 
                      ? 'text-secondary border-secondary font-bold' 
                      : 'text-on-surface-variant hover:text-primary border-transparent'
                  }`
                }
              >
                Messages
              </NavLink>
              <Link 
                to="/dashboard?tab=notifications" 
                className="relative p-1.5 text-on-surface-variant hover:text-primary transition-all flex items-center"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-surface">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              {user?.role === 'admin' && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => 
                    `text-[15px] font-semibold py-2 transition-all border-b-2 leading-none flex items-center ${
                      isActive 
                        ? 'text-secondary border-secondary font-bold' 
                        : 'text-on-surface-variant hover:text-primary border-transparent'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
              {/* My Account Dropdown */}
              <div className="relative group flex items-center">
                <button className="text-[14px] text-on-surface-variant hover:text-primary transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-surface-container-low border border-outline-variant/40">
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  <span className="font-semibold text-primary">{user.name?.split(' ')[0]}</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-outline-variant/30 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden z-50">
                  <Link to="/dashboard" className="px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span> Dashboard
                  </Link>
                  <Link to="/profile" className="px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span> Profile
                  </Link>
                  <Link to="/organizations" className="px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">corporate_fare</span> My Organizations
                  </Link>
                  <Link to="/ai-advisor" className="px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span> AI Advisor
                  </Link>
                  <div className="h-px bg-outline-variant/30 mx-3" />
                  <button onClick={handleLogout} className="px-4 py-3 text-sm font-semibold text-error hover:bg-error/5 transition-colors flex items-center gap-2 w-full text-left">
                    <span className="material-symbols-outlined text-[18px]">logout</span> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="font-body-md text-body-md text-primary hover:bg-surface-container-low px-4 py-2 rounded-full transition-all duration-300 flex items-center justify-center font-semibold"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary text-on-primary font-body-md text-body-md px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-md flex items-center justify-center font-semibold"
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
        <div className="md:hidden absolute top-full left-0 w-full bg-surface border-b border-outline-variant/30 shadow-lg px-margin-mobile py-6 flex flex-col gap-3 animate-fade-in-up max-h-[calc(100vh-5rem)] overflow-y-auto z-50">
          <NavLink 
            to="/ecosystem" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Ecosystem
          </NavLink>
          <NavLink 
            to="/marketplace" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Marketplace
          </NavLink>
          <NavLink 
            to="/products" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Products
          </NavLink>
          <div className="flex flex-col pl-4 gap-1 border-l-2 border-outline-variant/30 ml-2 my-1">
            <NavLink 
              to="/global-to-india" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => 
                `font-body-md text-body-md py-1.5 px-3 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              🌍 Global → India
            </NavLink>
            <NavLink 
              to="/india-to-global" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => 
                `font-body-md text-body-md py-1.5 px-3 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive ? 'text-orange-600 font-bold bg-orange-50' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              🇮🇳 India → Global
            </NavLink>
          </div>
          <NavLink 
            to="/consultants" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Consultants
          </NavLink>
          <NavLink 
            to="/events" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Events
          </NavLink>
          <NavLink 
            to="/resources" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Resources
          </NavLink>
          {user && (
            <NavLink 
              to="/ai-advisor" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => 
                `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-surface-container-low text-secondary font-bold' 
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              AI Advisor
            </NavLink>
          )}
          <div className="h-[1px] bg-outline-variant/30 my-1"></div>
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                  <span className="font-body-md text-body-md font-bold text-primary">{user.name}</span>
                </div>
                {/* My Account section */}
                <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-wider px-1 mt-1">My Account</p>
                <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${ isActive ? 'bg-surface-container-low text-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-[18px]">dashboard</span> Dashboard
                </NavLink>
                <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${ isActive ? 'bg-surface-container-low text-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-[18px]">manage_accounts</span> Profile
                </NavLink>
                <NavLink to="/organizations" onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${ isActive ? 'bg-surface-container-low text-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-[18px]">corporate_fare</span> My Organizations
                </NavLink>
                <NavLink to="/messages" onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${ isActive ? 'bg-surface-container-low text-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-[18px]">chat</span> Messages
                </NavLink>
                <NavLink to="/dashboard?tab=notifications" onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${ isActive ? 'bg-surface-container-low text-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-[18px]">notifications</span>
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className="bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">{unreadNotifications}</span>
                  )}
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `font-body-md text-body-md py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${ isActive ? 'bg-surface-container-low text-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Admin
                  </NavLink>
                )}
                <div className="h-px bg-outline-variant/30 my-1" />
                <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="font-body-md text-body-md py-2 px-3 rounded-lg transition-colors flex items-center gap-2 text-error hover:bg-error/5 w-full text-left">
                  <span className="material-symbols-outlined text-[18px]">logout</span> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center font-body-md text-body-md text-primary hover:bg-surface-container-low py-2.5 rounded-full transition-all border border-outline-variant/50 font-semibold"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center bg-primary text-on-primary font-body-md text-body-md py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md font-semibold"
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
