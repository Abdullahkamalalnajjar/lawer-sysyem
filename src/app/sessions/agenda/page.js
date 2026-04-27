'use client'

import { useState, useEffect, useMemo } from 'react'
import { useApp, AuthGuard } from '../../components/AppShell'
import {
  getSessions, createSession, updateSession, deleteSession,
  getCases, getClients, getSessionsCalendar,
} from '../../lib/api'

export default function AgendaPage() {
  return (
    <AuthGuard title="الأجندة">
      <AgendaContent />
    </AuthGuard>
  )
}

const SESSION_TYPES = ['مرافعة', 'حكم', 'تحقيق', 'صلح', 'إشكال', 'أخرى']
const TYPE_COLORS = {
  'مرافعة': { bg: 'rgba(15,118,110,0.12)', color: '#0f766e', border: 'rgba(15,118,110,0.30)' },
  'حكم':    { bg: 'rgba(37,99,235,0.10)',  color: '#1d4ed8', border: 'rgba(37,99,235,0.25)' },
  'تحقيق':  { bg: 'rgba(217,119,6,0.10)',  color: '#b45309', border: 'rgba(217,119,6,0.25)' },
  'صلح':    { bg: 'rgba(5,150,105,0.10)',  color: '#047857', border: 'rgba(5,150,105,0.25)' },
  'إشكال':  { bg: 'rgba(15,94,86,0.10)',  color: '#0f5e56', border: 'rgba(15,94,86,0.25)' },
  'أخرى':   { bg: 'rgba(107,49,64,0.08)',  color: '#7a3345', border: 'rgba(107,49,64,0.20)' },
}

const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const ARABIC_DAYS   = ['أحد','اثن','ثلا','أرب','خمس','جمع','سبت']

function fmt(d) { return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}` }
// Use LOCAL date getters — toISOString() gives UTC which shifts dates in UTC+ timezones
function isoDate(d) {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}

// ── Session Modal ──────────────────────────────────────────────
function SessionModal({ session, cases, clientMap, onClose, onSave, saving }) {
  const [form, setForm] = useState(session ? {
    caseId:          session.caseId || '',
    roll:            session.roll || '',
    decision:        session.decision || '',
    sessionDate:     session.sessionDate?.split('T')[0] || '',
    nextSessionDate: session.nextSessionDate?.split('T')[0] || '',
    requests:        session.requests || session.request || '',
  } : { caseId:'', roll:'', decision:'', sessionDate:'', nextSessionDate:'', requests:'' })
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
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>تاريخ الجلسة</label>
                <input className="form-input" type="date" value={form.sessionDate} dir="ltr"
                  onChange={e=>setForm(p=>({...p,sessionDate:e.target.value}))}
                  style={errors.sessionDate?{borderColor:'var(--danger)'}:{}} />
                {errors.sessionDate && <span style={{fontSize:'12px',color:'var(--danger)'}}>{errors.sessionDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">تاريخ الجلسة القادمة (اختياري)</label>
                <input className="form-input" type="date" value={form.nextSessionDate} dir="ltr"
                  onChange={e=>setForm(p=>({...p,nextSessionDate:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">الجولة / الدور</label>
                <input className="form-input" placeholder="رقم الجولة" value={form.roll}
                  onChange={e=>setForm(p=>({...p,roll:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">القرار</label>
                <input className="form-input" placeholder="قرار الجلسة" value={form.decision}
                  onChange={e=>setForm(p=>({...p,decision:e.target.value}))} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">الطلبات</label>
                <textarea className="form-input" rows={3} placeholder="طلبات الجلسة..." value={form.requests}
                  onChange={e=>setForm(p=>({...p,requests:e.target.value}))}
                  style={{resize:'vertical'}} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ جارٍ الحفظ...' : session ? '💾 حفظ التعديلات' : '➕ إضافة الجلسة'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SessionPill({ session, onClick }) {
  const ended = session.isEnded
  return (
    <div
      onClick={() => onClick(session)}
      className="agenda-pill"
      style={{
        background: ended ? 'rgba(100,116,139,0.10)' : 'rgba(15,118,110,0.12)',
        border: `1px solid ${ended ? 'rgba(100,116,139,0.25)' : 'rgba(15,118,110,0.30)'}`,
        color: ended ? '#64748b' : '#0f766e',
        textDecoration: ended ? 'line-through' : 'none',
      }}
      title={session.title}
    >
      {session.title || '—'}
    </div>
  )
}

function AgendaContent() {
  const { showToast } = useApp()
  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [calSessions, setCalSessions] = useState([])
  const [cases, setCases]             = useState([])
  const [clients, setClients]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setModal]         = useState(false)
  const [editSess, setEdit]           = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [saving, setSaving]           = useState(false)
  // Mobile: show detail panel instead of calendar
  const [mobileView, setMobileView]   = useState('calendar') // 'calendar' | 'detail'

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map(c=>[c.id,c.name])),
    [clients]
  )

  const loadCalendar = async (year, month) => {
    setLoading(true)
    try {
      // API treats `to` as exclusive — pass first day of next month to include the full viewed month
      const firstDay  = new Date(year, month - 1, 1)
      const firstNext = new Date(year, month, 1)          // first day of next month
      const from = `${firstDay.getFullYear()}-${firstDay.getMonth()+1}-${firstDay.getDate()}`
      const to   = `${firstNext.getFullYear()}-${firstNext.getMonth()+1}-${firstNext.getDate()}`
      const [calData, c, cl] = await Promise.all([
        getSessionsCalendar(from, to),
        getCases(),
        getClients(),
      ])
      setCalSessions(calData)
      setCases(c)
      setClients(cl)
    } catch(err) {
      showToast(err.message || 'فشل تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCalendar(viewYear, viewMonth+1) }, [viewYear, viewMonth])

  const byDate = useMemo(() => {
    const map = {}
    calSessions.forEach(s => {
      // Calendar API returns `start` (ISO datetime) instead of `sessionDate`
      const key = isoDate(new Date(s.start || s.sessionDate))
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return map
  }, [calSessions])

  const { weeks } = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const last  = new Date(viewYear, viewMonth+1, 0)
    const startDow = first.getDay()
    const days = []
    for (let i=0; i<startDow; i++) days.push(null)
    for (let d=1; d<=last.getDate(); d++) days.push(new Date(viewYear, viewMonth, d))
    while (days.length % 7) days.push(null)
    const weeks = []
    for (let i=0; i<days.length; i+=7) weeks.push(days.slice(i,i+7))
    return { weeks }
  }, [viewYear, viewMonth])

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1) } else setViewMonth(m=>m-1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1) } else setViewMonth(m=>m+1) }
  const goToday = () => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()) }

  const dayKey      = selectedDay ? isoDate(selectedDay) : null
  const daySessions = dayKey ? (byDate[dayKey] || []) : []
  const sessionCount   = calSessions.length
  const upcomingCount  = calSessions.filter(s => !s.isEnded).length

  const handleDayClick = (day, isSel) => {
    setSelectedDay(isSel ? null : day)
    setMobileView('detail')
  }

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
      setMobileView('calendar')
    } catch(err) { showToast(err.message || 'فشل الحذف', 'error') }
  }

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">الأجندة</span></p>
          <h2>الأجندة</h2>
          <p>جدول جلسات المحكمة الشهري</p>
        </div>
        <button id="add-session-btn" className="btn btn-primary"
          onClick={() => { setEdit(null); setModal(true) }}>
          ➕ إضافة جلسة
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid agenda-stats" style={{ marginBottom:'24px' }}>
        <div className="stat-card"><div className="stat-icon gold">📅</div><div className="stat-info"><h3>{sessionCount}</h3><p>جلسات الشهر</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">⏳</div><div className="stat-info"><h3>{upcomingCount}</h3><p>جلسات قادمة</p></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3>{sessionCount - upcomingCount}</h3><p>جلسات منتهية</p></div></div>
        <div className="stat-card"><div className="stat-icon red">⚖️</div><div className="stat-info"><h3>{cases.length}</h3><p>إجمالي القضايا</p></div></div>
      </div>

      {/* ── Mobile back button (detail → calendar) ── */}
      {mobileView === 'detail' && (
        <button
          className="agenda-mobile-back"
          onClick={() => setMobileView('calendar')}
        >
          ← العودة إلى التقويم
        </button>
      )}

      {/* ── Main layout ── */}
      <div className="agenda-layout">

        {/* ── Calendar panel ── */}
        <div className={`agenda-calendar-panel${mobileView === 'detail' ? ' agenda-hidden-mobile' : ''}`}>
          {/* Calendar header */}
          <div className="agenda-cal-header">
            <div className="agenda-cal-nav">
              <button onClick={prevMonth} className="agenda-nav-btn">‹</button>
              <button onClick={nextMonth} className="agenda-nav-btn">›</button>
              <button onClick={goToday} className="agenda-nav-btn agenda-nav-today">اليوم</button>
            </div>
            <div className="agenda-cal-title">
              <div className="agenda-cal-month">{ARABIC_MONTHS[viewMonth]} <span>{viewYear}</span></div>
              <div className="agenda-cal-count">{sessionCount} جلسة مسجلة</div>
            </div>
          </div>

          {/* Day names */}
          <div className="agenda-day-names">
            {ARABIC_DAYS.map(d => <div key={d} className="agenda-day-name">{d}</div>)}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="agenda-loading">⏳<div>جاري تحميل التقويم...</div></div>
          ) : (
            <div>
              {weeks.map((week, wi) => (
                <div key={wi} className="agenda-week-row">
                  {week.map((day, di) => {
                    if (!day) return (
                      <div key={di} className="agenda-cell agenda-cell-empty"
                        style={{ borderRight: di>0 ? '1px solid #f0f0f0' : 'none', borderBottom: wi<weeks.length-1 ? '1px solid #f0f0f0' : 'none' }} />
                    )
                    const key    = isoDate(day)
                    const events = byDate[key] || []
                    const isToday = sameDay(day, today)
                    const isSel   = selectedDay && sameDay(day, selectedDay)
                    return (
                      <div
                        key={di}
                        onClick={() => handleDayClick(day, isSel)}
                        className={`agenda-cell${isToday ? ' agenda-cell-today' : ''}${isSel ? ' agenda-cell-selected' : ''}`}
                        style={{
                          borderRight: di>0 ? '1px solid #f0f0f0' : 'none',
                          borderBottom: wi<weeks.length-1 ? '1px solid #f0f0f0' : 'none',
                        }}
                      >
                        <div className={`agenda-day-num${isToday ? ' agenda-day-num-today' : ''}${isSel ? ' agenda-day-num-sel' : ''}`}>
                          {day.getDate()}
                        </div>
                        <div className="agenda-pills">
                          {events.slice(0,2).map((s,i) => <SessionPill key={i} session={s} onClick={() => handleDayClick(day, false)} />)}
                          {events.length > 2 && (
                            <div className="agenda-more">+{events.length-2}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Side / Detail panel ── */}
        <div className={`agenda-detail-panel${mobileView === 'calendar' ? ' agenda-hidden-mobile' : ''}`}>
          <div className="agenda-detail-header">
            <div className="agenda-detail-title">
              {selectedDay
                ? `${selectedDay.getDate()} ${ARABIC_MONTHS[selectedDay.getMonth()]} ${selectedDay.getFullYear()}`
                : 'تفاصيل اليوم'}
            </div>
            <div className="agenda-detail-subtitle">
              {selectedDay
                ? `${daySessions.length} جلسة`
                : 'اختر يوماً من التقويم'}
            </div>
          </div>

          <div className="agenda-detail-body">
            {!selectedDay ? (
              <div className="agenda-detail-empty">
                <div style={{ fontSize:'48px', marginBottom:'16px', opacity:0.4 }}>📅</div>
                <div>حدد يوماً لعرض التفاصيل</div>
              </div>
            ) : daySessions.length === 0 ? (
              <div className="agenda-detail-empty">
                <div style={{ fontSize:'40px', marginBottom:'16px', opacity:0.5 }}>☕</div>
                <div style={{ fontWeight:'700', marginBottom:'16px' }}>لا توجد جلسات</div>
                <button
                  onClick={() => { setEdit(null); setModal(true) }}
                  className="btn btn-primary btn-sm"
                  style={{ width:'100%', justifyContent:'center' }}
                >
                  ➕ إضافة جلسة الآن
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {daySessions.map((s,i) => {
                  const caseObj = cases.find(c => c.id === s.caseId)
                  return (
                    <div key={i} className="agenda-session-card" style={{ borderRight: s.isEnded ? '4px solid #94a3b8' : '4px solid #0f766e' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'800', color: s.isEnded ? '#64748b' : '#0f766e' }}>
                            {s.title || caseObj?.caseNumber || '—'}
                          </div>
                          {caseObj && (
                            <div style={{ fontSize:'12px', color:'#555', marginTop:'4px' }}>
                              {clientMap[caseObj.clientId] || '—'}
                            </div>
                          )}
                          {caseObj?.opponent && (
                            <div style={{ fontSize:'11px', color:'#777', marginTop:'2px' }}>ضد / {caseObj.opponent}</div>
                          )}
                        </div>
                        <span style={{
                          padding:'3px 9px', borderRadius:'4px',
                          fontSize:'10px', fontWeight:'800',
                          color: s.isEnded ? '#64748b' : '#0f766e',
                          background: s.isEnded ? 'rgba(100,116,139,0.08)' : 'rgba(15,118,110,0.08)',
                          whiteSpace:'nowrap', flexShrink:0,
                        }}>
                          {s.isEnded ? '✅ منتهية' : '⏳ قادمة'}
                        </span>
                      </div>
                      <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
                        <button onClick={() => { setEdit({ ...s, caseId: s.caseId }); setModal(true) }}
                          style={{ flex:1, background:'#f4f4f5', color:'#333', border:'1px solid #e4e4e7', padding:'7px', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>
                          ✏️ تعديل
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          style={{ background:'#fff0f0', color:'#b91c1c', border:'1px solid #fecaca', padding:'7px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <SessionModal session={editSess} cases={cases} clientMap={clientMap}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave} saving={saving} />
      )}

      <style>{`
        /* ── Agenda layout ── */
        .agenda-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .agenda-calendar-panel {
          flex: 1;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #eaeaea;
          box-shadow: 0 2px 16px rgba(0,0,0,0.02);
          min-width: 0;
        }
        .agenda-detail-panel {
          width: 300px;
          flex-shrink: 0;
          background: #fff;
          border-radius: 8px;
          border: 1px solid #eaeaea;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.02);
        }
        .agenda-stats {
          grid-template-columns: repeat(4,1fr);
        }

        /* ── Calendar header ── */
        .agenda-cal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          background: #fcfcfc;
          border-bottom: 1px solid #eaeaea;
          gap: 12px;
        }
        .agenda-cal-nav { display: flex; gap: 8px; }
        .agenda-nav-btn {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 7px;
          color: #333;
          width: 32px; height: 32px;
          cursor: pointer;
          font-size: 18px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cairo', sans-serif;
          transition: background 0.15s;
        }
        .agenda-nav-btn:hover { background: #f4f4f5; }
        .agenda-nav-today { width: auto; padding: 0 14px; font-size: 13px; font-weight: 700; }
        .agenda-cal-title { text-align: right; }
        .agenda-cal-month { font-size: 20px; font-weight: 900; color: #222; font-family: 'Cairo', sans-serif; }
        .agenda-cal-month span { color: #0f5e56; }
        .agenda-cal-count { font-size: 12px; color: #888; margin-top: 2px; }

        /* ── Day names row ── */
        .agenda-day-names {
          display: grid;
          grid-template-columns: repeat(7,1fr);
          border-bottom: 1px solid #eaeaea;
          background: #fafafa;
        }
        .agenda-day-name {
          padding: 10px 4px;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
          color: #666;
        }

        /* ── Week row & cells ── */
        .agenda-week-row { display: grid; grid-template-columns: repeat(7,1fr); }
        .agenda-cell {
          min-height: 100px;
          padding: 8px 6px;
          cursor: pointer;
          background: #fff;
          transition: background 0.15s;
          position: relative;
        }
        .agenda-cell:hover { background: #fafafa; }
        .agenda-cell-empty { min-height: 100px; background: #fbfbfb; }
        .agenda-cell-today { background: #f8fafc; }
        .agenda-cell-selected { background: #f0fdfa; box-shadow: inset 0 0 0 2px #0f766e; }

        .agenda-day-num {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 7px;
          font-size: 13px; font-weight: 600; color: #444;
          margin-bottom: 6px;
        }
        .agenda-day-num-today  { background: #0f766e; color: #fff; font-weight: 800; }
        .agenda-day-num-sel    { background: #0f5e56; color: #fff; }

        .agenda-pills { display: flex; flex-direction: column; gap: 3px; }
        .agenda-pill {
          padding: 2px 6px; border-radius: 5px;
          font-size: 10px; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
          max-width: 100%; transition: opacity 0.15s;
        }
        .agenda-pill:hover { opacity: 0.8; }
        .agenda-more { font-size: 10px; color: #777; font-weight: 700; padding-right: 4px; margin-top: 1px; }

        /* ── Loading ── */
        .agenda-loading { padding: 80px 20px; text-align: center; color: #aaa; font-size: 28px; }
        .agenda-loading div { font-size: 13px; margin-top: 10px; }

        /* ── Detail panel ── */
        .agenda-detail-header {
          padding: 18px 20px;
          background: #fcfcfc;
          border-bottom: 1px solid #eaeaea;
        }
        .agenda-detail-title { font-size: 14px; font-weight: 800; color: #222; }
        .agenda-detail-subtitle { font-size: 12px; color: #777; margin-top: 3px; }
        .agenda-detail-body {
          padding: 14px;
          max-height: 620px;
          overflow-y: auto;
          background: #fafafa;
        }
        .agenda-detail-empty {
          text-align: center; color: #aaa;
          padding: 50px 16px;
          font-size: 13px; font-weight: 600;
        }
        .agenda-session-card {
          padding: 14px;
          border-radius: 8px;
          background: #fff;
          border: 1px solid #eaeaea;
          box-shadow: 0 1px 4px rgba(0,0,0,0.02);
        }

        /* ── Mobile back button ── */
        .agenda-mobile-back {
          display: none;
          background: none;
          border: none;
          color: #0f766e;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          padding: 0 0 14px;
          direction: rtl;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .agenda-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .agenda-detail-panel { width: 260px; }
          .agenda-cell { min-height: 80px; padding: 6px 4px; }
          .agenda-day-name { font-size: 10px; padding: 8px 2px; }
          .agenda-cal-month { font-size: 17px; }
        }

        @media (max-width: 640px) {
          .agenda-layout { flex-direction: column; }
          .agenda-calendar-panel { width: 100%; }
          .agenda-detail-panel {
            width: 100%;
            max-height: none;
          }
          .agenda-detail-body { max-height: none; }
          .agenda-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .agenda-cell { min-height: 64px; padding: 4px 3px; }
          .agenda-day-num { width: 22px; height: 22px; font-size: 12px; margin-bottom: 3px; }
          .agenda-day-name { font-size: 9px; padding: 7px 1px; }
          .agenda-cal-month { font-size: 16px; }
          .agenda-cal-count { font-size: 11px; }
          .agenda-mobile-back { display: block; }
          /* Show only the active panel on mobile */
          .agenda-hidden-mobile { display: none !important; }
          .agenda-pill { font-size: 9px; padding: 1px 4px; }
          .agenda-more { font-size: 9px; }
          .agenda-cal-header { padding: 12px 14px; }
          .agenda-nav-today { padding: 0 10px; font-size: 12px; }
        }

        @media (max-width: 380px) {
          .agenda-cell { min-height: 54px; }
          .agenda-cal-month { font-size: 14px; }
          .agenda-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
