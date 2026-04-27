'use client'

import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { getDailyExpenses, createDailyExpense, updateDailyExpense, deleteDailyExpense } from '../lib/api'

export default function DailyExpensesPage() {
  return (
    <AuthGuard title="مصروفات المكتب" requiredRole="Manager">
      <DailyExpensesContent />
    </AuthGuard>
  )
}

// ── Modal ───────────────────────────────────────────────────
function ExpenseModal({ expense, onClose, onSave, saving }) {
  const [form, setForm] = useState(expense ? {
    date:        expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    amount:      expense.amount ?? '',
    description: expense.description || '',
  } : {
    date:        new Date().toISOString().split('T')[0],
    amount:      '',
    description: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.date) errs.date = 'التاريخ مطلوب'
    if (form.amount === '' || isNaN(Number(form.amount))) errs.amount = 'المبلغ مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      date:        form.date,
      amount:      Number(form.amount),
      description: form.description || null,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">💸</div>
            {expense ? 'تعديل مصروف' : 'إضافة مصروف للمكتب'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} id="expense-form">
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

              {/* Amount */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>المبلغ</label>
                <input type="number" className="form-input" min="0" step="0.01" placeholder="0.00" dir="ltr"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  style={errors.amount ? { borderColor: 'var(--danger)' } : {}} />
                {errors.amount && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.amount}</span>}
              </div>

              {/* Description */}
              <div className="form-group form-full">
                <label className="form-label">البيان / الوصف</label>
                <textarea className="form-input" rows={3} placeholder="وصف المصروف..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-expense-btn">
              {saving ? '⏳ جارٍ الحفظ...' : expense ? '💾 حفظ التعديلات' : '➕ إضافة المصروف'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main content ─────────────────────────────────────────────
function DailyExpensesContent() {
  const { showToast } = useApp()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear,  setFilterYear]  = useState('')
  const [showModal, setModal]   = useState(false)
  const [editExp, setEdit]      = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDailyExpenses()
      setExpenses(data)
    } catch (err) {
      showToast(err.message || 'فشل تحميل المصروفات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const years = [...new Set(expenses.map(e => e.date?.slice(0,4)).filter(Boolean))].sort((a,b) => b-a)

  const filtered = expenses.filter(e => {
    const d = e.date || ''
    if (filterYear  && !d.startsWith(filterYear))      return false
    if (filterMonth && d.slice(5,7) !== filterMonth)   return false
    if (search && !(e.description||'').includes(search) && !d.includes(search)) return false
    return true
  })

  const hasFilter = filterMonth || filterYear || search
  const resetFilters = () => { setFilterMonth(''); setFilterYear(''); setSearch('') }

  const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const monthAmount = expenses
    .filter(e => e.date?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + (e.amount || 0), 0)

  const fmt = (n) => Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG') : '—'

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editExp) {
        await updateDailyExpense(editExp.id, form)
        showToast('تم تعديل المصروف بنجاح')
      } else {
        await createDailyExpense(form)
        showToast('تم إضافة المصروف بنجاح')
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
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return
    try {
      await deleteDailyExpense(id)
      showToast('تم حذف المصروف', 'error')
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
            <span>الرئيسية</span> <span>›</span> <span className="active">مصروفات المكتب</span>
          </p>
          <h2>مصروفات المكتب</h2>
          <p>تسجيل ومتابعة مصروفات المكتب</p>
        </div>
        <button id="add-expense-btn" className="btn btn-primary"
          onClick={() => { setEdit(null); setModal(true) }}>
          ➕ إضافة مصروف
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold">💸</div>
          <div className="stat-info"><h3>{expenses.length}</h3><p>إجمالي السجلات</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">📊</div>
          <div className="stat-info"><h3 style={{ fontSize: '16px' }}>{fmt(totalAmount)}</h3><p>إجمالي المصروفات</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info"><h3 style={{ fontSize: '16px' }}>{fmt(monthAmount)}</h3><p>مصروفات هذا الشهر</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📆</div>
          <div className="stat-info"><h3>{new Set(expenses.map(e => e.date?.split('T')[0])).size}</h3><p>أيام مسجلة</p></div>
        </div>
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:'10px', padding:'16px 20px', borderBottom:'1px solid rgba(15,118,110,0.08)', flexWrap:'wrap', alignItems:'center' }}>
          <div className="search-input-wrapper" style={{ flex:1, minWidth:'180px' }}>
            <span className="search-input-icon">🔍</span>
            <input id="expenses-search" className="search-input" placeholder="ابحث بالبيان..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select id="expenses-month-filter" className="form-select" style={{ width:'140px', margin:0 }}
            value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">كل الشهور</option>
            {[['01','يناير'],['02','فبراير'],['03','مارس'],['04','أبريل'],['05','مايو'],['06','يونيو'],['07','يوليو'],['08','أغسطس'],['09','سبتمبر'],['10','أكتوبر'],['11','نوفمبر'],['12','ديسمبر']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <select id="expenses-year-filter" className="form-select" style={{ width:'110px', margin:0 }}
            value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">كل السنوات</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          {hasFilter && <button className="btn btn-secondary btn-sm" onClick={resetFilters}>✕ مسح</button>}
          {hasFilter && <span style={{ fontSize:'12px', color:'#64748b', fontWeight:'600' }}>{filtered.length} من {expenses.length}</span>}
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">💸</span>
            <h3>لا توجد مصروفات</h3>
            <p>{hasFilter ? 'لا توجد نتائج مطابقة للفلتر' : 'ابدأ بتسجيل أول مصروف للمكتب'}</p>
            {hasFilter && <button className="btn btn-secondary btn-sm" style={{ marginTop:'10px' }} onClick={resetFilters}>إعادة تعيين الفلتر</button>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>البيان</th>
                <th>الإجراءات</th>
              </tr></thead>
              <tbody>
                {filtered
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((e, i) => (
                  <tr key={e.id}>
                    <td className="td-secondary">{i + 1}</td>
                    <td>
                      <span className="badge badge-gold">{fmtDate(e.date)}</span>
                    </td>
                    <td style={{ fontWeight: '700', color: '#dc2626' }}>{fmt(e.amount)}</td>
                    <td className="td-secondary" style={{ maxWidth: '400px' }}>{e.description || '—'}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => { setEdit(e); setModal(true) }}
                          title="تعديل" id={`edit-expense-${e.id}`}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDelete(e.id)}
                          title="حذف" id={`delete-expense-${e.id}`}>🗑️</button>
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
        <ExpenseModal
          expense={editExp}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}
