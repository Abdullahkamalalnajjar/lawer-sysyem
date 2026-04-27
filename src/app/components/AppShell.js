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
function Sidebar({ currentPath, isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  const router  = useRouter()
  const { user, logout } = useApp()
  const isManager = user?.roles?.includes('Manager')

  const navItems = [
    { href: '/dashboard',            icon: '🏛️', label: 'لوحة التحكم' },
    { href: '/clients',              icon: '👥', label: 'الموكلين' },
    { href: '/cases',                icon: '⚖️', label: 'القضايا' },
    { href: '/qawady',               icon: '📂', label: 'صور القضايا' },
    { href: '/sessions',             icon: '📋', label: 'الجلسات' },
    { href: '/sessions/agenda',      icon: '📅', label: 'الأجندة' },
    { href: '/administrative-works', icon: '🏛️', label: 'الأعمال الإدارية' },
    { href: '/finance',              icon: '💰', label: 'المالية',           managerOnly: true },
    { href: '/daily-accounts',       icon: '📊', label: 'الحسابات اليومية',  managerOnly: true },
    { href: '/daily-expenses',       icon: '💸', label: 'مصروفات المكتب',   managerOnly: true },
    { href: '/daily-notes',          icon: '📝', label: 'الملاحظات اليومية', managerOnly: true },
    { href: '/users',                icon: '👤', label: 'المستخدمين',        managerOnly: true },
  ]

  const visibleItems = navItems.filter(item => !item.managerOnly || isManager)

  const navigate = (href) => {
    router.push(href)
    onMobileClose()
  }

  return (
    <aside className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>

      {/* Logo */}
      <div className="sidebar-logo" style={{ justifyContent: 'space-between', overflow: 'hidden', minHeight: '76px' }}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
            <div className="sidebar-logo-icon">⚖️</div>
            <div className="sidebar-logo-text">
              <h1>مؤسسة اليقين</h1>
              <p>الأستاذ / محمود البلوي</p>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="sidebar-logo-icon">⚖️</div>
          </div>
        )}
        {/* Mobile close */}
        <button className="sidebar-close-btn" onClick={onMobileClose} aria-label="إغلاق">✕</button>
      </div>

      {/* Desktop toggle button */}
      <button
        className="sidebar-toggle-btn"
        onClick={onToggleCollapse}
        title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
      >
        {isCollapsed ? '›' : '‹'}
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {!isCollapsed && <p className="sidebar-section-title">القائمة الرئيسية</p>}
        {visibleItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            className={`sidebar-link ${currentPath === item.href ? 'active' : ''} ${isCollapsed ? 'sidebar-link-collapsed' : ''}`}
            onClick={e => { e.preventDefault(); navigate(item.href) }}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!isCollapsed && item.label}
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <>
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">{user?.email?.[0]?.toUpperCase() || 'م'}</div>
              <div>
                <div className="sidebar-user-name">{user?.email || 'المستخدم'}</div>
                <div className="sidebar-user-role">{user?.roles?.[0] || 'محامٍ قانوني'}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={logout}>تسجيل الخروج 🚪</button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <div className="sidebar-user-avatar" title={user?.email}>{user?.email?.[0]?.toUpperCase() || 'م'}</div>
            <button onClick={logout} title="تسجيل الخروج"
              style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
              🚪
            </button>
          </div>
        )}
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
  const [user, setUser]     = useState(null)
  const [toasts, setToasts] = useState([])
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      getCurrentUser()
        .then(res => { if (res?.value) setUser(res.value) })
        .catch(() => { clearTokens() })
        .finally(() => setInitialized(true))
    } else {
      setInitialized(true)
    }
  }, [])

  const login = async (email, password) => {
    await apiLogin({ email, password })
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
  const router   = useRouter()
  const pathname = usePathname()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapse state from localStorage (client-only)
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved === 'true') setIsCollapsed(true)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebarCollapsed', String(next))
      return next
    })
  }

  useEffect(() => {
    if (initialized && !user) router.push('/login')
  }, [user, initialized, router])

  useEffect(() => {
    if (initialized && user && requiredRole) {
      if (!user.roles?.includes(requiredRole)) router.push('/dashboard')
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

  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🔒</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '600' }}>غير مصرح بالوصول لهذه الصفحة</div>
      </div>
    )
  }

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <Sidebar
        currentPath={pathname}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="main-content">
        <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
