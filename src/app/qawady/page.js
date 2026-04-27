'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import {
  getQawady, createQawady, updateQawady, deleteQawady, uploadQawadyImage
} from '../lib/api'

export default function QawadyPage() {
  return (
    <AuthGuard title="صور قواضي">
      <QawadyContent />
    </AuthGuard>
  )
}

// ── Modal (Add / Edit) ───────────────────────────────────────
function QawadyModal({ item, onClose, onSave, saving }) {
  const [name, setName] = useState(item?.name || '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('الاسم مطلوب'); return }
    onSave({ name: name.trim() })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">⚖️</div>
            {item ? 'تعديل القضية' : 'إضافة قضية جديدة'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label"><span className="form-required">*</span>اسم القضية</label>
              <input
                className="form-input"
                placeholder="مثال: قضية عبدالله محمد"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                style={error ? { borderColor: 'var(--danger)' } : {}}
                autoFocus
              />
              {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-qawady-btn">
              {saving ? '⏳ جارٍ الحفظ...' : item ? '💾 حفظ التعديلات' : '➕ إضافة القضية'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Image Upload Panel ───────────────────────────────────────
function ImagePanel({ item, showToast, onRefresh }) {
  const [file, setFile]       = useState(null)
  const [uploading, setUL]    = useState(false)
  const [dragOver, setDrag]   = useState(false)
  const fileRef               = useRef()

  const handleUpload = async () => {
    if (!file) return
    setUL(true)
    try {
      await uploadQawadyImage(item.id, file)
      showToast('تم رفع الصورة بنجاح ✅')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      onRefresh()
    } catch (err) {
      showToast(err.message || 'فشل رفع الصورة', 'error')
    } finally { setUL(false) }
  }

  const images = item.images || []

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Upload zone */}
      <label
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f) }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: `2px dashed ${dragOver ? '#0f766e' : file ? '#14b8a6' : 'rgba(15,118,110,0.25)'}`,
          borderRadius: '14px', padding: '20px 16px', cursor: 'pointer',
          background: dragOver ? 'rgba(15,118,110,0.06)' : '#fafafa',
          transition: 'all 0.2s', gap: '6px', textAlign: 'center', marginBottom: '12px',
        }}
      >
        <span style={{ fontSize: '28px' }}>{file ? '📄' : '📤'}</span>
        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
          {file ? file.name : 'اسحب ملف هنا أو اضغط للاختيار'}
        </span>
        {file && <span style={{ fontSize: '11px', color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB</span>}
        <input ref={fileRef} type="file" style={{ display: 'none' }}
          onChange={e => setFile(e.target.files[0] || null)} />
      </label>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={handleUpload} disabled={!file || uploading}
          className="btn btn-primary btn-sm" style={{ flex: 1, opacity: (!file || uploading) ? 0.55 : 1 }}>
          {uploading ? '⏳ جارٍ الرفع...' : '📤 رفع الصورة'}
        </button>
        {file && (
          <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}
            className="btn btn-secondary btn-sm">✕</button>
        )}
      </div>

      {/* Images grid */}
      {images.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>لا توجد صور بعد</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: '10px' }}>
          {images.map((img, i) => (
            <a key={img.id || i} href={img.url} target="_blank" rel="noreferrer"
              style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(15,118,110,0.12)', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <img src={img.url} alt={img.fileName}
                style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none' }} />
              <div style={{ padding: '5px 8px', fontSize: '10px', color: '#64748b', fontWeight: '600', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {img.fileName || 'صورة'}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Content ─────────────────────────────────────────────
function QawadyContent() {
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')

  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [showModal, setModal] = useState(false)
  const [editItem, setEdit]   = useState(null)
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getQawady()
      setList(Array.isArray(data) ? data : [])
    } catch (err) {
      showToast(err.message || 'فشل تحميل البيانات', 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = list.filter(q =>
    !search || (q.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editItem) {
        await updateQawady(editItem.id, form)
        showToast('تم تعديل بيانات القاضي')
      } else {
        await createQawady(form)
        showToast('تمت إضافة القاضي بنجاح')
      }
      setModal(false); setEdit(null)
      await load()
    } catch (err) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه القضية؟')) return
    try {
      await deleteQawady(id)
      showToast('تم الحذف', 'error')
      await load()
    } catch (err) {
      showToast(err.message || 'فشل الحذف', 'error')
    }
  }

  const totalImages = list.reduce((s, q) => s + (q.images?.length || 0), 0)

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span>الرئيسية</span> <span>›</span>
            <span>القضايا</span> <span>›</span>
            <span className="active">صور القضايا</span>
          </p>
          <h2>صور القضايا</h2>
          <p>إدارة ملفات ومستندات القضايا</p>
        </div>
        {isManager && (
          <button id="add-qawady-btn" className="btn btn-primary"
            onClick={() => { setEdit(null); setModal(true) }}>
            ➕ إضافة قضية
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold">⚖️</div>
          <div className="stat-info"><h3>{list.length}</h3><p>إجمالي القضايا</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🖼️</div>
          <div className="stat-info"><h3>{totalImages}</h3><p>إجمالي الصور</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📂</div>
          <div className="stat-info">
            <h3>{list.filter(q => (q.images?.length || 0) > 0).length}</h3>
            <p>قضاة بصور</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(15,118,110,0.08)' }}>
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input id="qawady-search" className="search-input"
              placeholder="ابحث باسم القضية..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚖️</span>
            <h3>لا يوجد قضاة</h3>
            <p>{search ? 'لا توجد نتائج مطابقة' : 'ابدأ بإضافة أول قاضٍ'}</p>
          </div>
        ) : (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(q => (
              <div key={q.id} style={{
                border: '1px solid rgba(15,118,110,0.12)', borderRadius: '14px',
                overflow: 'hidden', background: '#fafcfb',
                boxShadow: '0 2px 10px rgba(15,118,110,0.05)'
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#0f766e,#14b8a6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '800', color: '#fff',
                    boxShadow: '0 2px 8px rgba(15,118,110,0.25)'
                  }}>
                    {q.name?.[0] || '⚖'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>{q.name || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {q.images?.length || 0} صورة
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                    >
                      {expanded === q.id ? '▲ إخفاء' : '🖼️ الصور'}
                    </button>
                    {isManager && (
                      <>
                        <button className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => { setEdit(q); setModal(true) }}
                          title="تعديل" id={`edit-qawady-${q.id}`}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDelete(q.id)}
                          title="حذف" id={`delete-qawady-${q.id}`}>🗑️</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded image panel */}
                {expanded === q.id && (
                  <div style={{ borderTop: '1px solid rgba(15,118,110,0.08)', padding: '16px 18px', background: '#fff' }}>
                    <ImagePanel item={q} showToast={showToast} onRefresh={load} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <QawadyModal
          item={editItem}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}
