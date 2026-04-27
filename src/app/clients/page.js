'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp, AuthGuard } from '../components/AppShell'
import { getClients, createClient, updateClient, deleteClient } from '../lib/api'

export default function ClientsPage() {
  return (
    <AuthGuard title="إدارة الموكلين">
      <ClientsContent />
    </AuthGuard>
  )
}

// ── Helpers ──────────────────────────────────────────────────
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── Client Detail Drawer ──────────────────────────────────────
function ClientDrawer({ client, onClose, onEdit }) {
  const [tab, setTab]         = useState('info')
  const [cases, setCases]     = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!client) return
    setTab('info'); setCases([]); setSessions([])
    setLoading(true)
    Promise.all([getClientCases(client.id), getClientSessions(client.id)])
      .then(([c, s]) => { setCases(c); setSessions(s) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [client?.id])

  if (!client) return null

  const tabs = [
    { id: 'info',     label: '👤 المعلومات' },
    { id: 'cases',    label: `⚖️ القضايا${cases.length ? ` (${cases.length})` : ''}` },
    { id: 'sessions', label: `📅 الجلسات${sessions.length ? ` (${sessions.length})` : ''}` },
  ]

  const avatarLetter = client.name?.[0] || '?'

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.35)', backdropFilter:'blur(3px)', zIndex:200 }} />

      {/* Drawer */}
      <div style={{
        position:'fixed', top:0, left:0, bottom:0, width:'380px',
        background:'#fff', zIndex:201,
        display:'flex', flexDirection:'column',
        boxShadow:'-8px 0 48px rgba(15,118,110,0.18)',
        borderRight:'1px solid rgba(15,118,110,0.12)',
        animation:'slideInLeft 0.28s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Header */}
        <div style={{ padding:'20px 24px', background:'linear-gradient(135deg,#0f5e56,#0f766e,#14b8a6)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(255,255,255,0.25)', border:'2px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'900', color:'#fff', flexShrink:0 }}>
                {avatarLetter}
              </div>
              <div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.65)', fontWeight:'600', letterSpacing:'0.8px', textTransform:'uppercase' }}>ملف الموكل</div>
                <div style={{ fontSize:'18px', fontWeight:'900', color:'#fff' }}>{client.name}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'8px', color:'#fff', width:'32px', height:'32px', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          <div style={{ marginTop:'12px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {client.phone && <span style={{ padding:'3px 10px', borderRadius:'99px', background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.28)', color:'#fff', fontSize:'11px', fontWeight:'700' }}>📞 {client.phone}</span>}
            {client.caseNumber && <span style={{ padding:'3px 10px', borderRadius:'99px', background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.28)', color:'#fff', fontSize:'11px', fontWeight:'700' }}>🗂️ {client.caseNumber}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'2px solid rgba(15,118,110,0.10)', flexShrink:0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'12px 6px', background:'none', border:'none', cursor:'pointer', fontSize:'12px', fontWeight: tab===t.id ? '800' : '500', color: tab===t.id ? '#0f766e' : '#64748b', borderBottom: tab===t.id ? '2px solid #0f766e' : '2px solid transparent', marginBottom:'-2px', transition:'all 0.2s', fontFamily:"'Cairo',sans-serif" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px' }}>

          {loading && (
            <div style={{ textAlign:'center', color:'#94a3b8', paddingTop:'40px' }}>
              <div style={{ fontSize:'32px', marginBottom:'10px' }}>⏳</div>
              <div style={{ fontSize:'13px', fontWeight:'600' }}>جارٍ التحميل...</div>
            </div>
          )}

          {/* INFO TAB */}
          {!loading && tab === 'info' && (
            <div>
              {[
                { label:'الاسم الكامل',   value: client.name },
                { label:'رقم الهاتف',     value: client.phone || client.phoneNumber, ltr: true },
                { label:'رقم القضية',     value: client.caseNumber, gold: true },
                { label:'العنوان',         value: client.address || '—' },
              ].map((row, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(15,118,110,0.07)', alignItems:'center' }}>
                  <span style={{ fontSize:'13px', color:'#64748b', fontWeight:'600' }}>{row.label}</span>
                  <span style={{ fontSize:'14px', fontWeight:'700', color: row.gold ? '#0f766e' : '#0f172a', direction: row.ltr ? 'ltr' : 'inherit' }}>{row.value || '—'}</span>
                </div>
              ))}
              <div style={{ marginTop:'24px', display:'flex', flexDirection:'column', gap:'10px' }}>
                <button onClick={() => onEdit(client)} style={{ background:'#0f766e', color:'#fff', border:'none', borderRadius:'10px', padding:'10px 18px', fontWeight:'700', fontSize:'13.5px', cursor:'pointer', fontFamily:"'Cairo',sans-serif", boxShadow:'0 4px 14px rgba(15,118,110,0.28)' }}>
                  ✏️ &nbsp;تعديل بيانات الموكل
                </button>
                <button onClick={() => setTab('cases')} style={{ background:'transparent', color:'#0f766e', border:'1.5px solid #0f766e', borderRadius:'10px', padding:'10px 18px', fontWeight:'700', fontSize:'13.5px', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                  ⚖️ &nbsp;عرض القضايا {cases.length > 0 ? `(${cases.length})` : ''}
                </button>
                <button onClick={() => setTab('sessions')} style={{ background:'transparent', color:'#0f766e', border:'1.5px solid rgba(15,118,110,0.4)', borderRadius:'10px', padding:'10px 18px', fontWeight:'700', fontSize:'13.5px', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                  📅 &nbsp;عرض الجلسات {sessions.length > 0 ? `(${sessions.length})` : ''}
                </button>
              </div>
            </div>
          )}

          {/* CASES TAB */}
          {!loading && tab === 'cases' && (
            <div>
              {cases.length === 0 ? (
                <div style={{ textAlign:'center', color:'#b0bec5', marginTop:'40px' }}>
                  <div style={{ fontSize:'40px', marginBottom:'10px' }}>⚖️</div>
                  <div style={{ fontWeight:'700', color:'#64748b', fontSize:'13px' }}>لا توجد قضايا لهذا الموكل</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div style={{ fontSize:'11px', fontWeight:'800', color:'#94a3b8', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px' }}>القضايا ({cases.length})</div>
                  {cases.map(c => (
                    <div key={c.id} style={{ border:'1px solid rgba(15,118,110,0.12)', borderRadius:'12px', padding:'14px', background:'#f8fafc', boxShadow:'0 2px 8px rgba(15,118,110,0.05)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                        <span style={{ fontSize:'15px', fontWeight:'900', color:'#0f766e' }}>{c.caseNumber}</span>
                        <span style={{ padding:'3px 9px', borderRadius:'6px', fontSize:'11px', fontWeight:'800', background:'rgba(15,118,110,0.08)', color:'#0f766e' }}>{c.caseType}</span>
                      </div>
                      <div style={{ fontSize:'12px', color:'#555', marginBottom:'4px' }}>⚔️ الخصم: <b>{c.opponent || '—'}</b></div>
                      <div style={{ fontSize:'12px', color:'#555' }}>📊 الدرجة: <b>{c.degree || '—'}</b></div>
                      {c.images?.length > 0 && (
                        <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'6px' }}>🖼️ {c.images.length} صورة مرفقة</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SESSIONS TAB */}
          {!loading && tab === 'sessions' && (
            <div>
              {sessions.length === 0 ? (
                <div style={{ textAlign:'center', color:'#b0bec5', marginTop:'40px' }}>
                  <div style={{ fontSize:'40px', marginBottom:'10px' }}>📅</div>
                  <div style={{ fontWeight:'700', color:'#64748b', fontSize:'13px' }}>لا توجد جلسات لهذا الموكل</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div style={{ fontSize:'11px', fontWeight:'800', color:'#94a3b8', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px' }}>الجلسات ({sessions.length})</div>
                  {sessions.map(s => (
                    <div key={s.id} style={{ border:'1px solid rgba(15,118,110,0.12)', borderRadius:'12px', padding:'14px', background:'#f8fafc', borderRight: s.isEnded ? '4px solid #94a3b8' : '4px solid #0f766e', boxShadow:'0 2px 8px rgba(15,118,110,0.05)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                        <span style={{ fontSize:'13px', fontWeight:'800', color: s.isEnded ? '#64748b' : '#0f766e' }}>
                          📅 {fmtDate(s.sessionDate)}
                        </span>
                        <span style={{ padding:'3px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:'800', color: s.isEnded ? '#64748b' : '#0f766e', background: s.isEnded ? 'rgba(100,116,139,0.08)' : 'rgba(15,118,110,0.08)' }}>
                          {s.isEnded ? '✅ منتهية' : '⏳ قادمة'}
                        </span>
                      </div>
                      {s.roll && <div style={{ fontSize:'12px', color:'#555', marginBottom:'4px' }}>🔢 الجولة: <b>{s.roll}</b></div>}
                      {s.decision && <div style={{ fontSize:'12px', color:'#0f5e56', fontWeight:'600', marginBottom:'4px' }}>⚖️ القرار: {s.decision}</div>}
                      {s.requests && <div style={{ fontSize:'12px', color:'#555' }}>📝 الطلبات: {s.requests}</div>}
                      {s.nextSessionDate && (
                        <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'6px' }}>الجلسة القادمة: {fmtDate(s.nextSessionDate)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(15,118,110,0.08)', background:'#fdf9f9', flexShrink:0, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ background:'transparent', color:'#64748b', border:'1.5px solid rgba(15,118,110,0.20)', borderRadius:'10px', padding:'8px 20px', fontWeight:'700', fontSize:'13px', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            إغلاق
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ── Modal ───────────────────────────────────────────────────
function ClientModal({ client, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    client
      ? { name: client.name || '', phone: client.phone || client.phoneNumber || '', address: client.address || '', caseNumber: client.caseNumber || '' }
      : { name: '', phone: '', address: '', caseNumber: '' }
  )
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'الاسم مطلوب'
    if (!form.phone.trim()) errs.phone = 'رقم الهاتف مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }

  const field = (key, label, placeholder, required = false, opts = {}) => {
    const { full, ...inputProps } = opts
    return (
      <div className={`form-group ${full ? 'form-full' : ''}`}>
        <label className="form-label">{required && <span className="form-required">*</span>}{label}</label>
        <input
          className="form-input"
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={errors[key] ? { borderColor: 'var(--danger)' } : {}}
          {...inputProps}
        />
        {errors[key] && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors[key]}</span>}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">👤</div>
            {client ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} id="client-form">
          <div className="modal-body">
            <div className="form-grid">
              {field('name',       'الاسم الكامل',              'مثال: أحمد محمد علي',        true)}
              {field('phone',      'رقم الهاتف',              '01xxxxxxxxx',                 true, { dir: 'ltr' })}
              {field('caseNumber', 'رقم القضية',           'مثال: 2024/1234',              false, { dir: 'ltr' })}
              {field('address',    'العنوان / محل الإقامة', 'مثال: القاهرة - مدينة نصر',  false, { full: true })}
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-client-btn">
              {saving ? '⏳ جارٍ الحفظ...' : (client ? '💾 حفظ التعديلات' : '➕ إضافة الموكل')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main content ─────────────────────────────────────────────
function ClientsContent() {
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')
  const router = useRouter()
  const [clients, setClients]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editingClient, setEditing] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getClients()
      setClients(data)
    } catch (err) {
      showToast(err.message || 'فشل تحميل الموكلين', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = clients.filter(c =>
    (c.name        || '').includes(search) ||
    (c.phone       || c.phoneNumber || '').includes(search) ||
    (c.address     || '').includes(search) ||
    (c.caseNumber  || '').includes(search)
  )

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editingClient) {
        await updateClient(editingClient.id, form)
        showToast('تم تعديل بيانات الموكل بنجاح')
      } else {
        await createClient(form)
        showToast('تم إضافة الموكل بنجاح')
      }
      setShowModal(false)
      setEditing(null)
      await load()
    } catch (err) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموكل؟')) return
    try {
      await deleteClient(id)
      showToast('تم حذف الموكل', 'error')
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
            <span>الرئيسية</span> <span>›</span> <span className="active">الموكلين</span>
          </p>
          <h2>إدارة الموكلين</h2>
          <p>قائمة جميع الموكلين المسجلين في النظام</p>
        </div>
        {isManager && (
          <button id="add-client-btn" className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
            ➕ إضافة موكل
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold">👥</div>
          <div className="stat-info"><h3>{clients.length}</h3><p>إجمالي الموكلين</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🔍</div>
          <div className="stat-info"><h3>{filtered.length}</h3><p>نتائج البحث</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📍</div>
          <div className="stat-info"><h3>{clients.filter(c => c.address).length}</h3><p>موكلين بعنوان مسجل</p></div>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input
              id="clients-search"
              className="search-input"
              placeholder="ابحث بالاسم أو الهاتف أو العنوان..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            <p>جارٍ تحميل البيانات...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">👥</span>
            <h3>لا يوجد موكلين</h3>
            <p>{search ? 'لا توجد نتائج مطابقة للبحث' : 'ابدأ بإضافة موكلك الأول'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم الكامل</th>
                  <th>رقم الهاتف</th>
                  <th>رقم القضية</th>
                  <th>العنوان</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/clients/${c.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="td-secondary">{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,var(--gold-deep),var(--gold-primary))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'800', color:'rgba(0,0,0,0.8)', flexShrink:0 }}>
                          {c.name?.[0]}
                        </div>
                        <span style={{ fontWeight: '600' }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="td-secondary" style={{ direction:'ltr', textAlign:'right' }}>{c.phone || c.phoneNumber}</td>
                    <td>
                      {c.caseNumber
                        ? <span className="badge badge-gold">{c.caseNumber}</span>
                        : <span className="td-secondary">—</span>}
                    </td>
                    <td className="td-secondary">{c.address || '—'}</td>
                    <td>
                      {isManager ? (
                        <div className="td-actions" onClick={e => e.stopPropagation()}>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditing(c); setShowModal(true) }} title="تعديل" id={`edit-client-${c.id}`}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)} title="حذف" id={`delete-client-${c.id}`}>🗑️</button>
                        </div>
                      ) : (
                        <span className="td-secondary" style={{ fontSize:'12px' }}>عرض فقط</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}


