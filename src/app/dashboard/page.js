'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp, AuthGuard } from '../components/AppShell'
import { getClients, getCases, getSessions, getFinancialRecords } from '../lib/api'

export default function DashboardPage() {
  return (
    <AuthGuard title="لوحة التحكم">
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user, showToast } = useApp()
  const router = useRouter()
  const [data, setData]     = useState({ clients: [], cases: [], sessions: [], finance: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getClients(), getCases(), getSessions(), getFinancialRecords()])
      .then(([clients, cases, sessions, finance]) => {
        setData({ clients, cases, sessions, finance })
      })
      .catch(err => showToast(err.message || 'فشل تحميل البيانات', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const upcomingSessions = data.sessions
    .filter(s => new Date(s.sessionDate) >= today)
    .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))
    .slice(0, 4)

  const recentCases = [...data.cases].slice(-4).reverse()

  const clientMap = Object.fromEntries(data.clients.map(c => [c.id, c.name]))
  const caseMap   = Object.fromEntries(data.cases.map(c => [c.id, c]))

  const statCards = [
    { icon: '👥', label: 'إجمالي الموكلين', value: data.clients.length, color: 'gold', href: '/clients' },
    { icon: '⚖️', label: 'القضايا المسجلة', value: data.cases.length,   color: 'blue', href: '/cases' },
    { icon: '📅', label: 'الجلسات المقررة', value: data.sessions.length, color: 'green', href: '/sessions' },
    { icon: '💰', label: 'السجلات المالية', value: data.finance.length,  color: 'red', href: '/finance' },
  ]

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span>الرئيسية</span> <span>›</span> <span className="active">لوحة التحكم</span>
          </p>
          <h2>مرحباً، البيانات الشاملة</h2>
          <p>إليك نظرة عامة على نظام مؤسسة اليقين</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/clients')}>
          ➕ إضافة موكل جديد
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card" onClick={() => router.push(s.href)} style={{ cursor: 'pointer' }}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              {loading ? (
                <div className="skeleton" style={{ width: '50px', height: '32px', marginBottom: '6px' }} />
              ) : (
                <h3>{s.value}</h3>
              )}
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="dashboard-card-grid">
        {/* Recent Cases */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">⚖️ آخر القضايا</div>
              <div className="card-subtitle">أحدث القضايا المسجلة</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/cases')}>عرض الكل</button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1,2,3].map(k => <div key={k} className="skeleton" style={{ height: '60px', borderRadius: '10px' }} />)}
            </div>
          ) : recentCases.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <span className="empty-state-icon" style={{ fontSize: '36px' }}>⚖️</span>
              <p>لا توجد قضايا مسجلة</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentCases.map(c => (
                <div key={c.id} style={{
                  padding: '14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-default)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'border-color 0.2s',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  onClick={() => router.push('/cases')}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--gold-bright)' }}>قضية {c.caseNumber}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      {clientMap[c.clientId] || '—'} ضد {c.opponentName}
                    </div>
                  </div>
                  <div>
                    <span className="badge badge-blue">{c.caseType}</span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>{c.caseClassification}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📅 الجلسات القادمة</div>
              <div className="card-subtitle">أقرب جلسات المحكمة</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/sessions')}>عرض الكل</button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1,2,3].map(k => <div key={k} className="skeleton" style={{ height: '60px', borderRadius: '10px' }} />)}
            </div>
          ) : upcomingSessions.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <span className="empty-state-icon" style={{ fontSize: '36px' }}>📅</span>
              <p>لا توجد جلسات قادمة</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingSessions.map(s => {
                const c = caseMap[s.caseId]
                return (
                  <div key={s.id} style={{
                    padding: '14px', borderRadius: '10px',
                    background: 'rgba(15,118,110,0.05)',
                    border: '1px solid var(--border-gold)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>قضية {c?.caseNumber || '—'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        {clientMap[c?.clientId] || '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.sessionType}</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '14px', color: 'var(--gold-bright)', fontWeight: '800' }}>
                        {formatDate(s.sessionDate)}
                      </div>
                      {s.decision && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>{s.decision}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-title" style={{ marginBottom: '16px' }}>⚡ إجراءات سريعة</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'إضافة موكل', icon: '👤', href: '/clients' },
            { label: 'تسجيل قضية', icon: '📋', href: '/cases' },
            { label: 'حجز جلسة',   icon: '🗓️', href: '/sessions' },
            { label: 'قيد مالي',   icon: '💵', href: '/finance' },
          ].map(a => (
            <button key={a.label} className="btn btn-secondary"
              style={{ flex: 1, minWidth: '120px', justifyContent: 'center', padding: '14px' }}
              onClick={() => router.push(a.href)}>
              <span style={{ fontSize: '20px' }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
