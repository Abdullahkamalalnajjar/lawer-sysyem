'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { BASE_URL, getCases, createCase, updateCase, deleteCase, getClients } from '../lib/api'

export default function CasesPage() {
  return (
    <AuthGuard title="إدارة القضايا">
      <CasesContent />
    </AuthGuard>
  )
}

const CASE_TYPES      = ['مدني', 'تجاري', 'جنائي', 'جنح', 'إداري', 'أحوال شخصية', 'عمالي', 'دستوري', 'أخرى']

const DEGREES         = ['عادي', 'معرضة', 'استئناف', 'معرضة استئنافية', 'نقض']

function typeBadge(type) {
  const map = { 'مدني': 'badge-blue', 'تجاري': 'badge-gold', 'جنائي': 'badge-red', 'إداري': 'badge-yellow', 'أحوال شخصية': 'badge-green' }
  return map[type] || 'badge-gray'
}

// ══════════════════════════════════════════════════════════════
// CASE DETAIL DRAWER
// ══════════════════════════════════════════════════════════════
function CaseDrawer({ caseItem, clientName, onClose, onEdit, onUploadDone, showToast, isManager }) {
  const [tab, setTab]         = useState('info')
  const [newImages, setNew]   = useState([])
  const [file, setFile]       = useState(null)
  const [uploading, setUL]    = useState(false)
  const [dragOver, setDrag]   = useState(false)
  const fileRef               = useRef()

  useEffect(() => { setTab('info'); setNew([]); setFile(null) }, [caseItem?.id])

  const allImages = [...newImages, ...(caseItem.images || [])]

  const handleUpload = async () => {
    if (!file) return
    setUL(true)
    try {
      const { uploadCaseImage } = await import('../lib/api')
      const result = await uploadCaseImage(caseItem.id, file)
      setNew(prev => [result, ...prev])
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      showToast('تم رفع الصورة بنجاح ✅')
      onUploadDone?.()
    } catch (err) {
      showToast(err.message || 'فشل رفع الصورة', 'error')
    } finally { setUL(false) }
  }

  const infoRows = [
    { label: 'رقم القضية', value: caseItem.caseNumber, bold: true, red: true },
    { label: 'نوع القضية', value: caseItem.caseType },
    { label: 'الموكل',     value: clientName || '—' },
    { label: 'الخصم',      value: caseItem.opponent || caseItem.opponentName || '—' },
    { label: 'الدرجة',     value: caseItem.degree || caseItem.caseDegree },
  ]

  const tabs = [
    { id: 'info',   label: '📋 المعلومات' },
    { id: 'images', label: `🖼️ الصور${allImages.length ? ` (${allImages.length})` : ''}` },
  ]

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(3px)', zIndex: 200, animation: 'fadeIn 0.2s ease' }} />

      <div className="case-drawer" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, background: '#fff', boxShadow: '-8px 0 48px rgba(15,118,110,0.18)', zIndex: 201, display: 'flex', flexDirection: 'column', animation: 'slideInLeft 0.28s cubic-bezier(0.22,1,0.36,1)', borderRight: '1px solid rgba(15,118,110,0.12)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #0f5e56 0%, #0f766e 60%, #14b8a6 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>⚖️</span>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>تفاصيل القضية</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', fontFamily: "'Playfair Display', serif" }}>{caseItem.caseNumber}</div>
              </div>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={chipStyle}>{caseItem.caseType}</span>
              <span style={chipStyle}>درجة {caseItem.degree || caseItem.caseDegree}</span>
              {allImages.length > 0 && <span style={chipStyle}>🖼️ {allImages.length} صورة</span>}
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid rgba(15,118,110,0.10)', flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '13px 8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === t.id ? '800' : '500', color: tab === t.id ? '#0f766e' : '#64748b', borderBottom: tab === t.id ? '2px solid #0f766e' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s', fontFamily: "'Cairo', sans-serif" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* INFO TAB */}
          {tab === 'info' && (
            <div>
              {infoRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < infoRows.length - 1 ? '1px solid rgba(15,118,110,0.07)' : 'none', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{row.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: row.bold ? '800' : '600', color: row.red ? '#0f766e' : '#0f172a' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isManager && (
                  <button onClick={() => onEdit(caseItem)} style={actionBtnStyle('#0f766e', '#fff')}>✏️ &nbsp;تعديل بيانات القضية</button>
                )}
                <button onClick={() => setTab('images')} style={actionBtnStyle('transparent', '#0f766e', '1.5px solid #0f766e')}>🖼️ &nbsp;الصور {allImages.length > 0 ? `(${allImages.length})` : ''}</button>
              </div>
            </div>
          )}

          {/* IMAGES TAB */}
          {tab === 'images' && (
            <div>
              {/* Upload zone */}
              <label
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f) }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${dragOver ? '#0f766e' : file ? '#14b8a6' : 'rgba(15,118,110,0.25)'}`, borderRadius: '14px', padding: '24px 16px', cursor: 'pointer', background: dragOver ? 'rgba(15,118,110,0.06)' : file ? 'rgba(15,118,110,0.03)' : '#fafafa', transition: 'all 0.2s', gap: '8px', textAlign: 'center', marginBottom: '16px' }}
              >
                <span style={{ fontSize: '32px' }}>{file ? '🖼️' : '📂'}</span>
                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>{file ? file.name : 'اسحب صورة هنا أو اضغط للاختيار'}</span>
                {file && <span style={{ fontSize: '11px', color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB</span>}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
              </label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={handleUpload} disabled={!file || uploading} style={{ ...actionBtnStyle('#0f766e', '#fff'), flex: 1, opacity: (!file || uploading) ? 0.55 : 1, cursor: (!file || uploading) ? 'not-allowed' : 'pointer' }}>
                  {uploading ? '⏳ جارٍ الرفع...' : '📤 رفع الصورة'}
                </button>
                {file && (
                  <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} style={actionBtnStyle('transparent', '#64748b', '1.5px solid rgba(15,118,110,0.20)')}>✕</button>
                )}
              </div>

              {/* Images list */}
              {allImages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#b0bec5', marginTop: '32px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🖼️</div>
                  <div style={{ fontWeight: '700', color: '#64748b', fontSize: '13px' }}>لا توجد صور لهذه القضية</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>الصور ({allImages.length})</div>
                  {allImages.map((img, i) => (
                    <div key={img.id || i} style={{ border: '1px solid rgba(15,118,110,0.12)', borderRadius: '14px', overflow: 'hidden', background: '#f8fafc', boxShadow: '0 2px 8px rgba(15,118,110,0.05)' }}>
                      <a href={img.url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                        <img src={img.url} alt={img.fileName} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block', borderBottom: '1px solid rgba(15,118,110,0.08)' }} onError={e => { e.target.style.display = 'none' }} />
                      </a>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
                        <span style={{ fontSize: '18px' }}>🖼️</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.fileName}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{img.contentType}</div>
                        </div>
                        <a href={img.url} target="_blank" rel="noreferrer" style={{ background: 'rgba(15,118,110,0.08)', border: '1px solid rgba(15,118,110,0.15)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: '700', color: '#0f766e', textDecoration: 'none' }}>🔗 فتح</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(15,118,110,0.08)', background: '#fdf9f9', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...actionBtnStyle('transparent', '#64748b', '1.5px solid rgba(15,118,110,0.20)'), padding: '8px 20px', fontSize: '13px' }}>إغلاق</button>
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

// ── Shared style helpers ─────────────────────────────────────
const chipStyle = {
  padding: '3px 10px', borderRadius: '99px',
  background: 'rgba(255,255,255,0.20)',
  border: '1px solid rgba(255,255,255,0.30)',
  color: '#fff', fontSize: '11px', fontWeight: '700',
}
const closeBtnStyle = {
  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: '8px', color: '#fff', width: '32px', height: '32px',
  cursor: 'pointer', fontSize: '14px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
const actionBtnStyle = (bg, color, border = 'none') => ({
  background: bg, color,
  border: border === 'none' ? 'none' : border,
  borderRadius: '10px', padding: '10px 18px',
  fontWeight: '700', fontSize: '13.5px',
  cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
  transition: 'all 0.18s',
  boxShadow: bg === '#0f766e' ? '0 4px 14px rgba(15,118,110,0.28)' : 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
})

// ══════════════════════════════════════════════════════════════
// CASE EDIT MODAL
// ══════════════════════════════════════════════════════════════
function CaseModal({ caseItem, clients, onClose, onSave, saving }) {
  const [form, setForm] = useState(caseItem ? {
    caseNumber: caseItem.caseNumber || '',
    caseType:   caseItem.caseType   || 'مدني',
    clientId:   caseItem.clientId   || '',
    opponent:   caseItem.opponent   || caseItem.opponentName || '',
    degree:     caseItem.degree     || caseItem.caseDegree   || DEGREES[0],
  } : {
    caseNumber: '', caseType: 'مدني', clientId: '', opponent: '', degree: DEGREES[0],
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.caseNumber.trim()) errs.caseNumber = 'رقم القضية مطلوب'
    if (!form.clientId)          errs.clientId   = 'يجب اختيار الموكل'
    if (!form.opponent.trim())   errs.opponent   = 'اسم الخصم مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }

  const sel = (key, label, options, opts = {}) => {
    const { full, req, placeholder: ph } = opts
    return (
      <div className={`form-group ${full ? 'form-full' : ''}`}>
        <label className="form-label">{req && <span className="form-required">*</span>}{label}</label>
        <select className="form-select" value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={errors[key] ? { borderColor: 'var(--danger)' } : {}}>
          {ph && <option value="">{ph}</option>}
          {options.map(o => typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.id} value={o.id}>{o.name}</option>
          )}
        </select>
        {errors[key] && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors[key]}</span>}
      </div>
    )
  }

  const inp = (key, label, placeholder, opts = {}) => {
    const { full, req, ...domProps } = opts
    return (
      <div className={`form-group ${full ? 'form-full' : ''}`}>
        <label className="form-label">{req && <span className="form-required">*</span>}{label}</label>
        <input className="form-input" placeholder={placeholder} value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={errors[key] ? { borderColor: 'var(--danger)' } : {}} {...domProps} />
        {errors[key] && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors[key]}</span>}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '740px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">⚖️</div>
            {caseItem ? 'تعديل بيانات القضية' : 'إضافة قضية جديدة'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} id="case-form">
          <div className="modal-body">
            <div className="form-grid">
              {inp('caseNumber', 'رقم القضية', 'مثال: 1234/2025', { req: true })}
              {sel('caseType',   'نوع القضية', CASE_TYPES)}
              {sel('clientId',   'الموكل',     clients, { req: true, placeholder: '-- اختر الموكل --' })}
              {inp('opponent',   'اسم الخصم',  'اسم الطرف الخصم', { req: true })}
              {sel('degree',     'درجة القضية', DEGREES)}
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-case-btn">
              {saving ? '⏳ جارٍ الحفظ...' : caseItem ? '💾 حفظ التعديلات' : '➕ إضافة القضية'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN CONTENT
// ══════════════════════════════════════════════════════════════
function CasesContent() {
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')
  const [cases, setCases]         = useState([])
  const [clients, setClients]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [search, setSearch]       = useState('')
  const [filterType, setFilter]   = useState('')
  const [showModal, setModal]     = useState(false)
  const [editingCase, setEdit]    = useState(null)
  const [detailCase, setDetail]   = useState(null)   // ← drawer

  const load = async () => {
    setLoading(true)
    try {
      const [c, cl] = await Promise.all([getCases(), getClients()])
      setCases(c); setClients(cl)
    } catch (err) {
      showToast(err.message || 'فشل تحميل البيانات', 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]))

  const filtered = cases.filter(c => {
    const s = !search ||
      (c.caseNumber || '').includes(search) ||
      (clientMap[c.clientId] || '').includes(search) ||
      (c.opponent || c.opponentName || '').includes(search)
    const t = !filterType || c.caseType === filterType
    return s && t
  })

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editingCase) { await updateCase(editingCase.id, form); showToast('تم تعديل بيانات القضية بنجاح') }
      else             { await createCase(form);                  showToast('تم إضافة القضية بنجاح') }
      setModal(false); setEdit(null)
      await load()
    } catch (err) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه القضية؟')) return
    try {
      await deleteCase(id)
      showToast('تم حذف القضية', 'error')
      if (detailCase?.id === id) setDetail(null)
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
            <span>الرئيسية</span> <span>›</span> <span className="active">القضايا</span>
          </p>
          <h2>إدارة القضايا</h2>
          <p>جميع القضايا المسجلة في النظام ({cases.length} قضية)</p>
        </div>
        {isManager && (
          <button id="add-case-btn" className="btn btn-primary"
            onClick={() => { setEdit(null); setModal(true) }}>
            ➕ إضافة قضية
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid cases-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card"><div className="stat-icon gold">⚖️</div><div className="stat-info"><h3>{cases.length}</h3><p>إجمالي القضايا</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">📋</div><div className="stat-info"><h3>{cases.filter(c => c.caseType === 'مدني').length}</h3><p>القضايا المدنية</p></div></div>
        <div className="stat-card"><div className="stat-icon red">⚡</div><div className="stat-info"><h3>{cases.filter(c => c.caseType === 'جنائي').length}</h3><p>القضايا الجنائية</p></div></div>
        <div className="stat-card"><div className="stat-icon green">🔍</div><div className="stat-info"><h3>{filtered.length}</h3><p>نتائج البحث</p></div></div>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper" style={{ flex: 2 }}>
            <span className="search-input-icon">🔍</span>
            <input id="cases-search" className="search-input"
              placeholder="ابحث برقم القضية أو الموكل أو الخصم..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select id="filter-case-type" className="form-select" style={{ width: '160px' }}
            value={filterType} onChange={e => setFilter(e.target.value)}>
            <option value="">كل الأنواع</option>
            {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚖️</span>
            <h3>لا توجد قضايا</h3>
            <p>{search || filterType ? 'لا توجد نتائج مطابقة' : 'ابدأ بتسجيل أول قضية'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th><th>رقم القضية</th><th>نوع القضية</th><th>الموكل</th>
                <th>الخصم</th><th>الدرجة</th><th>الإجراءات</th>
              </tr></thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => setDetail(c)}
                    style={{
                      cursor: 'pointer',
                      background: detailCase?.id === c.id ? 'rgba(15,118,110,0.05)' : undefined,
                      borderRight: detailCase?.id === c.id ? '3px solid #0f766e' : '3px solid transparent',
                    }}
                  >
                    <td className="td-secondary">{i + 1}</td>
                    <td>
                      <span style={{ fontWeight: '800', color: '#0f766e', fontSize: '14px' }}>
                        {c.caseNumber}
                      </span>
                    </td>
                    <td><span className={`badge ${typeBadge(c.caseType)}`}>{c.caseType}</span></td>
                    <td style={{ fontWeight: '600' }}>{clientMap[c.clientId] || '—'}</td>
                    <td className="td-secondary">{c.opponent || c.opponentName || '—'}</td>
                    <td className="td-secondary">{c.degree || c.caseDegree || '—'}</td>
                    <td>
                      {isManager ? (
                        <div className="td-actions" onClick={e => e.stopPropagation()}>
                          <button className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => { setEdit(c); setModal(true) }}
                            title="تعديل" id={`edit-case-${c.id}`}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon"
                            onClick={() => handleDelete(c.id)}
                            title="حذف" id={`delete-case-${c.id}`}>🗑️</button>
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

      {/* ► Case Edit Modal */}
      {showModal && (
        <CaseModal
          caseItem={editingCase}
          clients={clients}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* ► Case Detail Drawer */}
      {detailCase && (
        <CaseDrawer
          caseItem={detailCase}
          clientName={clientMap[detailCase.clientId]}
          onClose={() => setDetail(null)}
          onEdit={(c) => { setEdit(c); setModal(true) }}
          onUploadDone={() => load()}
          showToast={showToast}
          isManager={isManager}
        />
      )}
    </>
  )
}
