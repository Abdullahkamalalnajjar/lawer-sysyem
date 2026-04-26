'use client'
import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { getUsers, getDeletedUsers, signup, deleteUser, restoreDeletedUser } from '../lib/api'

export default function UsersPage() {
  return (
    <AuthGuard title="إدارة المستخدمين" requiredRole="Manager">
      <UsersContent />
    </AuthGuard>
  )
}

// ══════════════════════════════════════════════════════════════
// Add User Modal
// ══════════════════════════════════════════════════════════════
function AddUserModal({ onClose, onSaved, showToast }) {
  const [form, setForm] = useState({ email: '', password: '', role: 'Member', city: '', phoneNumber: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email) errs.email = 'البريد مطلوب'
    if (!form.password || form.password.length < 6) errs.password = 'كلمة المرور مطلوبة (6 أحرف على الأقل)'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await signup({
        email: form.email,
        password: form.password,
        role: form.role,
        city: form.city || null,
        phoneNumber: form.phoneNumber || null,
      })
      showToast('تم إضافة المستخدم بنجاح')
      onSaved()
    } catch (err) {
      showToast(err.message || 'فشل إضافة المستخدم', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">👤</div>
            إضافة مستخدم جديد
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>

              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>البريد الإلكتروني</label>
                <input className="form-input" type="email" placeholder="example@email.com" dir="ltr"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  style={errors.email ? { borderColor: 'var(--danger)' } : {}} />
                {errors.email && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>كلمة المرور</label>
                <input className="form-input" type="password" placeholder="••••••" dir="ltr"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={errors.password ? { borderColor: 'var(--danger)' } : {}} />
                {errors.password && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">الدور</label>
                <select className="form-select" value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">رقم الهاتف</label>
                <input className="form-input" placeholder="01xxxxxxxxx" dir="ltr"
                  value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input className="form-input" placeholder="المدينة..."
                  value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              </div>

            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ جاري الحفظ...' : '➕ إضافة المستخدم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Restore User Modal
// ══════════════════════════════════════════════════════════════
function RestoreModal({ user, onClose, onRestored, showToast }) {
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleRestore = async () => {
    if (!password || password.length < 6) {
      showToast('كلمة المرور مطلوبة (6 أحرف على الأقل)', 'error')
      return
    }
    setSaving(true)
    try {
      await restoreDeletedUser({ email: user.email, password })
      showToast('تم استعادة المستخدم بنجاح')
      onRestored()
    } catch (err) {
      showToast(err.message || 'فشل الاستعادة', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">🔄</div>
            استعادة مستخدم
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ background: '#f7faf9', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(15,118,110,0.1)' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>البريد الإلكتروني</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }} dir="ltr">{user.email}</div>
          </div>
          <div className="form-group">
            <label className="form-label"><span className="form-required">*</span>كلمة المرور الجديدة</label>
            <input className="form-input" type="password" placeholder="••••••" dir="ltr"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRestore()} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={handleRestore} disabled={saving}>
            {saving ? '⏳ جاري الاستعادة...' : '🔄 استعادة'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Main Content
// ══════════════════════════════════════════════════════════════
function UsersContent() {
  const { showToast } = useApp()
  const [users, setUsers]           = useState([])
  const [deletedUsers, setDeleted]  = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('active') // 'active' | 'deleted'
  const [showAddModal, setShowAdd]  = useState(false)
  const [restoreUser, setRestore]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getUsers()
      const list = Array.isArray(res) ? res : (res?.value ?? [])
      setUsers(list)
    } catch (e) { showToast(e.message || 'فشل تحميل المستخدمين', 'error') }
    try {
      const res = await getDeletedUsers()
      const list = Array.isArray(res) ? res : (res?.value ?? [])
      setDeleted(list)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (u) => {
    if (!confirm(`تأكيد تعطيل المستخدم ${u.email}؟`)) return
    try {
      await deleteUser(u.userId)
      showToast('تم تعطيل المستخدم', 'error')
      await load()
    } catch (e) {
      showToast(e.message || 'فشل التعطيل', 'error')
    }
  }

  const activeList = users
  const deletedList = deletedUsers

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span>الرئيسية</span> <span>›</span> <span className="active">المستخدمين</span>
          </p>
          <h2>إدارة المستخدمين</h2>
          <p>إضافة وتعطيل واستعادة حسابات المستخدمين</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          ➕ إضافة مستخدم
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div className="stat-info"><h3>{activeList.length}</h3><p>مستخدمين نشطين</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">🚫</div>
          <div className="stat-info"><h3>{deletedList.length}</h3><p>مستخدمين معطلين</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📊</div>
          <div className="stat-info"><h3>{activeList.length + deletedList.length}</h3><p>إجمالي الحسابات</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border-light)', marginBottom: '0' }}>
          {[
            { id: 'active', label: `المستخدمين النشطين (${activeList.length})`, icon: '✅' },
            { id: 'deleted', label: `المعطلين (${deletedList.length})`, icon: '🚫' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '14px 8px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '13px',
                fontWeight: tab === t.id ? '800' : '500',
                color: tab === t.id ? '#0f766e' : '#64748b',
                borderBottom: tab === t.id ? '2px solid #0f766e' : '2px solid transparent',
                fontFamily: "'Cairo', sans-serif",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جاري التحميل...</p></div>
        ) : tab === 'active' ? (
          activeList.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">👥</span>
              <h3>لا يوجد مستخدمين</h3>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>#</th>
                  <th>البريد الإلكتروني</th>
                  <th>الأدوار</th>
                  <th>الإجراءات</th>
                </tr></thead>
                <tbody>
                  {activeList.map((u, i) => (
                    <tr key={u.userId}>
                      <td className="td-secondary">{i + 1}</td>
                      <td style={{ fontWeight: '600' }} dir="ltr">{u.email}</td>
                      <td>
                        {(u.roles || []).map(r => (
                          <span key={r} className="badge badge-gold" style={{ marginInlineEnd: '4px' }}>{r}</span>
                        ))}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u)}
                          style={{ fontSize: '11px', padding: '4px 12px' }}>
                          🚫 تعطيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          deletedList.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">✅</span>
              <h3>لا يوجد مستخدمين معطلين</h3>
              <p>جميع الحسابات نشطة</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>#</th>
                  <th>البريد الإلكتروني</th>
                  <th>الأدوار</th>
                  <th>الإجراءات</th>
                </tr></thead>
                <tbody>
                  {deletedList.map((u, i) => (
                    <tr key={u.userId} style={{ opacity: 0.7 }}>
                      <td className="td-secondary">{i + 1}</td>
                      <td style={{ fontWeight: '600' }} dir="ltr">{u.email}</td>
                      <td>
                        {(u.roles || []).map(r => (
                          <span key={r} className="badge badge-gold" style={{ marginInlineEnd: '4px' }}>{r}</span>
                        ))}
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm"
                          onClick={() => setRestore(u)}
                          style={{ fontSize: '11px', padding: '4px 12px' }}>
                          🔄 استعادة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load() }}
          showToast={showToast}
        />
      )}

      {restoreUser && (
        <RestoreModal
          user={restoreUser}
          onClose={() => setRestore(null)}
          onRestored={() => { setRestore(null); load() }}
          showToast={showToast}
        />
      )}
    </>
  )
}
