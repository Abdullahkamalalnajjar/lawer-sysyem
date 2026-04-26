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
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (user) router.push('/dashboard') }, [user, router])

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          background: #0a1628;
          position: relative;
          overflow: hidden;
        }

        /* ── Animated background ── */
        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: radial-gradient(ellipse 80% 60% at 20% 50%, rgba(15,118,110,0.35) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 80% at 80% 20%, rgba(15,118,110,0.20) 0%, transparent 55%),
                      radial-gradient(ellipse 50% 50% at 50% 100%, rgba(10,80,76,0.25) 0%, transparent 70%),
                      #0a1628;
        }
        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: orbFloat 8s ease-in-out infinite alternate;
        }
        .login-bg-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(15,118,110,0.5), transparent 70%);
          top: -150px; left: -100px;
          animation-delay: 0s;
        }
        .login-bg-orb-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(15,118,110,0.4), transparent 70%);
          bottom: -100px; right: -80px;
          animation-delay: -3s;
        }
        .login-bg-orb-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(15,118,110,0.3), transparent 70%);
          top: 40%; left: 40%;
          animation-delay: -5s;
        }
        @keyframes orbFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -40px) scale(1.1); }
        }

        /* ── Grid / content ── */
        .login-wrap {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          min-height: 100vh;
        }

        /* ── Left brand panel ── */
        .login-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 64px;
          position: relative;
        }
        .login-left-inner {
          opacity: 0;
          transform: translateX(-40px);
          animation: slideInRight 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
        }
        .login-logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50px;
          padding: 10px 20px;
          margin-bottom: 48px;
          backdrop-filter: blur(10px);
          width: fit-content;
        }
        .login-logo-icon {
          font-size: 22px;
          line-height: 1;
        }
        .login-logo-text {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.5px;
        }
        .login-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 56px);
          font-weight: 900;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 20px;
        }
        .login-headline span {
          background: linear-gradient(135deg, #14b8a6, #2dd4bf);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-desc {
          font-size: 16px;
          color: rgba(255,255,255,0.50);
          line-height: 1.8;
          max-width: 380px;
          margin-bottom: 56px;
        }
        .login-features {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .login-feature {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .login-feature-dot {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: rgba(15,118,110,0.20);
          border: 1px solid rgba(15,118,110,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .login-feature-text {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          font-weight: 600;
        }

        /* ── Right form panel ── */
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 48px;
          position: relative;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 28px;
          padding: 48px 44px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
          opacity: 0;
          transform: translateY(30px);
          animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.25s forwards;
        }
        .login-card-top {
          margin-bottom: 36px;
          text-align: center;
        }
        .login-card-icon {
          width: 64px; height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, #0f5e56, #0f766e);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          margin: 0 auto 20px;
          box-shadow: 0 12px 32px rgba(15,118,110,0.4);
        }
        .login-card-title {
          font-size: 26px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 8px;
        }
        .login-card-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.40);
        }

        /* ── Divider ── */
        .login-divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin-bottom: 32px;
        }

        /* ── Fields ── */
        .login-field {
          margin-bottom: 20px;
        }
        .login-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.60);
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          pointer-events: none;
          opacity: 0.5;
        }
        .login-input {
          width: 100%;
          padding: 14px 48px 14px 16px;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-size: 14px;
          font-family: 'Cairo', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(4px);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.25); }
        .login-input:focus {
          border-color: rgba(15,118,110,0.70);
          background: rgba(15,118,110,0.08);
          box-shadow: 0 0 0 4px rgba(15,118,110,0.15);
        }
        .login-input-pass { padding-left: 48px; }
        .login-eye-btn {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.5;
          transition: opacity 0.2s;
          padding: 4px;
        }
        .login-eye-btn:hover { opacity: 1; }

        /* ── Error ── */
        .login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(15,118,110,0.15);
          border: 1px solid rgba(15,118,110,0.30);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #5eead4;
          font-weight: 600;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
        }

        /* ── Submit ── */
        .login-submit {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #0f5e56 0%, #0f766e 50%, #14b8a6 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 8px 24px rgba(15,118,110,0.45);
          position: relative;
          overflow: hidden;
          margin-top: 8px;
          letter-spacing: 0.3px;
        }
        .login-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .login-submit:hover:not(:disabled)::before { opacity: 1; }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(15,118,110,0.55);
        }
        .login-submit:active:not(:disabled) { transform: translateY(0); }
        .login-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .login-spinner-row {
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .login-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Footer note ── */
        .login-card-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .login-lock-icon { font-size: 11px; }

        /* ── Animations ── */
        @keyframes slideInRight {
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .login-wrap { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 24px 20px; align-items: flex-start; padding-top: 60px; }
          .login-card { padding: 36px 28px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-bg">
          <div className="login-bg-orb login-bg-orb-1" />
          <div className="login-bg-orb login-bg-orb-2" />
          <div className="login-bg-orb login-bg-orb-3" />
        </div>

        <div className="login-wrap">
          {/* ── Left brand panel ── */}
          <div className="login-left">
            <div className="login-left-inner">
              <div className="login-logo-badge">
                <span className="login-logo-icon">⚖️</span>
                <span className="login-logo-text">مؤسسة اليقين</span>
              </div>

              <h1 className="login-headline">
                إدارة قضاياك<br />
                بكل <span>احترافية</span>
              </h1>

              <p className="login-desc">
                منصة متكاملة تجمع بين إدارة الموكلين والقضايا والجلسات والسجلات المالية في مكان واحد
              </p>

              <div className="login-features">
                {[
                  { icon: '👥', text: 'إدارة الموكلين وملفاتهم بشكل كامل' },
                  { icon: '⚖️', text: 'تتبع القضايا ومستجداتها لحظة بلحظة' },
                  { icon: '📅', text: 'جدولة الجلسات والتنبيهات تلقائياً' },
                  { icon: '💰', text: 'سجلات مالية دقيقة ومفصّلة' },
                ].map((f, i) => (
                  <div key={i} className="login-feature" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                    <div className="login-feature-dot">{f.icon}</div>
                    <span className="login-feature-text">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="login-right">
            <div className="login-card">
              <div className="login-card-top">
                <div className="login-card-icon">⚖️</div>
                <h2 className="login-card-title">تسجيل الدخول</h2>
                <p className="login-card-subtitle">أدخل بياناتك للوصول إلى لوحة التحكم</p>
              </div>

              <div className="login-divider" />

              <form onSubmit={handleSubmit} id="login-form">
                {/* Email */}
                <div className="login-field">
                  <label className="login-label" htmlFor="email-input">البريد الإلكتروني</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">✉️</span>
                    <input
                      id="email-input"
                      type="email"
                      placeholder="example@domain.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      autoComplete="email"
                      dir="ltr"
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="login-field">
                  <label className="login-label" htmlFor="password-input">كلمة المرور</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">🔑</span>
                    <input
                      id="password-input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      autoComplete="current-password"
                      dir="ltr"
                      className="login-input login-input-pass"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="login-eye-btn"
                      aria-label="إظهار / إخفاء كلمة المرور"
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="login-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  id="login-btn"
                  type="submit"
                  disabled={loading}
                  className="login-submit"
                >
                  {loading ? (
                    <span className="login-spinner-row">
                      <span className="login-spinner" />
                      جارٍ تسجيل الدخول...
                    </span>
                  ) : 'دخول إلى النظام  →'}
                </button>
              </form>

              <div className="login-card-footer">
                <span className="login-lock-icon">🔒</span>
                نظام محمي بتشفير كامل — بياناتك آمنة
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
