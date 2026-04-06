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
function Sidebar({ currentPath }) {
  const router = useRouter()
  const { user, logout } = useApp()

  const navItems = [
    { href: '/dashboard', icon: '🏛️', label: 'لوحة التحكم' },
    { href: '/clients',   icon: '👥', label: 'الموكلين' },
    { href: '/cases',     icon: '⚖️', label: 'القضايا' },
    { href: '/sessions',  icon: '📋', label: 'الجلسات' },
    { href: '/sessions/agenda', icon: '📅', label: 'الأجندة' },
    { href: '/finance',   icon: '💰', label: 'المالية' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚖️</div>
        <div className="sidebar-logo-text">
          <h1>نظام المحاماة</h1>
          <p>إدارة قانونية متكاملة</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-title">القائمة الرئيسية</p>
        {navItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            className={`sidebar-link ${currentPath === item.href ? 'active' : ''}`}
            onClick={e => { e.preventDefault(); router.push(item.href) }}
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
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
          🚪 تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}

// ==================== HEADER ====================
function Header({ title }) {
  const { user } = useApp()
  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  return (
    <header className="header">
      <div>
        <h2 className="header-title">{title}</h2>
        <div className="header-subtitle">{today}</div>
      </div>
      <div className="header-actions">
        <div className="header-user">
          <div className="header-user-info">
            <div className="header-user-name">{user?.email || 'المستخدم'}</div>
            <div className="header-user-role">{user?.roles?.[0] || 'محامٍ قانوني'}</div>
          </div>
          <div className="header-avatar">{user?.email?.[0]?.toUpperCase() || 'م'}</div>
        </div>
      </div>
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
export function AuthGuard({ children, title }) {
  const { user, initialized } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login')
    }
  }, [user, initialized, router])

  if (!initialized || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '36px', animation: 'spin 1s linear infinite' }}>⚖️</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>جارٍ التحقق من الهوية...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }}`}</style>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar currentPath={pathname} />
      <div className="main-content">
        <Header title={title} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
