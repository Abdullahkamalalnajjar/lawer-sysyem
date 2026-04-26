'use client'
import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { getNotes, createNote, updateNote, deleteNote } from '../lib/api'

export default function NotesPage() {
  return <AuthGuard title="الملاحظات" requiredRole="Manager"><NotesContent /></AuthGuard>
}

function NoteModal({ note, onClose, onSave, saving }) {
  const [form, setForm] = useState(note
    ? { date: note.date || '', description: note.description || '' }
    : { date: new Date().toISOString().split('T')[0], description: '' })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.date) errs.date = 'التاريخ مطلوب'
    if (!form.description.trim()) errs.description = 'نص الملاحظة مطلوب'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div className="modal-title"><div className="modal-title-icon">📝</div>{note ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span>التاريخ</label>
                <input type="date" className="form-input" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={errors.date ? { borderColor: 'var(--danger)' } : {}} />
                {errors.date && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.date}</span>}
              </div>
              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span>نص الملاحظة</label>
                <textarea className="form-input" rows={5} placeholder="اكتب ملاحظتك هنا..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '120px', ...(errors.description ? { borderColor: 'var(--danger)' } : {}) }} />
                {errors.description && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.description}</span>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ جارٍ الحفظ...' : note ? '💾 حفظ' : '➕ إضافة'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function NotesContent() {
  const { showToast } = useApp()
  const [notes, setNotes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [showModal, setModal] = useState(false)
  const [editNote, setEdit]   = useState(null)

  const load = async () => {
    setLoading(true)
    try { setNotes(await getNotes()) }
    catch (e) { showToast(e.message || 'فشل التحميل', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = notes.filter(n => !search || n.description?.includes(search) || n.date?.includes(search))

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editNote) { await updateNote(editNote.id, form); showToast('تم التعديل') }
      else          { await createNote(form); showToast('تمت الإضافة') }
      setModal(false); setEdit(null); await load()
    } catch (e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('تأكيد حذف الملاحظة؟')) return
    try { await deleteNote(id); showToast('تم الحذف', 'error'); await load() }
    catch (e) { showToast(e.message, 'error') }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">الملاحظات</span></p>
          <h2>الملاحظات</h2>
          <p>تدوين وإدارة الملاحظات ({notes.length} ملاحظة)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>➕ إضافة ملاحظة</button>
      </div>
      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input className="search-input" placeholder="ابحث في الملاحظات..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ التحميل...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon">📝</span><h3>لا توجد ملاحظات</h3><p>{search ? 'لا نتائج' : 'ابدأ بإضافة ملاحظة'}</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px', padding: '8px 0' }}>
            {filtered.map(n => (
              <div key={n.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-gold">{n.date}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEdit(n); setModal(true) }}>✏️</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(n.id)}>🗑️</button>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', margin: 0 }}>{n.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <NoteModal note={editNote} onClose={() => { setModal(false); setEdit(null) }} onSave={handleSave} saving={saving} />}
    </>
  )
}
