'use client'

import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import {
  getFinancialRecords, createFinancialRecord, updateFinancialRecord, deleteFinancialRecord,
  getClients
} from '../lib/api'

export default function FinancePage() {
  return (
    <AuthGuard title="السجلات المالية" requiredRole="Manager">
      <FinanceContent />
    </AuthGuard>
  )
}

// ── Modal ───────────────────────────────────────────────────
function FinanceModal({ record, clients, onClose, onSave, saving }) {
  const [form, setForm] = useState(record ? {
    clientId:      record.clientId     || '',
    caseNumber:    record.caseNumber   || '',
    agreedAmount:  record.agreedAmount  ?? '',
    currentAmount: record.currentAmount ?? '',
    finalTotal:    record.finalTotal    ?? '',
  } : {
    clientId: '', caseNumber: '', agreedAmount: '', currentAmount: '', finalTotal: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.clientId) errs.clientId = 'يجب اختيار الموكل'
    if (form.agreedAmount === '' || isNaN(Number(form.agreedAmount))) errs.agreedAmount = 'المبلغ المتفق عليه مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      clientId:      form.clientId,
      caseNumber:    form.caseNumber   || null,
      agreedAmount:  Number(form.agreedAmount),
      currentAmount: form.currentAmount !== '' ? Number(form.currentAmount) : 0,
      finalTotal:    form.finalTotal    !== '' ? Number(form.finalTotal)    : 0,
    })
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

              {/* Client */}
              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span>الموكل</label>
                <select className="form-select" value={form.clientId}
                  onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                  style={errors.clientId ? { borderColor: 'var(--danger)' } : {}}>
                  <option value="">-- اختر الموكل --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.clientId && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.clientId}</span>}
              </div>

              {/* Case Number */}
              <div className="form-group form-full">
                <label className="form-label">رقم القضية</label>
                <input className="form-input" placeholder="مثال: 2024/1234" dir="ltr"
                  value={form.caseNumber}
                  onChange={e => setForm(p => ({ ...p, caseNumber: e.target.value }))} />
              </div>

              {/* Agreed Amount */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>المبلغ المتفق عليه</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" dir="ltr"
                  value={form.agreedAmount}
                  onChange={e => setForm(p => ({ ...p, agreedAmount: e.target.value }))}
                  style={errors.agreedAmount ? { borderColor: 'var(--danger)' } : {}} />
                {errors.agreedAmount && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.agreedAmount}</span>}
              </div>

              {/* Current Amount */}
              <div className="form-group">
                <label className="form-label">المبلغ الحالي المدفوع</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" dir="ltr"
                  value={form.currentAmount}
                  onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))} />
              </div>

              {/* Final Total */}
              <div className="form-group form-full">
                <label className="form-label">الإجمالي النهائي</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" dir="ltr"
                  value={form.finalTotal}
                  onChange={e => setForm(p => ({ ...p, finalTotal: e.target.value }))} />
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
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')
  const [records, setRecords]   = useState([])
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [showModal, setModal]   = useState(false)
  const [editRecord, setEdit]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [r, cl] = await Promise.all([getFinancialRecords(), getClients()])
      setRecords(r)
      setClients(cl)
    } catch (err) {
      showToast(err.message || 'فشل تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]))

  const filtered = records.filter(r => {
    if (!search) return true
    return (
      (clientMap[r.clientId] || '').includes(search) ||
      (r.caseNumber || '').includes(search)
    )
  })

  // Stats
  const totalAgreed  = records.reduce((s, r) => s + (r.agreedAmount  || 0), 0)
  const totalCurrent = records.reduce((s, r) => s + (r.currentAmount || 0), 0)
  const totalFinal   = records.reduce((s, r) => s + (r.finalTotal    || 0), 0)

  const fmt = (n) => Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })

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

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">المالية</span></p>
          <h2>السجلات المالية</h2>
          <p>إدارة المبالغ المتفق عليها والمدفوعات لكل موكل</p>
        </div>
        {isManager && (
          <button id="add-finance-btn" className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>
            ➕ إضافة سجل مالي
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold">💰</div>
          <div className="stat-info"><h3>{records.length}</h3><p>إجمالي السجلات</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📝</div>
          <div className="stat-info"><h3 style={{ fontSize: '16px' }}>{fmt(totalAgreed)}</h3><p>إجمالي المتفق عليه</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><h3 style={{ fontSize: '16px' }}>{fmt(totalCurrent)}</h3><p>إجمالي المدفوع</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">🏁</div>
          <div className="stat-info"><h3 style={{ fontSize: '16px' }}>{fmt(totalFinal)}</h3><p>الإجمالي النهائي</p></div>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input id="finance-search" className="search-input"
              placeholder="ابحث باسم الموكل أو رقم القضية..."
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
                <th>#</th>
                <th>الموكل</th>
                <th>رقم القضية</th>
                <th>المبلغ المتفق عليه</th>
                <th>المبلغ الحالي</th>
                <th>الإجمالي النهائي</th>
                {isManager && <th>الإجراءات</th>}
              </tr></thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="td-secondary">{i + 1}</td>
                    <td style={{ fontWeight: '600' }}>{clientMap[r.clientId] || '—'}</td>
                    <td>
                      {r.caseNumber
                        ? <span className="badge badge-gold">{r.caseNumber}</span>
                        : <span className="td-secondary">—</span>
                      }
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--gold-bright)' }}>
                      {fmt(r.agreedAmount)}
                    </td>
                    <td style={{ fontWeight: '600', color: '#16a34a' }}>
                      {fmt(r.currentAmount)}
                    </td>
                    <td style={{ fontWeight: '700' }}>
                      {fmt(r.finalTotal)}
                    </td>
                    {isManager && (
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => { setEdit(r); setModal(true) }}
                            title="تعديل" id={`edit-finance-${r.id}`}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon"
                            onClick={() => handleDelete(r.id)}
                            title="حذف" id={`delete-finance-${r.id}`}>🗑️</button>
                        </div>
                      </td>
                    )}
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
          clients={clients}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}
