'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { login as apiLogin, getCurrentUser, clearTokens, getAccessToken } from '../lib/api'

// ==================== CONTEXT ====================
const AppContext = createContext(null)

export function useApp() {
  return useContext(AppContext)
}

// ==================== SIDEBAR ====================
function Sidebar({ currentPath, isOpen, onClose }) {
  const router = useRouter()
  const { user, logout } = useApp()

  const isManager = user?.roles?.includes('Manager')

  const navItems = [
    { href: '/dashboard',       icon: '🏛️', label: 'لوحة التحكم' },
    { href: '/clients',         icon: '👥', label: 'الموكلين' },
    { href: '/cases',           icon: '⚖️', label: 'القضايا' },
    { href: '/sessions',        icon: '📋', label: 'الجلسات' },
    { href: '/sessions/agenda', icon: '📅', label: 'الأجندة' },
    { href: '/bailiffs',        icon: '📁', label: 'شغل إداري' },
    { href: '/finance',         icon: '💰', label: 'المالية',           managerOnly: true },
    { href: '/daily-accounts',  icon: '📊', label: 'الحسابات اليومية',  managerOnly: true },
    { href: '/notes',           icon: '📝', label: 'الملاحظات',          managerOnly: true },
    { href: '/office-expenses', icon: '🏢', label: 'مصروفات المكتب',    managerOnly: true },
    { href: '/users',           icon: '👥', label: 'المستخدمين',        managerOnly: true },
  ]

  const visibleItems = navItems.filter(item => !item.managerOnly || isManager)

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-logo" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
          <div className="sidebar-logo-icon">⚖️</div>
          <div className="sidebar-logo-text">
            <h1>مؤسسة اليقين</h1>
            <p>الأستاذ / محمود البلوي</p>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="إغلاق القائمة">✕</button>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-title">القائمة الرئيسية</p>
        {visibleItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            className={`sidebar-link ${currentPath === item.href ? 'active' : ''}`}
            onClick={e => { e.preventDefault(); router.push(item.href); onClose(); }}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">{user?.email?.[0]?.toUpperCase() || 'م'}</div>
          <div>
            <div className="sidebar-user-name">{user?.email || 'المستخدم'}</div>
            <div className="sidebar-user-role">{user?.roles?.[0] || 'محامٍ قانوني'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          تسجيل الخروج 🚪
        </button>
      </div>
    </aside>
  )
}

// ==================== HEADER ====================
function Header({ onMenuToggle }) {
  return (
    <header className="header" style={{ justifyContent: 'flex-end', padding: '0 20px' }}>
      <button className="mobile-menu-btn" onClick={onMenuToggle}>☰</button>
    </header>
  )
}

// ==================== TOAST ====================
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)} style={{ cursor: 'pointer' }}>
          {t.type === 'success' ? '✅' : '❌'} {t.message}
        </div>
      ))}
    </div>
  )
}

// ==================== APP PROVIDER ====================
export function AppProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [toasts, setToasts] = useState([])
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  // On mount: check if valid token exists and fetch current user
  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      getCurrentUser()
        .then(res => {
          if (res?.value) setUser(res.value)
        })
        .catch(() => {
          clearTokens()
        })
        .finally(() => setInitialized(true))
    } else {
      setInitialized(true)
    }
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin({ email, password })
    // After successful login fetch user profile
    const userRes = await getCurrentUser()
    const userObj = userRes?.value ? { ...userRes.value, email } : { email }
    setUser(userObj)
    return userObj
  }

  const logout = () => {
    clearTokens()
    setUser(null)
    router.push('/login')
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <AppContext.Provider value={{ user, setUser, login, logout, showToast, initialized }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AppContext.Provider>
  )
}

// ==================== AUTH GUARD ====================
export function AuthGuard({ children, title, requiredRole }) {
  const { user, initialized } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login')
    }
  }, [user, initialized, router])

  // Role-based access control
  useEffect(() => {
    if (initialized && user && requiredRole) {
      const hasRole = user.roles?.includes(requiredRole)
      if (!hasRole) {
        router.push('/dashboard')
      }
    }
  }, [initialized, user, requiredRole, router])

  if (!initialized || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '36px', animation: 'spin 1s linear infinite' }}>⚖️</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>جارٍ التحقق من الهوية...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }}`}</style>
      </div>
    )
  }

  // Block render if role is required and user doesn't have it
  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🔒</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '600' }}>غير مصرح بالوصول لهذه الصفحة</div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <Sidebar currentPath={pathname} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="main-content">
        <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
