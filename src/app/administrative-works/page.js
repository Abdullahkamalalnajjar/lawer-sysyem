'use client'

import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import {
  getAdministrativeWorks, getAdministrativeWorksByUser,
  createAdministrativeWork,
  updateAdministrativeWork, deleteAdministrativeWork,
  getUsers, getSessions, getCases, getClients,
} from '../lib/api'

export default function AdministrativeWorksPage() {
  return (
    <AuthGuard title="الأعمال الإدارية">
      <AdminWorksContent />
    </AuthGuard>
  )
}

// ── Predefined places ──────────────────────────────────────
const PREDEFINED_PLACES = ['بنها', 'شبين', 'مكان خارجي']

// ── Modal ───────────────────────────────────────────────────
function AdminWorkModal({ work, users, sessions, clientMap, caseMap, onClose, onSave, saving }) {
  // Determine initial placeMode based on existing value
  const initPlace = work?.place || ''
  const initPlaceMode = PREDEFINED_PLACES.includes(initPlace) ? initPlace : (initPlace ? '__custom__' : '')

  const [form, setForm] = useState(work ? {
    date:         work.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    appUserId:    work.appUserId   || '',
    isForAllUsers: work.isForAllUsers ?? false,
    sessionId:    work.sessionId   || '',
    place:        initPlace,
    statement:    work.statement   || '',
    isVisible:    work.isVisible   ?? true,
  } : {
    date:         new Date().toISOString().split('T')[0],
    appUserId:    '',
    isForAllUsers: false,
    sessionId:    '',
    place:        '',
    statement:    '',
    isVisible:    true,
  })
  const [placeMode, setPlaceMode] = useState(initPlaceMode)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.date)             errs.date      = 'التاريخ مطلوب'
    if (!form.statement.trim()) errs.statement = 'البيان مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      date:          form.date,
      appUserId:     form.appUserId || null,
      isForAllUsers: form.isForAllUsers,
      sessionId:     form.sessionId || null,
      place:         form.place || null,
      statement:     form.statement,
      ...(work ? { isVisible: form.isVisible } : {}),
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">🏛️</div>
            {work ? 'تعديل العمل الإداري' : 'إضافة عمل إداري جديد'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} id="admin-work-form">
          <div className="modal-body">
            <div className="form-grid">

              {/* Date */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>التاريخ</label>
                <input type="date" className="form-input" dir="ltr"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={errors.date ? { borderColor: 'var(--danger)' } : {}} />
                {errors.date && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.date}</span>}
              </div>

              {/* Place */}
              <div className="form-group">
                <label className="form-label">المكان</label>
                <select
                  className="form-select"
                  value={placeMode}
                  onChange={e => {
                    const val = e.target.value
                    setPlaceMode(val)
                    if (val !== '__custom__') {
                      setForm(p => ({ ...p, place: val }))
                    } else {
                      setForm(p => ({ ...p, place: '' }))
                    }
                  }}
                >
                  <option value="">-- اختر المكان --</option>
                  {PREDEFINED_PLACES.map(pl => (
                    <option key={pl} value={pl}>{pl}</option>
                  ))}
                  <option value="__custom__">آخر (اكتب يدوياً)</option>
                </select>
                {placeMode === '__custom__' && (
                  <input
                    className="form-input"
                    placeholder="اكتب اسم المكان..."
                    value={form.place}
                    onChange={e => setForm(p => ({ ...p, place: e.target.value }))}
                    style={{ marginTop: '8px' }}
                    autoFocus
                  />
                )}
              </div>

              {/* User */}
              <div className="form-group">
                <label className="form-label">المستخدم المخصص</label>
                <select className="form-select" value={form.appUserId}
                  onChange={e => setForm(p => ({ ...p, appUserId: e.target.value }))}>
                  <option value="">-- عام / غير محدد --</option>
                  {users.map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.email}{u.roles?.length ? ` — ${u.roles.join(', ')}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session */}
              <div className="form-group">
                <label className="form-label">الجلسة المرتبطة (اختياري)</label>
                <select className="form-select" value={form.sessionId}
                  onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))}>
                  <option value="">-- لا توجد جلسة --</option>
                  {sessions.map(s => {
                    const c = caseMap[s.caseId]
                    const clientName = clientMap[c?.clientId] || '—'
                    return (
                      <option key={s.id} value={s.id}>
                        {c?.caseNumber || '—'} | {clientName} | {s.sessionDate?.split('T')[0]}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* isForAllUsers toggle */}
              <div className="form-group">
                <label className="form-label">مرئي لجميع المستخدمين</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
                  <input type="checkbox" id="isForAllUsers"
                    checked={form.isForAllUsers}
                    onChange={e => setForm(p => ({ ...p, isForAllUsers: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label htmlFor="isForAllUsers" style={{ cursor: 'pointer', fontWeight: '600' }}>
                    {form.isForAllUsers ? 'نعم — لجميع المستخدمين' : 'لا — لمستخدم محدد فقط'}
                  </label>
                </div>
              </div>

              {/* isVisible (edit only) */}
              {work && (
                <div className="form-group">
                  <label className="form-label">الحالة</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
                    <input type="checkbox" id="isVisible"
                      checked={form.isVisible}
                      onChange={e => setForm(p => ({ ...p, isVisible: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    <label htmlFor="isVisible" style={{ cursor: 'pointer', fontWeight: '600' }}>
                      {form.isVisible ? '✅ مرئي' : '🔒 مخفي'}
                    </label>
                  </div>
                </div>
              )}

              {/* Statement */}
              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span>البيان</label>
                <textarea className="form-input" rows={4} placeholder="وصف العمل الإداري..."
                  value={form.statement}
                  onChange={e => setForm(p => ({ ...p, statement: e.target.value }))}
                  style={{ resize: 'vertical', ...(errors.statement ? { borderColor: 'var(--danger)' } : {}) }} />
                {errors.statement && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.statement}</span>}
              </div>

            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-admin-work-btn">
              {saving ? '⏳ جارٍ الحفظ...' : work ? '💾 حفظ التعديلات' : '➕ إضافة العمل الإداري'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main content ─────────────────────────────────────────────
function AdminWorksContent() {
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')
  const [works, setWorks]     = useState([])
  const [users, setUsers]     = useState([])
  const [sessions, setSessions] = useState([])
  const [cases, setCases]     = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear,  setFilterYear]  = useState('')
  const [showModal, setModal] = useState(false)
  const [editWork, setEdit]   = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filterPlace, setFilterPlace] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      // Manager → all works | Member → only their own works
      const worksPromise = isManager
        ? getAdministrativeWorks()
        : getAdministrativeWorksByUser(user.userId)

      const [w, u, s, c, cl] = await Promise.all([
        worksPromise,
        isManager ? getUsers() : Promise.resolve([]),
        getSessions(),
        getCases(),
        getClients(),
      ])
      setWorks(w)
      setUsers(Array.isArray(u) ? u : (u?.value ?? []))
      setSessions(s)
      setCases(c)
      setClients(cl)
    } catch (err) {
      showToast(err.message || 'فشل تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const userMap   = Object.fromEntries(users.map(u => [u.userId, u.email]))
  const caseMap   = Object.fromEntries(cases.map(c => [c.id, c]))
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]))

  const years  = [...new Set(works.map(w => w.date?.slice(0,4)).filter(Boolean))].sort((a,b)=>b-a)
  const places  = [...new Set(works.map(w => w.place).filter(Boolean))].sort()

  const filtered = works.filter(w => {
    const d = w.date || ''
    if (filterYear  && !d.startsWith(filterYear))    return false
    if (filterMonth && d.slice(5,7) !== filterMonth) return false
    if (filterPlace === '__no_place__' && w.place)   return false
    if (filterPlace && filterPlace !== '__no_place__' && (w.place || '') !== filterPlace) return false
    if (search && !(w.statement||'').includes(search) && !(w.place||'').includes(search) && !(userMap[w.appUserId]||'').includes(search)) return false
    return true
  })

  const hasFilter = filterMonth || filterYear || search || filterPlace
  const resetFilters = () => { setFilterMonth(''); setFilterYear(''); setSearch(''); setFilterPlace('') }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG') : '—'

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editWork) {
        await updateAdministrativeWork(editWork.id, form)
        showToast('تم تعديل العمل الإداري بنجاح')
      } else {
        await createAdministrativeWork(form)
        showToast('تم إضافة العمل الإداري بنجاح')
      }
      setModal(false); setEdit(null)
      await load()
    } catch (err) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا العمل الإداري؟')) return
    try {
      await deleteAdministrativeWork(id)
      showToast('تم الحذف', 'error')
      await load()
    } catch (err) {
      showToast(err.message || 'فشل الحذف', 'error')
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span>الرئيسية</span> <span>›</span> <span className="active">الأعمال الإدارية</span>
          </p>
          <h2>الأعمال الإدارية</h2>
          <p>{isManager ? 'تسجيل ومتابعة الأعمال والمهام الإدارية للمكتب' : 'الأعمال الإدارية المخصصة لك'}</p>
        </div>
        {isManager && (
          <button id="add-admin-work-btn" className="btn btn-primary"
            onClick={() => { setEdit(null); setModal(true) }}>
            ➕ إضافة عمل إداري
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold">🏛️</div>
          <div className="stat-info"><h3>{works.length}</h3><p>إجمالي الأعمال</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👁️</div>
          <div className="stat-info"><h3>{works.filter(w => w.isVisible).length}</h3><p>مرئية</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div className="stat-info"><h3>{works.filter(w => w.isForAllUsers).length}</h3><p>للجميع</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">📅</div>
          <div className="stat-info">
            <h3>{works.filter(w => w.date?.startsWith(new Date().toISOString().slice(0,7))).length}</h3>
            <p>هذا الشهر</p>
          </div>
        </div>
      </div>

      {/* Place Cards */}
      {places.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📍 تصفية حسب المكان
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* All Card */}
            <button
              onClick={() => setFilterPlace('')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '6px', padding: '14px 20px', borderRadius: '14px', border: '2px solid',
                borderColor: filterPlace === '' ? 'var(--primary)' : 'rgba(15,118,110,0.15)',
                background: filterPlace === '' ? 'var(--primary)' : 'var(--surface)',
                color: filterPlace === '' ? '#fff' : 'var(--primary)',
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: filterPlace === '' ? '0 4px 16px rgba(15,118,110,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
                fontFamily: 'inherit', minWidth: '90px',
              }}
            >
              <span style={{ fontSize: '22px' }}>🗂️</span>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>الكل</span>
              <span style={{
                fontSize: '12px', fontWeight: '800',
                background: filterPlace === '' ? 'rgba(255,255,255,0.25)' : 'var(--primary)',
                color: filterPlace === '' ? '#fff' : '#fff',
                borderRadius: '20px', padding: '1px 10px',
              }}>{works.length}</span>
            </button>

            {/* No-place Card */}
            {works.some(w => !w.place) && (
              <button
                onClick={() => setFilterPlace('__no_place__')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '6px', padding: '14px 20px', borderRadius: '14px', border: '2px solid',
                  borderColor: filterPlace === '__no_place__' ? 'var(--primary)' : 'rgba(15,118,110,0.15)',
                  background: filterPlace === '__no_place__' ? 'var(--primary)' : 'var(--surface)',
                  color: filterPlace === '__no_place__' ? '#fff' : 'var(--primary)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: filterPlace === '__no_place__' ? '0 4px 16px rgba(15,118,110,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
                  fontFamily: 'inherit', minWidth: '90px',
                }}
              >
                <span style={{ fontSize: '22px' }}>📌</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>غير محدد</span>
                <span style={{
                  fontSize: '12px', fontWeight: '800',
                  background: filterPlace === '__no_place__' ? 'rgba(255,255,255,0.25)' : 'var(--primary)',
                  color: '#fff', borderRadius: '20px', padding: '1px 10px',
                }}>{works.filter(w => !w.place).length}</span>
              </button>
            )}

            {/* Per-place Cards */}
            {places.map((place, idx) => {
              const count = works.filter(w => w.place === place).length
              const isActive = filterPlace === place
              const icons = ['🏛️','⚖️','🏢','📋','🏠','🔖','🗓️','📍']
              const icon = icons[idx % icons.length]
              return (
                <button
                  key={place}
                  onClick={() => setFilterPlace(isActive ? '' : place)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', padding: '14px 20px', borderRadius: '14px', border: '2px solid',
                    borderColor: isActive ? 'var(--primary)' : 'rgba(15,118,110,0.15)',
                    background: isActive ? 'var(--primary)' : 'var(--surface)',
                    color: isActive ? '#fff' : 'var(--primary)',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 16px rgba(15,118,110,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
                    fontFamily: 'inherit', minWidth: '90px',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', textAlign: 'center', lineHeight: '1.3' }}>{place}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: '800',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--primary)',
                    color: '#fff', borderRadius: '20px', padding: '1px 10px',
                  }}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display:'flex', gap:'10px', padding:'16px 20px', borderBottom:'1px solid rgba(15,118,110,0.08)', flexWrap:'wrap', alignItems:'center' }}>
          <div className="search-input-wrapper" style={{ flex:1, minWidth:'180px' }}>
            <span className="search-input-icon">🔍</span>
            <input id="admin-works-search" className="search-input"
              placeholder="ابحث بالبيان أو المكان..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select id="admin-works-month-filter" className="form-select" style={{ width:'140px', margin:0 }}
            value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">كل الشهور</option>
            {[['01','يناير'],['02','فبراير'],['03','مارس'],['04','أبريل'],['05','مايو'],['06','يونيو'],['07','يوليو'],['08','أغسطس'],['09','سبتمبر'],['10','أكتوبر'],['11','نوفمبر'],['12','ديسمبر']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <select id="admin-works-year-filter" className="form-select" style={{ width:'110px', margin:0 }}
            value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">كل السنوات</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <select id="admin-works-place-filter" className="form-select" style={{ width:'140px', margin:0 }}
            value={filterPlace} onChange={e => setFilterPlace(e.target.value)}>
            <option value="">كل الأماكن</option>
            {places.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {hasFilter && <button className="btn btn-secondary btn-sm" onClick={resetFilters}>✕ مسح</button>}
          {hasFilter && <span style={{ fontSize:'12px', color:'#64748b', fontWeight:'600' }}>{filtered.length} من {works.length}</span>}
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🏛️</span>
            <h3>لا توجد أعمال إدارية</h3>
            <p>{hasFilter ? 'لا توجد نتائج مطابقة للفلتر' : 'ابدأ بتسجيل أول عمل إداري'}</p>
            {hasFilter && <button className="btn btn-secondary btn-sm" style={{ marginTop:'10px' }} onClick={resetFilters}>إعادة تعيين الفلتر</button>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th>
                <th>التاريخ</th>
                <th>الموكل</th>
                <th>المكان</th>
                <th>البيان</th>
                <th>المستخدم</th>
                <th>للجميع</th>
                <th>مرئي</th>
                <th>الإجراءات</th>
              </tr></thead>
              <tbody>
                {filtered
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((w, i) => (
                  <tr key={w.id} style={{ opacity: w.isVisible ? 1 : 0.65 }}>
                    <td className="td-secondary">{i + 1}</td>
                    <td><span className="badge badge-gold">{fmtDate(w.date)}</span></td>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>
                      {(() => {
                        const sess = sessions.find(s => s.id === w.sessionId)
                        const cas  = sess ? caseMap[sess.caseId] : null
                        return clientMap[cas?.clientId] || '—'
                      })()}
                    </td>
                    <td className="td-secondary">{w.place || '—'}</td>
                    <td
                      style={{ maxWidth: '320px', cursor: 'pointer', verticalAlign: 'top' }}
                      onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                      title="اضغط للتوسيع / الطي"
                    >
                      {expandedId === w.id ? (
                        <div style={{ whiteSpace:'pre-wrap', lineHeight:'1.7', color:'#0f172a' }}>
                          {w.statement || '—'}
                          <span style={{ display:'block', marginTop:'6px', fontSize:'11px', color:'#0f766e', fontWeight:'700' }}>▴ طي</span>
                        </div>
                      ) : (
                        <div style={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:'1.6', color:'#334155' }}>
                          {w.statement || '—'}
                          {(w.statement||'').length > 80 && <span style={{ fontSize:'11px', color:'#0f766e', fontWeight:'700', marginRight:'4px' }}> ▾ اعرض الكل</span>}
                        </div>
                      )}
                    </td>
                    <td className="td-secondary">{userMap[w.appUserId] || '—'}</td>
                    <td>
                      <span className={`badge ${w.isForAllUsers ? 'badge-green' : 'badge-gray'}`}>
                        {w.isForAllUsers ? '✅ نعم' : 'لا'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${w.isVisible ? 'badge-blue' : 'badge-gray'}`}>
                        {w.isVisible ? '👁️ مرئي' : '🔒 مخفي'}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        {isManager && (
                          <button className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => { setEdit(w); setModal(true) }}
                            title="تعديل" id={`edit-admin-work-${w.id}`}>✏️</button>
                        )}
                        {isManager && (
                          <button className="btn btn-danger btn-sm btn-icon"
                            onClick={() => handleDelete(w.id)}
                            title="حذف" id={`delete-admin-work-${w.id}`}>🗑️</button>
                        )}
                        {!isManager && (
                          <span style={{ fontSize:'12px', color:'#94a3b8', padding:'4px 8px' }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AdminWorkModal
          work={editWork}
          users={users}
          sessions={sessions}
          clientMap={clientMap}
          caseMap={caseMap}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}
