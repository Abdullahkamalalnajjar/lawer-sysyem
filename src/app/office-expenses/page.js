'use client'
import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { getOfficeExpenses, createOfficeExpense, updateOfficeExpense, deleteOfficeExpense } from '../lib/api'

export default function OfficeExpensesPage() {
  return <AuthGuard title="مصروفات المكتب" requiredRole="Manager"><OfficeExpensesContent /></AuthGuard>
}

function ExpenseModal({ expense, onClose, onSave, saving }) {
  const [form, setForm] = useState(expense
    ? { date: expense.date || '', amount: expense.amount ?? '', description: expense.description || '' }
    : { date: new Date().toISOString().split('T')[0], amount: '', description: '' })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.date) errs.date = 'التاريخ مطلوب'
    if (form.amount === '' || isNaN(Number(form.amount))) errs.amount = 'المبلغ مطلوب'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ date: form.date, amount: Number(form.amount), description: form.description || null })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title"><div className="modal-title-icon">🏢</div>{expense ? 'تعديل المصروف' : 'إضافة مصروف مكتبي'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>التاريخ</label>
                <input type="date" className="form-input" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={errors.date ? { borderColor: 'var(--danger)' } : {}} />
                {errors.date && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.date}</span>}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>المبلغ</label>
                <input type="number" min="0" step="0.01" className="form-input" placeholder="0.00" dir="ltr"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  style={errors.amount ? { borderColor: 'var(--danger)' } : {}} />
                {errors.amount && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.amount}</span>}
              </div>
              <div className="form-group form-full">
                <label className="form-label">الوصف</label>
                <textarea className="form-input" rows={3} placeholder="وصف المصروف..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ جارٍ الحفظ...' : expense ? '💾 حفظ' : '➕ إضافة'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OfficeExpensesContent() {
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [showModal, setModal]   = useState(false)
  const [editExp, setEdit]      = useState(null)

  const load = async () => {
    setLoading(true)
    try { setExpenses(await getOfficeExpenses()) }
    catch (e) { showToast(e.message || 'فشل التحميل', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = expenses.filter(e => !search || e.description?.includes(search) || e.date?.includes(search))
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const fmt = (n) => Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editExp) { await updateOfficeExpense(editExp.id, form); showToast('تم التعديل') }
      else         { await createOfficeExpense(form); showToast('تمت الإضافة') }
      setModal(false); setEdit(null); await load()
    } catch (e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('تأكيد الحذف؟')) return
    try { await deleteOfficeExpense(id); showToast('تم الحذف', 'error'); await load() }
    catch (e) { showToast(e.message, 'error') }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">مصروفات المكتب</span></p>
          <h2>مصروفات المكتب</h2>
          <p>تسجيل ومتابعة نفقات المكتب</p>
        </div>
        {isManager && <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>➕ إضافة مصروف</button>}
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card"><div className="stat-icon red">🏢</div><div className="stat-info"><h3>{expenses.length}</h3><p>إجمالي المصروفات</p></div></div>
        <div className="stat-card"><div className="stat-icon gold">💸</div><div className="stat-info"><h3 style={{ fontSize: '16px' }}>{fmt(total)}</h3><p>إجمالي المبالغ</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">📅</div><div className="stat-info"><h3>{new Set(expenses.map(e => e.date)).size}</h3><p>أيام مصروفات</p></div></div>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input className="search-input" placeholder="ابحث بالوصف أو التاريخ..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ التحميل...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon">🏢</span><h3>لا توجد مصروفات</h3><p>{search ? 'لا نتائج' : 'ابدأ بإضافة مصروف'}</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>التاريخ</th><th>المبلغ</th><th>الوصف</th>{isManager && <th>الإجراءات</th>}</tr></thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id}>
                    <td className="td-secondary">{i + 1}</td>
                    <td style={{ fontWeight: '700', color: 'var(--gold-bright)' }}>{e.date || '—'}</td>
                    <td style={{ fontWeight: '700', color: '#dc2626' }}>{fmt(e.amount)}</td>
                    <td className="td-secondary">{e.description || '—'}</td>
                    {isManager && (
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEdit(e); setModal(true) }}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(e.id)}>🗑️</button>
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
      {showModal && <ExpenseModal expense={editExp} onClose={() => { setModal(false); setEdit(null) }} onSave={handleSave} saving={saving} />}
    </>
  )
}
