'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp, AuthGuard } from '../components/AppShell'
import {
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

const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function isoDate(d) { return d.toISOString().slice(0,10) }

// ── Add / Edit Session Modal ─────────────────────────────────
function SessionModal({ session, cases, clientMap, onClose, onSave, saving, defaultCaseId }) {
  const [form, setForm] = useState(session ? {
    caseId:          session.caseId || '',
    roll:            session.roll || '',
    decision:        session.decision || '',
    sessionDate:     session.sessionDate?.split('T')[0] || '',
    nextSessionDate: session.nextSessionDate?.split('T')[0] || '',
    requests:        session.requests || session.request || '',
    isEnded:         session.isEnded      ?? false,
    reminderSent:    true,
  } : { caseId: defaultCaseId || '', roll:'', decision:'', sessionDate:'', nextSessionDate:'', requests:'', isEnded: false, reminderSent: true })
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
              {/* Next Session Date */}
              <div className="form-group">
                <label className="form-label">تاريخ الجلسة القادمة (اختياري)</label>
                <input className="form-input" type="date" value={form.nextSessionDate} dir="ltr"
                  onChange={e=>setForm(p=>({...p,nextSessionDate:e.target.value}))} />
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

              {/* isEnded + reminderSent */}
              <div className="form-group" style={{ display:'flex', alignItems:'center', gap:'28px', paddingTop:'4px' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontWeight:'600', fontSize:'14px' }}>
                  <input type="checkbox" checked={form.isEnded}
                    onChange={e => setForm(p=>({...p, isEnded: e.target.checked}))}
                    style={{ width:'18px', height:'18px', cursor:'pointer', accentColor:'#0f766e' }} />
                  ✅ الجلسة منتهية
                </label>
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

// ── Main Content ─────────────────────────────────────────────
function SessionsContent() {
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')
  const today = new Date()
  const [allSessions, setAllSessions] = useState([])
  const [cases, setCases]             = useState([])
  const [clients, setClients]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setModal]         = useState(false)
  const [editSess, setEdit]           = useState(null)
  const [saving, setSaving]           = useState(false)
  const [search, setSearch]           = useState('')
  const [filterDate, setFilterDate]   = useState('')
  const searchParams  = useSearchParams()
  const [filterCaseId, setFilterCaseId] = useState(searchParams.get('caseId') || '')

  // Sync when URL changes (e.g. navigating from cases page)
  useEffect(() => {
    const id = searchParams.get('caseId')
    if (id) setFilterCaseId(id)
  }, [searchParams])

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map(c=>[c.id,c.name])),
    [clients]
  )

  const loadSessions = async () => {
    setLoading(true)
    try {
      const [sessions, c, cl] = await Promise.all([
        getSessions(),
        getCases(),
        getClients(),
      ])
      setAllSessions(sessions)
      setCases(c)
      setClients(cl)
    } catch(err) {
      showToast(err.message || 'فشل تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSessions() }, [])

  const caseMap = useMemo(() => Object.fromEntries(cases.map(c => [c.id, c])), [cases])

  const agendaSessions = useMemo(() => {
    let sessions = [...allSessions].sort((a,b) => new Date(a.sessionDate)-new Date(b.sessionDate))
    if (filterCaseId) {
      sessions = sessions.filter(s => s.caseId === filterCaseId)
    }
    if (search) {
      sessions = sessions.filter(s => {
        const c = caseMap[s.caseId]
        return (
          (c?.caseNumber || '').includes(search) ||
          (clientMap[c?.clientId] || '').includes(search) ||
          (c?.opponent || c?.opponentName || '').includes(search) ||
          (s.decision || '').includes(search)
        )
      })
    }
    if (filterDate) {
      sessions = sessions.filter(s => s.sessionDate?.startsWith(filterDate))
    }
    return sessions
  }, [allSessions, search, filterDate, filterCaseId, caseMap, clientMap])

  const hasFilter = search || filterDate || filterCaseId
  const resetFilters = () => { setSearch(''); setFilterDate(''); setFilterCaseId('') }

  const sessionCount  = allSessions.length
  const upcomingCount = allSessions.filter(s => new Date(s.sessionDate) >= today).length

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editSess?.id) { await updateSession(editSess.id, form); showToast('تم تعديل الجلسة بنجاح') }
      else              { await createSession(form);               showToast('تم إضافة الجلسة بنجاح') }
      setModal(false); setEdit(null)
      await loadSessions()
    } catch(err) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟')) return
    try {
      await deleteSession(id)
      showToast('تم حذف الجلسة', 'error')
      await loadSessions()
    } catch(err) { showToast(err.message || 'فشل الحذف', 'error') }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">الجلسات</span></p>
          <h2>الجلسات</h2>
          <p>قائمة جميع الجلسات المسجلة</p>
        </div>
        {isManager && (
          <button id="add-session-btn" className="btn btn-primary"
            onClick={() => { setEdit(null); setModal(true) }}>
            {filterCaseId
              ? `➕ إضافة جلسة للقضية`
              : '➕ إضافة جلسة'}
          </button>
        )}
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:'24px' }}>
        <div className="stat-card"><div className="stat-icon gold">📅</div><div className="stat-info"><h3>{sessionCount}</h3><p>إجمالي الجلسات</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">⏳</div><div className="stat-info"><h3>{upcomingCount}</h3><p>جلسات قادمة</p></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3>{sessionCount - upcomingCount}</h3><p>جلسات منتهية</p></div></div>
        <div className="stat-card"><div className="stat-icon red">⚖️</div><div className="stat-info"><h3>{cases.length}</h3><p>إجمالي القضايا</p></div></div>
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:'12px', padding:'16px 20px', borderBottom:'1px solid var(--border)', flexWrap:'wrap', alignItems:'center' }}>
          {/* Text search */}
          <div className="search-input-wrapper" style={{ flex:1, minWidth:'180px' }}>
            <span className="search-input-icon">🔍</span>
            <input className="search-input" placeholder="ابحث بالموكل أو القرار..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Case number dropdown */}
          <select id="filter-case-number" className="form-select" style={{ width:'180px' }}
            value={filterCaseId} onChange={e => setFilterCaseId(e.target.value)}>
            <option value="">كل القضايا</option>
            {cases
              .filter(c => c.caseNumber)
              .sort((a,b) => (a.caseNumber||'').localeCompare(b.caseNumber||''))
              .map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber}</option>
              ))}
          </select>
          {/* Date filter */}
          <input className="form-input" type="date" style={{ width:'160px' }} dir="ltr"
            value={filterDate} onChange={e => setFilterDate(e.target.value)}
            title="تصفية بالتاريخ" />
          {/* Reset */}
          {hasFilter && (
            <button className="btn btn-secondary btn-sm" onClick={resetFilters}>✕ مسح</button>
          )}
          {hasFilter && (
            <span style={{ fontSize:'12px', color:'#64748b', fontWeight:'600', whiteSpace:'nowrap' }}>
              {agendaSessions.length} من {allSessions.length}
            </span>
          )}
        </div>

        <div className="card-header">
          <div>
            <div className="card-title">📋 قائمة الجلسات</div>
            <div className="card-subtitle">{agendaSessions.length} جلسة{search || filterDate ? ' (مصفاة)' : ''}</div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{fontSize:'36px'}}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
        ) : agendaSessions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📅</span>
            <h3>لا توجد جلسات</h3>
            <p>{search || filterDate ? 'لا توجد نتائج مطابقة' : 'ابدأ بتسجيل أول جلسة'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th>
                <th>التاريخ</th>
                <th>القضية</th>
                <th>الموكل</th>
                <th>الخصم</th>
                <th>الجولة</th>
                <th>القرار</th>
                <th>الطلبات</th>
                <th>الإجراءات</th>
              </tr></thead>
              <tbody>
                {agendaSessions.map((s,i) => {
                  const d = new Date(s.sessionDate)
                  const past = d < today
                  const c = caseMap[s.caseId]
                  return (
                    <tr key={s.id} style={{ opacity: past ? 0.70 : 1 }}>
                      <td className="td-secondary">{i+1}</td>
                      <td>
                        <div style={{ fontWeight:'700', color: past?'#64748b':'#0f172a', fontSize:'13px' }}>
                          {d.getDate()} {ARABIC_MONTHS[d.getMonth()]}
                        </div>
                        <div style={{ fontSize:'11px', color:'#64748b' }}>{d.getFullYear()}</div>
                      </td>
                      <td style={{ fontWeight:'700', color:'#0f766e' }}>{c?.caseNumber || '—'}</td>
                      <td style={{ fontWeight:'600' }}>{clientMap[c?.clientId] || '—'}</td>
                      <td className="td-secondary">{c?.opponent || c?.opponentName || '—'}</td>
                      <td className="td-secondary">{s.roll||'—'}</td>
                      <td style={{ maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {s.decision||'—'}
                      </td>
                      <td style={{ maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#555' }}>
                        {s.requests||s.request||'—'}
                      </td>
                      <td>
                        {isManager ? (
                          <div className="td-actions">
                            <button className="btn btn-secondary btn-sm btn-icon"
                              onClick={()=>{setEdit(s);setModal(true)}} title="تعديل">✏️</button>
                            <button className="btn btn-danger btn-sm btn-icon"
                              onClick={()=>handleDelete(s.id)} title="حذف">🗑️</button>
                          </div>
                        ) : (
                          <span className="td-secondary" style={{ fontSize:'12px' }}>عرض فقط</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <SessionModal
          session={editSess}
          cases={cases}
          clientMap={clientMap}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
          defaultCaseId={editSess ? undefined : filterCaseId}
        />
      )}
    </>
  )
}
