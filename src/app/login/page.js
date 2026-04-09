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
    <div className="ls-login-page">

      {/* ── Left red brand panel (hidden on mobile) ── */}
      <div className="ls-login-left">
        <div className="ls-login-circle ls-login-circle-1" />
        <div className="ls-login-circle ls-login-circle-2" />
        <div className="ls-login-circle ls-login-circle-3" />

        <div className="ls-login-brand">
          <div className="ls-login-brand-logo">⚖️</div>
          <h1 className="ls-login-brand-title">نظام إدارة المحاماة</h1>
          <p className="ls-login-brand-subtitle">
            منصة متكاملة لإدارة الموكلين والقضايا والجلسات والسجلات المالية
          </p>
          <div className="ls-login-features">
            {[
              { icon: '👥', text: 'إدارة الموكلين' },
              { icon: '⚖️', text: 'تتبع القضايا' },
              { icon: '📅', text: 'جدولة الجلسات' },
              { icon: '💰', text: 'السجلات المالية' },
            ].map((f, i) => (
              <div key={i} className="ls-login-feature-item">
                <span className="ls-login-feature-icon">{f.icon}</span>
                <span className="ls-login-feature-label">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="ls-login-brand-footer">نظام قانوني احترافي متكامل</p>
      </div>

      {/* ── Right white form panel ── */}
      <div className="ls-login-right">

        {/* Mobile-only compact brand header */}
        <div className="ls-login-mobile-brand">
          <div className="ls-login-mobile-logo">⚖️</div>
          <span className="ls-login-mobile-name">نظام إدارة المحاماة</span>
        </div>

        <div className="ls-login-card">
          <div className="ls-login-card-header">
            <div className="ls-login-card-logo">
              <span style={{ fontSize: '28px' }}>⚖️</span>
            </div>
            <h2 className="ls-login-card-title">تسجيل الدخول</h2>
            <p className="ls-login-card-subtitle">أدخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} id="login-form">

            {/* Email */}
            <div className="ls-login-field">
              <label className="ls-login-label" htmlFor="email-input">البريد الإلكتروني</label>
              <div className="ls-login-input-wrap">
                <span className="ls-login-input-icon">✉️</span>
                <input
                  id="email-input"
                  type="email"
                  placeholder="example@domain.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                  dir="ltr"
                  className="ls-login-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="ls-login-field">
              <label className="ls-login-label" htmlFor="password-input">كلمة المرور</label>
              <div className="ls-login-input-wrap">
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                  dir="ltr"
                  className="ls-login-input ls-login-input-pass"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="ls-login-eye-btn"
                  aria-label="إظهار / إخفاء كلمة المرور"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="ls-login-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className={`ls-login-submit${loading ? ' ls-login-submit-loading' : ''}`}
            >
              {loading ? (
                <span className="ls-login-spinner-row">
                  <span className="ls-login-spinner" />
                  جارٍ تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول  →'
              )}
            </button>
          </form>

          <p className="ls-login-footer-note">
            نظام محمي بتشفير كامل — جميع البيانات آمنة
          </p>
        </div>
      </div>
    </div>
  )
}
