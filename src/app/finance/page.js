'use client'

import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { getFinancialRecords, createFinancialRecord, updateFinancialRecord, deleteFinancialRecord, getCases, getClients } from '../lib/api'

export default function FinancePage() {
  return (
    <AuthGuard title="السجلات المالية">
      <FinanceContent />
    </AuthGuard>
  )
}

// ── Modal ───────────────────────────────────────────────────
function FinanceModal({ record, cases, clients, onClose, onSave, saving }) {
  const [form, setForm] = useState(record ? {
    date:          record.date?.split('T')[0] || '',
    depositNumber: record.depositNumber || '',
    clientId:      record.clientId || '',
    caseId:        record.caseId || '',
  } : {
    date: new Date().toISOString().split('T')[0],
    depositNumber: '', clientId: '', caseId: '',
  })
  const [errors, setErrors] = useState({})

  // Filter cases by selected client
  const clientCases = form.clientId
    ? cases.filter(c => c.clientId === form.clientId)
    : cases

  const validate = () => {
    const errs = {}
    if (!form.date)      errs.date      = 'التاريخ مطلوب'
    if (!form.clientId)  errs.clientId  = 'يجب اختيار الموكل'
    if (!form.caseId)    errs.caseId    = 'يجب اختيار القضية'
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
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">💰</div>
            {record ? 'تعديل السجل المالي' : 'إضافة سجل مالي جديد'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} id="finance-form">
          <div className="modal-body">
            <div className="form-grid">
              {/* Date */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>التاريخ</label>
                <input className="form-input" type="date" dir="ltr" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={errors.date ? { borderColor: 'var(--danger)' } : {}} />
                {errors.date && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.date}</span>}
              </div>

              {/* Deposit number */}
              <div className="form-group">
                <label className="form-label">رقم الإيداع</label>
                <input className="form-input" placeholder="مثال: DEP-001" dir="ltr" value={form.depositNumber}
                  onChange={e => setForm(p => ({ ...p, depositNumber: e.target.value }))} />
              </div>

              {/* Client */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>الموكل</label>
                <select className="form-select" value={form.clientId}
                  onChange={e => setForm(p => ({ ...p, clientId: e.target.value, caseId: '' }))}
                  style={errors.clientId ? { borderColor: 'var(--danger)' } : {}}>
                  <option value="">-- اختر الموكل --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.clientId && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.clientId}</span>}
              </div>

              {/* Case */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>القضية</label>
                <select className="form-select" value={form.caseId}
                  onChange={e => setForm(p => ({ ...p, caseId: e.target.value }))}
                  style={errors.caseId ? { borderColor: 'var(--danger)' } : {}}>
                  <option value="">-- اختر القضية --</option>
                  {clientCases.map(c => <option key={c.id} value={c.id}>{c.caseNumber}</option>)}
                </select>
                {errors.caseId && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.caseId}</span>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-finance-btn">
              {saving ? '⏳ جارٍ الحفظ...' : record ? '💾 حفظ التعديلات' : '➕ إضافة السجل'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main content ─────────────────────────────────────────────
function FinanceContent() {
  const { showToast } = useApp()
  const [records, setRecords]   = useState([])
  const [cases, setCases]       = useState([])
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [showModal, setModal]   = useState(false)
  const [editRecord, setEdit]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [r, c, cl] = await Promise.all([getFinancialRecords(), getCases(), getClients()])
      setRecords(r)
      setCases(c)
      setClients(cl)
    } catch (err) {
      showToast(err.message || 'فشل تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]))
  const caseMap   = Object.fromEntries(cases.map(c => [c.id, c.caseNumber]))

  const filtered = records.filter(r => {
    if (!search) return true
    return (
      (clientMap[r.clientId] || '').includes(search) ||
      (caseMap[r.caseId] || '').includes(search) ||
      (r.depositNumber || '').includes(search)
    )
  })

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editRecord) {
        await updateFinancialRecord(editRecord.id, form)
        showToast('تم تعديل السجل المالي بنجاح')
      } else {
        await createFinancialRecord(form)
        showToast('تم إضافة السجل المالي بنجاح')
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
    if (!confirm('هل أنت متأكد من حذف هذا السجل المالي؟')) return
    try {
      await deleteFinancialRecord(id)
      showToast('تم حذف السجل المالي', 'error')
      await load()
    } catch (err) {
      showToast(err.message || 'فشل الحذف', 'error')
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">المالية</span></p>
          <h2>السجلات المالية</h2>
          <p>إدارة الإيداعات والسجلات المالية للقضايا</p>
        </div>
        <button id="add-finance-btn" className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>
          ➕ إضافة سجل مالي
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card"><div className="stat-icon gold">💰</div><div className="stat-info"><h3>{records.length}</h3><p>إجمالي السجلات</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">👥</div><div className="stat-info"><h3>{new Set(records.map(r => r.clientId)).size}</h3><p>موكلين لديهم سجلات</p></div></div>
        <div className="stat-card"><div className="stat-icon green">📁</div><div className="stat-info"><h3>{new Set(records.map(r => r.caseId)).size}</h3><p>قضايا لها سجلات</p></div></div>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input id="finance-search" className="search-input"
              placeholder="ابحث باسم الموكل أو رقم القضية أو الإيداع..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">💰</span>
            <h3>لا توجد سجلات مالية</h3>
            <p>{search ? 'لا توجد نتائج مطابقة' : 'ابدأ بإضافة أول سجل مالي'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th><th>التاريخ</th><th>رقم الإيداع</th><th>الموكل</th><th>القضية</th><th>الإجراءات</th>
              </tr></thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="td-secondary">{i + 1}</td>
                    <td style={{ fontWeight: '600' }}>{formatDate(r.date)}</td>
                    <td>
                      {r.depositNumber
                        ? <span className="badge badge-gold">{r.depositNumber}</span>
                        : <span className="td-secondary">—</span>
                      }
                    </td>
                    <td style={{ fontWeight: '600' }}>{clientMap[r.clientId] || '—'}</td>
                    <td>
                      <span style={{ color: 'var(--gold-bright)', fontWeight: '700' }}>
                        {caseMap[r.caseId] || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEdit(r); setModal(true) }} title="تعديل" id={`edit-finance-${r.id}`}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)} title="حذف" id={`delete-finance-${r.id}`}>🗑️</button>
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
        <FinanceModal
          record={editRecord}
          cases={cases}
          clients={clients}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}
