import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Headphones,
  BarChart3,
  Target,
  Heart,
  ChevronDown,
  Shield,

  AlertCircle,
  Users,
  UserPlus,
} from 'lucide-react'
import './Header.css'

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="brand">
          <Heart size={24} fill="var(--primary-500)" stroke="none" />
          MindSpace
        </Link>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>


        <nav className={`nav-center ${isMobileOpen ? 'open' : ''}`}>
          <NavLink to="/mindfulness" className="nav__link" onClick={() => setIsMobileOpen(false)}>
            <Headphones size={18} />
            Mindfulness
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className="nav__link" onClick={() => setIsMobileOpen(false)}>
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>
              <NavLink to="/journal" className="nav__link" onClick={() => setIsMobileOpen(false)}>
                <BookOpen size={18} />
                Journal
              </NavLink>
              <NavLink to="/community" className="nav__link" onClick={() => setIsMobileOpen(false)}>
                <Users size={18} />
                Community
              </NavLink>

              {user?.role === 'user' && (
                <NavLink to="/therapists" className="nav__link" onClick={() => setIsMobileOpen(false)}>
                  <UserPlus size={18} />
                  Find Therapist
                </NavLink>
              )}

              {user?.role === 'therapist' && (
                <NavLink to="/therapist-dashboard" className="nav__link" onClick={() => setIsMobileOpen(false)}>
                  <Users size={18} />
                  Patients
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className={`nav-right ${isMobileOpen ? 'open' : ''}`}>
          <NavLink
            to="/crisis"
            className="get-help-button"
            onClick={() => setIsMobileOpen(false)}
          >
            <AlertCircle size={18} />
            Get Help
          </NavLink>

          {isAuthenticated ? (
            <div className="profile-menu-container" ref={dropdownRef}>
              <button
                className={`profile-button ${isProfileOpen ? 'active' : ''}`}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="profile-name">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={16} color="var(--neutral-400)" />
              </button>

              {isProfileOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-user-name">{user?.name}</span>
                    <span className="dropdown-user-email">{user?.email}</span>
                  </div>

                  {user?.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <Shield size={16} />
                      Admin Panel
                    </Link>
                  )}

                  <Link to="/dashboard" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <Link to="/journal" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <BookOpen size={16} />
                    Journal
                  </Link>
                  <Link to="/insights" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <BarChart3 size={16} />
                    Insights
                  </Link>
                  <Link to="/goals" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <Target size={16} />
                    Goals
                  </Link>

                  <div style={{ borderTop: '1px solid var(--neutral-100)', margin: '4px 0' }}></div>

                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <NavLink to="/register" className="nav__link" onClick={() => setIsMobileOpen(false)}>
                Register
              </NavLink>
              <NavLink to="/login" className="nav__link" onClick={() => setIsMobileOpen(false)}>
                Login
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header >
  )
}

export default Header
