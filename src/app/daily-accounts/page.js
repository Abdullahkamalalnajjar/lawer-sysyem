'use client'

import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { getDailyAccounts, createDailyAccount, updateDailyAccount, deleteDailyAccount, getUsers } from '../lib/api'

export default function DailyAccountsPage() {
  return (
    <AuthGuard title="الحسابات اليومية" requiredRole="Manager">
      <DailyAccountsContent />
    </AuthGuard>
  )
}

// ── Modal ───────────────────────────────────────────────────
function DailyAccountModal({ record, users, onClose, onSave, saving }) {
  const [form, setForm] = useState(record ? {
    date:   record.date   || '',
    amount: record.amount ?? '',
    userId: record.userId || '',
  } : {
    date:   new Date().toISOString().split('T')[0],
    amount: '',
    userId: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.date)   errs.date   = 'التاريخ مطلوب'
    if (form.amount === '' || isNaN(Number(form.amount))) errs.amount = 'المبلغ مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      date:   form.date,
      amount: Number(form.amount),
      userId: form.userId || null,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">📊</div>
            {record ? 'تعديل الحساب اليومي' : 'إضافة حساب يومي'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">

              {/* Date */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>التاريخ</label>
                <input type="date" className="form-input" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={errors.date ? { borderColor: 'var(--danger)' } : {}} />
                {errors.date && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.date}</span>}
              </div>

              {/* Amount */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>المبلغ</label>
                <input type="number" min="0" step="0.01" className="form-input" placeholder="0.00" dir="ltr"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  style={errors.amount ? { borderColor: 'var(--danger)' } : {}} />
                {errors.amount && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.amount}</span>}
              </div>

              {/* User selector */}
              <div className="form-group form-full">
                <label className="form-label">المستخدم</label>
                <select className="form-select" value={form.userId}
                  onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
                  <option value="">-- اختر المستخدم (اختياري) --</option>
                  {users.map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.email}{u.roles?.length ? ` — ${u.roles.join(', ')}` : ''}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ جارٍ الحفظ...' : record ? '💾 حفظ' : '➕ إضافة'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main content ─────────────────────────────────────────────
function DailyAccountsContent() {
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')
  const [records, setRecords] = useState([])
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [showModal, setModal] = useState(false)
  const [editRec, setEdit]    = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [recs, usersRes] = await Promise.all([getDailyAccounts(), getUsers()])
      setRecords(recs)
      // getUsers returns { value: [...] } or plain array
      const usersList = Array.isArray(usersRes) ? usersRes : (usersRes?.value ?? [])
      setUsers(usersList)
    } catch (e) { showToast(e.message || 'فشل التحميل', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Build userId → email map for display
  const userMap = Object.fromEntries(users.map(u => [u.userId, u.email]))

  const filtered = records.filter(r =>
    !search ||
    r.date?.includes(search) ||
    r.fullName?.includes(search) ||
    (userMap[r.userId] || '').includes(search)
  )

  const totalAmount = records.reduce((s, r) => s + (r.amount || 0), 0)
  const fmt = (n) => Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editRec) { await updateDailyAccount(editRec.id, form); showToast('تم التعديل') }
      else         { await createDailyAccount(form); showToast('تم الإضافة') }
      setModal(false); setEdit(null); await load()
    } catch (e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('تأكيد الحذف؟')) return
    try { await deleteDailyAccount(id); showToast('تم الحذف', 'error'); await load() }
    catch (e) { showToast(e.message, 'error') }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span>الرئيسية</span> <span>›</span> <span className="active">الحسابات اليومية</span>
          </p>
          <h2>الحسابات اليومية</h2>
          <p>تسجيل ومتابعة الحسابات والمبالغ اليومية</p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>
            ➕ إضافة حساب يومي
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold">📊</div>
          <div className="stat-info"><h3>{records.length}</h3><p>إجمالي السجلات</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💵</div>
          <div className="stat-info"><h3 style={{ fontSize: '16px' }}>{fmt(totalAmount)}</h3><p>إجمالي المبالغ</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info"><h3>{new Set(records.map(r => r.date)).size}</h3><p>أيام مسجلة</p></div>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input className="search-input" placeholder="ابحث بالتاريخ أو المستخدم..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ التحميل...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📊</span>
            <h3>لا توجد حسابات</h3>
            <p>{search ? 'لا نتائج مطابقة' : 'ابدأ بإضافة حساب يومي'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>المستخدم</th>
                {isManager && <th>الإجراءات</th>}
              </tr></thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="td-secondary">{i + 1}</td>
                    <td style={{ fontWeight: '700', color: 'var(--gold-bright)' }}>{r.date || '—'}</td>
                    <td style={{ fontWeight: '700', color: '#16a34a' }}>{fmt(r.amount)}</td>
                    <td className="td-secondary">
                      {r.fullName || userMap[r.userId] || '—'}
                    </td>
                    {isManager && (
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => { setEdit(r); setModal(true) }}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon"
                            onClick={() => handleDelete(r.id)}>🗑️</button>
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
        <DailyAccountModal
          record={editRec}
          users={users}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}
