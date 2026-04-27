'use client'

import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { getDailyNotes, createDailyNote, updateDailyNote, deleteDailyNote } from '../lib/api'

export default function DailyNotesPage() {
  return (
    <AuthGuard title="الملاحظات اليومية" requiredRole="Manager">
      <DailyNotesContent />
    </AuthGuard>
  )
}

// ── Modal ───────────────────────────────────────────────────
function NoteModal({ note, onClose, onSave, saving }) {
  const [form, setForm] = useState(note ? {
    date:     note.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    noteText: note.noteText || '',
  } : {
    date:     new Date().toISOString().split('T')[0],
    noteText: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.date)           errs.date     = 'التاريخ مطلوب'
    if (!form.noteText.trim()) errs.noteText = 'نص الملاحظة مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">📝</div>
            {note ? 'تعديل الملاحظة' : 'إضافة ملاحظة جديدة'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} id="note-form">
          <div className="modal-body">
            <div className="form-grid">

              {/* Date */}
              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span>التاريخ</label>
                <input type="date" className="form-input" dir="ltr"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={errors.date ? { borderColor: 'var(--danger)' } : {}} />
                {errors.date && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.date}</span>}
              </div>

              {/* Note text */}
              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span>نص الملاحظة</label>
                <textarea className="form-input" rows={5} placeholder="اكتب ملاحظتك هنا..."
                  value={form.noteText}
                  onChange={e => setForm(p => ({ ...p, noteText: e.target.value }))}
                  style={{ resize: 'vertical', ...(errors.noteText ? { borderColor: 'var(--danger)' } : {}) }} />
                {errors.noteText && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.noteText}</span>}
              </div>

            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-note-btn">
              {saving ? '⏳ جارٍ الحفظ...' : note ? '💾 حفظ التعديلات' : '➕ إضافة الملاحظة'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main content ─────────────────────────────────────────────
function DailyNotesContent() {
  const { showToast } = useApp()
  const [notes, setNotes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [filterMonth, setFilterMonth] = useState('')   // '01'–'12' or ''
  const [filterYear,  setFilterYear]  = useState('')   // '2025' or ''
  const [showModal, setModal] = useState(false)
  const [editNote, setEdit]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDailyNotes()
      setNotes(data)
    } catch (err) {
      showToast(err.message || 'فشل تحميل الملاحظات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Derive unique years from notes
  const years = [...new Set(notes.map(n => n.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b - a)

  const filtered = notes.filter(n => {
    const dateStr = n.date || ''
    if (filterYear  && !dateStr.startsWith(filterYear))         return false
    if (filterMonth && dateStr.slice(5, 7) !== filterMonth)     return false
    if (search && !(n.noteText || '').includes(search) && !dateStr.includes(search)) return false
    return true
  })

  const hasFilter = filterMonth || filterYear || search
  const resetFilters = () => { setFilterMonth(''); setFilterYear(''); setSearch('') }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editNote) {
        await updateDailyNote(editNote.id, form)
        showToast('تم تعديل الملاحظة بنجاح')
      } else {
        await createDailyNote(form)
        showToast('تم إضافة الملاحظة بنجاح')
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
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return
    try {
      await deleteDailyNote(id)
      showToast('تم حذف الملاحظة', 'error')
      await load()
    } catch (err) {
      showToast(err.message || 'فشل الحذف', 'error')
    }
  }

  const fmt = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span>الرئيسية</span> <span>›</span> <span className="active">الملاحظات اليومية</span>
          </p>
          <h2>الملاحظات اليومية</h2>
          <p>تسجيل ومتابعة الملاحظات اليومية للمكتب ({notes.length} ملاحظة)</p>
        </div>
        <button id="add-note-btn" className="btn btn-primary"
          onClick={() => { setEdit(null); setModal(true) }}>
          ➕ إضافة ملاحظة
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold">📝</div>
          <div className="stat-info"><h3>{notes.length}</h3><p>إجمالي الملاحظات</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info"><h3>{new Set(notes.map(n => n.date?.split('T')[0])).size}</h3><p>أيام مسجلة</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{notes.filter(n => n.date?.startsWith(new Date().toISOString().slice(0,7))).length}</h3>
            <p>ملاحظات هذا الشهر</p>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderBottom: '1px solid rgba(15,118,110,0.08)', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '180px' }}>
            <span className="search-input-icon">🔍</span>
            <input id="notes-search" className="search-input"
              placeholder="ابحث في الملاحظات..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Month select */}
          <select id="notes-month-filter" className="form-select" style={{ width: '140px', margin: 0 }}
            value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">كل الشهور</option>
            {[
              ['01','يناير'],['02','فبراير'],['03','مارس'],['04','أبريل'],
              ['05','مايو'],['06','يونيو'],['07','يوليو'],['08','أغسطس'],
              ['09','سبتمبر'],['10','أكتوبر'],['11','نوفمبر'],['12','ديسمبر'],
            ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          {/* Year select */}
          <select id="notes-year-filter" className="form-select" style={{ width: '110px', margin: 0 }}
            value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">كل السنوات</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Reset */}
          {hasFilter && (
            <button className="btn btn-secondary btn-sm" onClick={resetFilters} title="إعادة تعيين الفلاتر">
              ✕ مسح
            </button>
          )}

          {/* Result count */}
          {hasFilter && (
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
              {filtered.length} من {notes.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📝</span>
            <h3>لا توجد ملاحظات</h3>
            <p>{hasFilter ? 'لا توجد نتائج مطابقة للفلتر المحدد' : 'ابدأ بإضافة أول ملاحظة يومية'}</p>
            {hasFilter && <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }} onClick={resetFilters}>إعادة تعيين الفلتر</button>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th>
                <th>التاريخ</th>
                <th>نص الملاحظة</th>
                <th>الإجراءات</th>
              </tr></thead>
              <tbody>
                {filtered
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((n, i) => (
                  <tr key={n.id}>
                    <td className="td-secondary">{i + 1}</td>
                    <td>
                      <span className="badge badge-gold">{fmt(n.date)}</span>
                    </td>
                    <td style={{ maxWidth: '500px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {n.noteText || '—'}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => { setEdit(n); setModal(true) }}
                          title="تعديل" id={`edit-note-${n.id}`}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDelete(n.id)}
                          title="حذف" id={`delete-note-${n.id}`}>🗑️</button>
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
        <NoteModal
          note={editNote}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}
