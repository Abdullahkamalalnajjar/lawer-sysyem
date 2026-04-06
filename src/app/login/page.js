'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '../components/AppShell'

export default function LoginPage() {
  const { login, user } = useApp()
  const router = useRouter()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'بيانات الدخول غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* ── Left Panel (Red Brand) ── */}
      <div style={styles.leftPanel}>
        {/* Decorative circles */}
        <div style={styles.circle1} />
        <div style={styles.circle2} />
        <div style={styles.circle3} />

        <div style={styles.brandContent}>
          <div style={styles.brandLogo}>⚖️</div>
          <h1 style={styles.brandTitle}>نظام إدارة المحاماة</h1>
          <p style={styles.brandSubtitle}>
            منصة متكاملة لإدارة الموكلين والقضايا والجلسات والسجلات المالية
          </p>

          <div style={styles.featureList}>
            {[
              { icon: '👥', text: 'إدارة الموكلين' },
              { icon: '⚖️', text: 'تتبع القضايا' },
              { icon: '📅', text: 'جدولة الجلسات' },
              { icon: '💰', text: 'السجلات المالية' },
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={styles.brandFooter}>نظام قانوني احترافي متكامل</p>
      </div>

      {/* ── Right Panel (White Form) ── */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          {/* Header */}
          <div style={styles.formHeader}>
            <div style={styles.formLogoBox}>
              <span style={{ fontSize: '28px' }}>⚖️</span>
            </div>
            <h2 style={styles.formTitle}>تسجيل الدخول</h2>
            <p style={styles.formSubtitle}>أدخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} id="login-form">
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>البريد الإلكتروني</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  id="email-input"
                  type="email"
                  placeholder="example@domain.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                  dir="ltr"
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, styles.input)}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ ...styles.fieldGroup, marginBottom: '8px' }}>
              <label style={styles.label}>كلمة المرور</label>
              <div style={styles.inputWrapper}>
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                  dir="ltr"
                  style={{ ...styles.input, paddingLeft: '48px', paddingRight: '16px' }}
                  onFocus={e => Object.assign(e.target.style, { ...styles.inputFocus, paddingLeft: '48px', paddingRight: '16px' })}
                  onBlur={e => Object.assign(e.target.style, { ...styles.input, paddingLeft: '48px', paddingRight: '16px' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={styles.eyeBtn}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnLoading : {}),
              }}
            >
              {loading ? (
                <span style={styles.spinnerRow}>
                  <span style={styles.spinner} />
                  جارٍ تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول  →'
              )}
            </button>
          </form>

          <p style={styles.formFooterNote}>
            نظام محمي بتشفير كامل — جميع البيانات آمنة
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Inline Styles ──────────────────────────────────────── */
const RED = '#c0392b'
const RED_DARK = '#8b1a1a'
const RED_LIGHT = '#e74c3c'

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    direction: 'rtl',
    fontFamily: "'Cairo', 'Inter', sans-serif",
  },

  /* Left red panel */
  leftPanel: {
    flex: '0 0 42%',
    background: `linear-gradient(160deg, ${RED_DARK} 0%, ${RED} 45%, ${RED_LIGHT} 100%)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '52px 44px',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', top: '-80px', right: '-80px',
    width: '320px', height: '320px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    pointerEvents: 'none',
  },
  circle2: {
    position: 'absolute', bottom: '-120px', left: '-60px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },
  circle3: {
    position: 'absolute', top: '45%', left: '55%',
    width: '180px', height: '180px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    pointerEvents: 'none',
  },
  brandContent: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: '24px',
  },
  brandLogo: {
    width: '72px', height: '72px', borderRadius: '20px',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(12px)',
    border: '2px solid rgba(255,255,255,0.30)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  brandTitle: {
    fontSize: '30px', fontWeight: '900',
    color: '#ffffff', letterSpacing: '-0.5px',
    lineHeight: 1.2,
    fontFamily: "'Playfair Display', 'Cairo', serif",
  },
  brandSubtitle: {
    fontSize: '14px', color: 'rgba(255,255,255,0.80)',
    lineHeight: 1.7, fontWeight: '400', maxWidth: '320px',
  },
  featureList: {
    display: 'flex', flexDirection: 'column', gap: '12px',
    marginTop: '8px',
  },
  featureItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.10)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.16)',
    backdropFilter: 'blur(8px)',
  },
  featureIcon: { fontSize: '20px' },
  featureText: {
    fontSize: '14px', color: '#ffffff', fontWeight: '600',
  },
  brandFooter: {
    fontSize: '12px', color: 'rgba(255,255,255,0.55)',
    position: 'relative', zIndex: 1,
    letterSpacing: '0.5px',
  },

  /* Right white panel */
  rightPanel: {
    flex: 1,
    background: '#f8f4f4',
    backgroundImage: `
      linear-gradient(rgba(192,57,43,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(192,57,43,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
  },
  formCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '44px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(192,57,43,0.12), 0 4px 16px rgba(192,57,43,0.06)',
    border: '1px solid rgba(192,57,43,0.10)',
  },

  /* Form header */
  formHeader: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  formLogoBox: {
    width: '64px', height: '64px', borderRadius: '16px',
    background: `linear-gradient(135deg, ${RED_DARK}, ${RED})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: `0 8px 24px rgba(192,57,43,0.35)`,
  },
  formTitle: {
    fontSize: '22px', fontWeight: '900',
    color: '#1a0a0a', letterSpacing: '-0.3px',
    fontFamily: "'Playfair Display', 'Cairo', serif",
  },
  formSubtitle: {
    fontSize: '13px', color: '#9b7070',
    marginTop: '6px', fontWeight: '400',
  },

  /* Fields */
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '700',
    color: '#5a2828', marginBottom: '8px',
    letterSpacing: '0.2px',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute', right: '14px', top: '50%',
    transform: 'translateY(-50%)', fontSize: '16px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '12px 46px 12px 16px',
    background: '#fdf8f8',
    border: '1.5px solid rgba(192,57,43,0.15)',
    borderRadius: '10px',
    color: '#1a0a0a',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
    direction: 'ltr',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  inputFocus: {
    width: '100%',
    padding: '12px 46px 12px 16px',
    background: '#ffffff',
    border: `1.5px solid ${RED}`,
    borderRadius: '10px',
    color: '#1a0a0a',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
    direction: 'ltr',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    boxShadow: `0 0 0 3px rgba(192,57,43,0.08)`,
  },
  eyeBtn: {
    position: 'absolute', left: '12px', top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: '16px',
    padding: '4px', lineHeight: 1,
  },

  /* Error */
  errorBox: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    padding: '12px 14px',
    background: 'rgba(192,57,43,0.06)',
    border: '1px solid rgba(192,57,43,0.20)',
    borderRadius: '10px',
    color: RED, fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
  },

  /* Submit button */
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: `linear-gradient(135deg, ${RED_DARK} 0%, ${RED} 50%, ${RED_LIGHT} 100%)`,
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    boxShadow: `0 6px 20px rgba(192,57,43,0.35)`,
    transition: 'all 0.2s ease',
    fontFamily: "'Cairo', sans-serif",
    marginTop: '8px',
  },
  submitBtnLoading: {
    opacity: 0.75,
    cursor: 'not-allowed',
  },
  spinnerRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '10px',
  },
  spinner: {
    width: '18px', height: '18px',
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },

  formFooterNote: {
    textAlign: 'center',
    fontSize: '11.5px',
    color: '#d4bfbf',
    marginTop: '24px',
    letterSpacing: '0.3px',
  },
}
