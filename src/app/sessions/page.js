'use client'

import { useState, useEffect, useMemo } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import {
  getSessionsCalendar,
  getSessions, createSession, updateSession, deleteSession,
  getCases, getClients,
} from '../lib/api'

export default function SessionsPage() {
  return (
    <AuthGuard title="الجلسات والأجندة">
      <SessionsContent />
    </AuthGuard>
  )
}

const SESSION_TYPES = ['مرافعة', 'حكم', 'تحقيق', 'صلح', 'إشكال', 'أخرى']
const TYPE_COLORS = {
  'مرافعة': { bg: 'rgba(192,57,43,0.12)', color: '#c0392b', border: 'rgba(192,57,43,0.30)' },
  'حكم':    { bg: 'rgba(37,99,235,0.10)',  color: '#1d4ed8', border: 'rgba(37,99,235,0.25)' },
  'تحقيق':  { bg: 'rgba(217,119,6,0.10)',  color: '#b45309', border: 'rgba(217,119,6,0.25)' },
  'صلح':    { bg: 'rgba(5,150,105,0.10)',  color: '#047857', border: 'rgba(5,150,105,0.25)' },
  'إشكال':  { bg: 'rgba(139,26,26,0.10)',  color: '#8b1a1a', border: 'rgba(139,26,26,0.25)' },
  'أخرى':   { bg: 'rgba(107,49,64,0.08)',  color: '#7a3345', border: 'rgba(107,49,64,0.20)' },
}

const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const ARABIC_DAYS   = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']

// ── helpers ────────────────────────────────────────────────────
function fmt(d) {
  // YYYY-M-D  (no leading zeros — as API expects)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}
function isoDate(d) {
  return d.toISOString().slice(0,10)
}
function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}

// ── Add / Edit Session Modal ───────────────────────────────────
function SessionModal({ session, cases, clientMap, onClose, onSave, saving }) {
  const [form, setForm] = useState(session ? {
    caseId:      session.caseId || '',
    roll:        session.roll || '',
    decision:    session.decision || '',
    sessionDate: session.sessionDate?.split('T')[0] || '',
    requests:    session.requests || '',
    sessionType: session.sessionType || 'مرافعة',
  } : { caseId:'', roll:'', decision:'', sessionDate:'', requests:'', sessionType:'مرافعة' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.caseId)      e.caseId      = 'يجب اختيار القضية'
    if (!form.sessionDate) e.sessionDate = 'تاريخ الجلسة مطلوب'
    return e
  }
  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave(form)
  }
  const field = (key, label, children, err) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {err && <span style={{ fontSize:'12px', color:'var(--danger)' }}>{err}</span>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:'740px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">📅</div>
            {session ? 'تعديل بيانات الجلسة' : 'إضافة جلسة جديدة'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Case */}
              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span>القضية</label>
                <select className="form-select" value={form.caseId}
                  onChange={e => setForm(p=>({...p,caseId:e.target.value}))}
                  style={errors.caseId?{borderColor:'var(--danger)'}:{}}>
                  <option value="">-- اختر القضية --</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {clientMap[c.clientId]||'موكل'}</option>)}
                </select>
                {errors.caseId && <span style={{fontSize:'12px',color:'var(--danger)'}}>{errors.caseId}</span>}
              </div>
              {/* Date */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>تاريخ الجلسة</label>
                <input className="form-input" type="date" value={form.sessionDate} dir="ltr"
                  onChange={e=>setForm(p=>({...p,sessionDate:e.target.value}))}
                  style={errors.sessionDate?{borderColor:'var(--danger)'}:{}} />
                {errors.sessionDate && <span style={{fontSize:'12px',color:'var(--danger)'}}>{errors.sessionDate}</span>}
              </div>
              {/* Type */}
              <div className="form-group">
                <label className="form-label">نوع الجلسة</label>
                <select className="form-select" value={form.sessionType}
                  onChange={e=>setForm(p=>({...p,sessionType:e.target.value}))}>
                  {SESSION_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              {/* Roll */}
              <div className="form-group">
                <label className="form-label">الجولة / الدور</label>
                <input className="form-input" placeholder="رقم الجولة" value={form.roll}
                  onChange={e=>setForm(p=>({...p,roll:e.target.value}))} />
              </div>
              {/* Decision */}
              <div className="form-group">
                <label className="form-label">القرار</label>
                <input className="form-input" placeholder="قرار الجلسة" value={form.decision}
                  onChange={e=>setForm(p=>({...p,decision:e.target.value}))} />
              </div>
              {/* Requests */}
              <div className="form-group form-full">
                <label className="form-label">الطلبات</label>
                <textarea className="form-input" rows={3} placeholder="طلبات الجلسة..." value={form.requests}
                  onChange={e=>setForm(p=>({...p,requests:e.target.value}))}
                  style={{resize:'vertical'}} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-session-btn">
              {saving ? '⏳ جارٍ الحفظ...' : session ? '💾 حفظ التعديلات' : '➕ إضافة الجلسة'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Session Card (event pill) ──────────────────────────────────
function SessionPill({ session, onClick }) {
  const colors = TYPE_COLORS[session.sessionType] || TYPE_COLORS['أخرى']
  return (
    <div
      onClick={() => onClick(session)}
      style={{
        padding: '3px 8px',
        borderRadius: '6px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.color,
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        transition: 'all 0.15s',
      }}
      title={`${session.caseNumber} | ${session.clientName} | ${session.sessionType}`}
    >
      {session.caseNumber || '—'}
    </div>
  )
}

// ── Main Content ───────────────────────────────────────────────
function SessionsContent() {
  const { showToast } = useApp()
  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [calSessions, setCalSessions] = useState([])      // from calendar endpoint
  const [cases, setCases]             = useState([])
  const [clients, setClients]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setModal]         = useState(false)
  const [editSess, setEdit]           = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)     // Date object
  const [saving, setSaving]           = useState(false)
  const [tab, setTab]                 = useState('calendar') // 'calendar' | 'agenda'

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map(c=>[c.id,c.name])),
    [clients]
  )

  // Load calendar for current month ± 1 month buffer
  const loadCalendar = async (year, month) => {
    setLoading(true)
    try {
      const start = new Date(year, month-1, 1)
      const end   = new Date(year, month+1, 0)
      const [sessions, c, cl] = await Promise.all([
        getSessionsCalendar(fmt(start), fmt(end)),
        getCases(),
        getClients(),
      ])
      setCalSessions(sessions)
      setCases(c)
      setClients(cl)
    } catch(err) {
      showToast(err.message || 'فشل تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCalendar(viewYear, viewMonth+1) }, [viewYear, viewMonth])

  // Sessions grouped by ISO date string
  const byDate = useMemo(() => {
    const map = {}
    calSessions.forEach(s => {
      const key = isoDate(new Date(s.sessionDate))
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return map
  }, [calSessions])

  // Build calendar grid
  const { weeks, firstDay } = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const last  = new Date(viewYear, viewMonth+1, 0)
    const startDow = first.getDay()   // 0=Sun
    const days = []

    // leading empties
    for (let i=0; i<startDow; i++) days.push(null)
    // month days
    for (let d=1; d<=last.getDate(); d++) days.push(new Date(viewYear, viewMonth, d))
    // trailing empties to complete last row
    while (days.length % 7) days.push(null)

    const weeks = []
    for (let i=0; i<days.length; i+=7) weeks.push(days.slice(i,i+7))
    return { weeks, firstDay: first }
  }, [viewYear, viewMonth])

  // Navigate month
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1) }
    else setViewMonth(m=>m-1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1) }
    else setViewMonth(m=>m+1)
  }
  const goToday = () => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()) }

  // Selected-day sessions
  const dayKey      = selectedDay ? isoDate(selectedDay) : null
  const daySessions = dayKey ? (byDate[dayKey] || []) : []

  // Agenda list — all sessions sorted
  const agendaSessions = useMemo(() =>
    [...calSessions].sort((a,b) => new Date(a.sessionDate)-new Date(b.sessionDate)),
    [calSessions]
  )

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editSess?.id) { await updateSession(editSess.id, form); showToast('تم تعديل الجلسة بنجاح') }
      else              { await createSession(form);               showToast('تم إضافة الجلسة بنجاح') }
      setModal(false); setEdit(null)
      await loadCalendar(viewYear, viewMonth+1)
    } catch(err) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟')) return
    try {
      await deleteSession(id)
      showToast('تم حذف الجلسة', 'error')
      await loadCalendar(viewYear, viewMonth+1)
      setSelectedDay(null)
    } catch(err) { showToast(err.message || 'فشل الحذف', 'error') }
  }

  const sessionCount = calSessions.length
  const upcomingCount = calSessions.filter(s => new Date(s.sessionDate) >= today).length

  // Navigation for layout consistency (optional, or just remove tabs)
  
  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">الجلسات</span></p>
          <h2>الجلسات</h2>
          <p>قائمة جميع الجلسات المسجلة</p>
        </div>
        <button id="add-session-btn" className="btn btn-primary"
          onClick={() => { setEdit(null); setModal(true) }}>
          ➕ إضافة جلسة
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:'24px' }}>
        <div className="stat-card"><div className="stat-icon gold">📅</div><div className="stat-info"><h3>{sessionCount}</h3><p>جلسات الشهر</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">⏳</div><div className="stat-info"><h3>{upcomingCount}</h3><p>جلسات قادمة</p></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3>{sessionCount - upcomingCount}</h3><p>جلسات منتهية</p></div></div>
        <div className="stat-card"><div className="stat-icon red">⚖️</div><div className="stat-info"><h3>{cases.length}</h3><p>إجمالي القضايا</p></div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">📋 قائمة الجلسات</div>
            <div className="card-subtitle">{ARABIC_MONTHS[viewMonth]} {viewYear} — {agendaSessions.length} جلسة</div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{fontSize:'36px'}}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
        ) : agendaSessions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📅</span>
            <h3>لا توجد جلسات</h3>
            <p>لا توجد جلسات مسجلة لهذا الشهر</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th>
                <th>التاريخ</th>
                <th>رقم القضية</th>
                <th>الموكل</th>
                <th>الخصم</th>
                <th>النوع</th>
                <th>الجولة</th>
                <th>القرار</th>
                <th>الإجراءات</th>
              </tr></thead>
              <tbody>
                {agendaSessions.map((s,i)=>{
                  const d = new Date(s.sessionDate)
                  const past = d < today
                  const clr = TYPE_COLORS[s.sessionType] || TYPE_COLORS['أخرى']
                  return (
                    <tr key={s.id} style={{ opacity: past ? 0.70 : 1 }}>
                      <td className="td-secondary">{i+1}</td>
                      <td>
                        <div style={{ fontWeight:'700', color: past?'#9b7070':'#1a0a0a', fontSize:'13px' }}>
                          {d.getDate()} {ARABIC_MONTHS[d.getMonth()]}
                        </div>
                        <div style={{ fontSize:'11px', color:'#9b7070' }}>{d.getFullYear()}</div>
                      </td>
                      <td style={{ fontWeight:'700', color:'#c0392b' }}>{s.caseNumber||'—'}</td>
                      <td style={{ fontWeight:'600' }}>{s.clientName||'—'}</td>
                      <td className="td-secondary">{s.opponentName||'—'}</td>
                      <td>
                        <span style={{ padding:'3px 10px', borderRadius:'99px', fontSize:'11px',
                          fontWeight:'700', background: clr.bg, color: clr.color, border:`1px solid ${clr.border}` }}>
                          {s.sessionType}
                        </span>
                      </td>
                      <td className="td-secondary">{s.roll||'—'}</td>
                      <td style={{ maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {s.decision||'—'}
                      </td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm btn-icon"
                            onClick={()=>{setEdit(s);setModal(true)}} title="تعديل">✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon"
                            onClick={()=>handleDelete(s.id)} title="حذف">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <SessionModal
          session={editSess}
          cases={cases}
          clientMap={clientMap}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}

// ── Micro-styles ──────────────────────────────────────────────
const navBtn = {
  background: 'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)',
  borderRadius:'8px', color:'#fff', width:'32px', height:'32px',
  cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center',
}
const smRedBtn = {
  background:'#c0392b', color:'#fff', border:'none', borderRadius:'8px',
  padding:'7px 14px', fontSize:'12px', fontWeight:'700', cursor:'pointer',
  fontFamily:"'Cairo', sans-serif",
}
const smEditBtn = {
  background:'rgba(192,57,43,0.08)', color:'#c0392b',
  border:'1px solid rgba(192,57,43,0.20)', borderRadius:'8px',
  padding:'5px 10px', fontSize:'12px', fontWeight:'700', cursor:'pointer',
  fontFamily:"'Cairo', sans-serif",
}
const smDelBtn = {
  background:'rgba(220,38,38,0.08)', color:'#b91c1c',
  border:'1px solid rgba(220,38,38,0.20)', borderRadius:'8px',
  padding:'5px 10px', fontSize:'14px', cursor:'pointer',
}
