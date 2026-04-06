'use client'

import { useState, useEffect, useMemo } from 'react'
import { useApp, AuthGuard } from '../../components/AppShell'
import {
  getSessionsCalendar,
  getSessions, createSession, updateSession, deleteSession,
  getCases, getClients,
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
                <label className="form-label">نوع الجلسة</label>
                <select className="form-select" value={form.sessionType}
                  onChange={e=>setForm(p=>({...p,sessionType:e.target.value}))}>
                  {SESSION_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
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
  const colors = TYPE_COLORS[session.sessionType] || TYPE_COLORS['أخرى']
  return (
    <div
      onClick={() => onClick(session)}
      style={{
        padding: '3px 8px', borderRadius: '6px', background: colors.bg,
        border: `1px solid ${colors.border}`, color: colors.color,
        fontSize: '11px', fontWeight: '700', cursor: 'pointer',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        maxWidth: '100%', transition: 'all 0.15s',
      }}
      title={`${session.caseNumber} | ${session.clientName} | ${session.sessionType}`}
    >
      {session.caseNumber || '—'}
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

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map(c=>[c.id,c.name])),
    [clients]
  )

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

  const byDate = useMemo(() => {
    const map = {}
    calSessions.forEach(s => {
      const key = isoDate(new Date(s.sessionDate))
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

  return (
    <>
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

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:'24px' }}>
        <div className="stat-card"><div className="stat-icon gold">📅</div><div className="stat-info"><h3>{sessionCount}</h3><p>جلسات الشهر</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">⏳</div><div className="stat-info"><h3>{upcomingCount}</h3><p>جلسات قادمة</p></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3>{sessionCount - upcomingCount}</h3><p>جلسات منتهية</p></div></div>
        <div className="stat-card"><div className="stat-icon red">⚖️</div><div className="stat-info"><h3>{cases.length}</h3><p>إجمالي القضايا</p></div></div>
      </div>

      <div style={{ display:'flex', gap:'20px', alignItems:'flex-start' }}>
        {/* Calendar */}
        <div style={{ flex:1, background:'#fff', borderRadius:'8px', overflow:'hidden',
          boxShadow:'0 2px 16px rgba(0,0,0,0.02)', border:'1px solid #eaeaea' }}>

          {/* New Clean Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', background:'#fcfcfc', borderBottom:'1px solid #eaeaea' }}>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={prevMonth} style={{ ...navBtn, background:'#fff', color:'#333', borderColor:'#ddd' }}>‹</button>
              <button onClick={nextMonth} style={{ ...navBtn, background:'#fff', color:'#333', borderColor:'#ddd' }}>›</button>
              <button onClick={goToday} style={{ ...navBtn, width:'auto', padding:'0 16px', fontSize:'13px', fontWeight:'bold', background:'#fff', color:'#333', borderColor:'#ddd' }}>اليوم</button>
            </div>
            
            <div style={{ textAlign:'right' }}>
              <div style={{ color:'#222', fontSize:'22px', fontWeight:'900', fontFamily:"'Cairo',sans-serif" }}>
                {ARABIC_MONTHS[viewMonth]} <span style={{ color:'#8b1a1a' }}>{viewYear}</span>
              </div>
              <div style={{ color:'#888', fontSize:'13px', fontWeight:'500', marginTop:'2px' }}>
                {sessionCount} جلسة مسجلة هذا الشهر
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid #eaeaea', background:'#fafafa' }}>
            {ARABIC_DAYS.map(d => (
              <div key={d} style={{ padding:'12px 4px', textAlign:'center', fontSize:'12px', fontWeight:'800', color:'#555' }}>{d}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:'100px', textAlign:'center', color:'#aaa', fontSize:'32px' }}>⏳<div style={{fontSize:'14px', marginTop:'10px'}}>جاري تحميل التقويم...</div></div>
          ) : (
            <div>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
                  {week.map((day, di) => {
                    if (!day) return <div key={di} style={{ minHeight:'110px', background:'#fbfbfb', borderRight: di>0 ? '1px solid #f0f0f0' : 'none', borderBottom: wi<weeks.length-1 ? '1px solid #f0f0f0' : 'none' }} />
                    const key      = isoDate(day)
                    const events   = byDate[key] || []
                    const isToday  = sameDay(day, today)
                    const isSel    = selectedDay && sameDay(day, selectedDay)
                    return (
                      <div
                        key={di}
                        onClick={() => setSelectedDay(isSel ? null : day)}
                        style={{
                          minHeight:'110px', padding:'10px', cursor:'pointer',
                          borderRight: di>0 ? '1px solid #f0f0f0' : 'none',
                          borderBottom: wi<weeks.length-1 ? '1px solid #f0f0f0' : 'none',
                          background: isSel ? '#fef2f2' : isToday ? '#f8fafc' : '#fff',
                          boxShadow: isSel ? 'inset 0 0 0 2px #c0392b' : 'none',
                          transition:'all 0.2s', position:'relative',
                        }}
                      >
                        <div style={{
                          display:'flex', alignItems:'center', justifyContent:'center',
                          width:'30px', height:'30px', borderRadius:'8px',
                          fontSize:'14px', fontWeight: isToday ? '800' : '600',
                          background: isToday ? '#c0392b' : isSel ? '#8b1a1a' : 'transparent',
                          color: isToday || isSel ? '#fff' : '#444', marginBottom:'8px',
                        }}>
                          {day.getDate()}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                          {events.slice(0,3).map((s,i) => <SessionPill key={i} session={s} onClick={s => { setSelectedDay(day) }} />)}
                          {events.length > 3 && (
                            <div style={{ fontSize:'11px', color:'#777', fontWeight:'700', paddingRight:'6px', marginTop:'2px' }}>
                              +{events.length-3} جلسات أخرى
                            </div>
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

        {/* ── Side panel ── */}
        <div style={{ width:'320px', flexShrink:0, background:'#fff', borderRadius:'8px', boxShadow:'0 2px 16px rgba(0,0,0,0.02)', border:'1px solid #eaeaea', overflow:'hidden' }}>
          <div style={{ padding:'20px 24px', background:'#fcfcfc', borderBottom:'1px solid #eaeaea' }}>
            <div style={{ fontSize:'15px', fontWeight:'800', color:'#222' }}>
              {selectedDay ? `${selectedDay.getDate()} ${ARABIC_MONTHS[selectedDay.getMonth()]} ${selectedDay.getFullYear()}` : 'تفاصيل اليوم'}
            </div>
            <div style={{ fontSize:'12px', color:'#777', marginTop:'4px', fontWeight:'500' }}>
              {selectedDay ? `${daySessions.length} جلسة محددة` : 'يرجى اختيار يوم من التقويم لعرض الجلسات'}
            </div>
          </div>

          <div style={{ padding:'16px', maxHeight:'600px', overflowY:'auto', background:'#fafafa' }}>
            {!selectedDay ? (
              <div style={{ textAlign:'center', color:'#aaa', padding:'60px 20px' }}><div style={{ fontSize:'48px', marginBottom:'16px', opacity:0.5 }}>📅</div><div style={{ fontSize:'14px', fontWeight:'600' }}>حدد يوماً لعرض التفاصيل</div></div>
            ) : daySessions.length === 0 ? (
              <div style={{ textAlign:'center', color:'#888', padding:'50px 20px' }}>
                <div style={{ fontSize:'40px', marginBottom:'16px', opacity:0.6 }}>☕</div><div style={{ fontSize:'14px', fontWeight:'600' }}>لا يوجد جلسات مجدولة</div>
                <button onClick={() => { setEdit(null); setModal(true) }} style={{ marginTop:'20px', background:'#8b1a1a', color:'#fff', padding:'8px 16px', borderRadius:'6px', border:'none', cursor:'pointer', fontWeight:'bold' }}>+ إضافة جلسة الآن</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {daySessions.map((s,i) => {
                  const clr = TYPE_COLORS[s.sessionType] || TYPE_COLORS['أخرى']
                  return (
                    <div key={i} style={{ padding:'16px', borderRadius:'8px', background: '#fff', border:'1px solid #eaeaea', borderRight:`4px solid ${clr.color}`, boxShadow:'0 1px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'800', color: clr.color }}>{s.caseNumber || 'رقم القضية غير مسجل'}</div>
                          <div style={{ fontSize:'13px', color:'#333', marginTop:'6px', fontWeight:'700' }}>{s.clientName}</div>
                          {s.opponentName && <div style={{ fontSize:'11.5px', color:'#777', marginTop:'2px', fontWeight:'500' }}>ضد / {s.opponentName}</div>}
                        </div>
                        <span style={{ padding:'4px 10px', borderRadius:'4px', fontSize:'10.5px', fontWeight:'800', color: clr.color, background: clr.bg }}>{s.sessionType}</span>
                      </div>
                      
                      <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px dashed #eee' }}>
                         {s.roll && <div style={{ fontSize:'11.5px', color:'#555', marginBottom:'4px' }}><b style={{color:'#222'}}>الجولة:</b> {s.roll}</div>}
                         {s.decision && <div style={{ fontSize:'12px', color:'#8b1a1a', fontWeight:'600' }}><b style={{color:'#222'}}>القرار:</b> {s.decision}</div>}
                      </div>
                      
                      <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
                        <button onClick={() => { setEdit(s); setModal(true) }} style={{ background:'#f4f4f5', color:'#333', border:'1px solid #e4e4e7', padding:'6px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer', flex:1 }}>تعديل</button>
                        <button onClick={() => handleDelete(s.id)} style={{ background:'#fef2f2', color:'#b91c1c', border:'1px solid #fecaca', padding:'6px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>حذف</button>
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
        <SessionModal session={editSess} cases={cases} clientMap={clientMap} onClose={() => { setModal(false); setEdit(null) }} onSave={handleSave} saving={saving} />
      )}
    </>
  )
}

const navBtn = { background: 'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'8px', color:'#fff', width:'32px', height:'32px', cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center' }
const smRedBtn = { background:'#c0392b', color:'#fff', border:'none', borderRadius:'8px', padding:'7px 14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:"'Cairo', sans-serif" }
const smEditBtn = { background:'rgba(192,57,43,0.08)', color:'#c0392b', border:'1px solid rgba(192,57,43,0.20)', borderRadius:'8px', padding:'5px 10px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:"'Cairo', sans-serif" }
const smDelBtn = { background:'rgba(220,38,38,0.08)', color:'#b91c1c', border:'1px solid rgba(220,38,38,0.20)', borderRadius:'8px', padding:'5px 10px', fontSize:'14px', cursor:'pointer' }
