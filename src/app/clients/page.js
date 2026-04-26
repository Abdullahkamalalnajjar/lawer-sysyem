'use client'

import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import { getClients, createClient, updateClient, deleteClient } from '../lib/api'

export default function ClientsPage() {
  return (
    <AuthGuard title="إدارة الموكلين">
      <ClientsContent />
    </AuthGuard>
  )
}

// ── Modal ───────────────────────────────────────────────────
function ClientModal({ client, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    client
      ? { name: client.name || '', phoneNumber: client.phoneNumber || '', address: client.address || '', caseNumber: client.caseNumber || '' }
      : { name: '', phoneNumber: '', address: '', caseNumber: '' }
  )
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim())        errs.name = 'الاسم مطلوب'
    if (!form.phoneNumber.trim()) errs.phoneNumber = 'رقم الهاتف مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }

  const field = (key, label, placeholder, required = false, opts = {}) => {
    const { full, ...inputProps } = opts
    return (
      <div className={`form-group ${full ? 'form-full' : ''}`}>
        <label className="form-label">{required && <span className="form-required">*</span>}{label}</label>
        <input
          className="form-input"
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={errors[key] ? { borderColor: 'var(--danger)' } : {}}
          {...inputProps}
        />
        {errors[key] && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors[key]}</span>}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">👤</div>
            {client ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} id="client-form">
          <div className="modal-body">
            <div className="form-grid">
              {field('name',        'الاسم الكامل',              'مثال: أحمد محمد علي',         true)}
              {field('phoneNumber', 'رقم الهاتف',              '01xxxxxxxxx',                          true, { dir: 'ltr' })}
              {field('caseNumber',  'رقم القضية',              'مثال: 2024/1234',                        false, { dir: 'ltr' })}
              {field('address',     'العنوان / محل الإقامة', 'مثال: القاهرة - مدينة نصر',  false, { full: true })}
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-client-btn">
              {saving ? '⏳ جارٍ الحفظ...' : (client ? '💾 حفظ التعديلات' : '➕ إضافة الموكل')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main content ─────────────────────────────────────────────
function ClientsContent() {
  const { showToast } = useApp()
  const [clients, setClients]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [search, setSearch]           = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editingClient, setEditing]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getClients()
      setClients(data)
    } catch (err) {
      showToast(err.message || 'فشل تحميل الموكلين', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = clients.filter(c =>
    (c.name        || '').includes(search) ||
    (c.phoneNumber || '').includes(search) ||
    (c.address     || '').includes(search) ||
    (c.caseNumber  || '').includes(search)
  )

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editingClient) {
        await updateClient(editingClient.id, form)
        showToast('تم تعديل بيانات الموكل بنجاح')
      } else {
        await createClient(form)
        showToast('تم إضافة الموكل بنجاح')
      }
      setShowModal(false)
      setEditing(null)
      await load()
    } catch (err) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموكل؟')) return
    try {
      await deleteClient(id)
      showToast('تم حذف الموكل', 'error')
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
            <span>الرئيسية</span> <span>›</span> <span className="active">الموكلين</span>
          </p>
          <h2>إدارة الموكلين</h2>
          <p>قائمة جميع الموكلين المسجلين في النظام</p>
        </div>
        <button id="add-client-btn" className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
          ➕ إضافة موكل
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold">👥</div>
          <div className="stat-info"><h3>{clients.length}</h3><p>إجمالي الموكلين</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">⚖️</div>
          <div className="stat-info">
            <h3>{clients.reduce((a, c) => a + (c.numberOfCases || 0), 0)}</h3>
            <p>إجمالي القضايا</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><h3>{clients.filter(c => (c.numberOfCases || 0) > 0).length}</h3><p>موكلين نشطين</p></div>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input
              id="clients-search"
              className="search-input"
              placeholder="ابحث بالاسم أو الهاتف أو العنوان..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            <p>جارٍ تحميل البيانات...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">👥</span>
            <h3>لا يوجد موكلين</h3>
            <p>{search ? 'لا توجد نتائج مطابقة للبحث' : 'ابدأ بإضافة موكلك الأول'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم الكامل</th>
                  <th>رقم الهاتف</th>
                  <th>رقم القضية</th>
                  <th>العنوان</th>
                  <th>عدد القضايا</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td className="td-secondary">{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--gold-deep), var(--gold-primary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: '800', color: 'rgba(0,0,0,0.8)', flexShrink: 0
                        }}>
                          {c.name?.[0]}
                        </div>
                        <span style={{ fontWeight: '600' }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="td-secondary" style={{ direction: 'ltr', textAlign: 'right' }}>{c.phoneNumber}</td>
                    <td>
                      {c.caseNumber
                        ? <span className="badge badge-gold">{c.caseNumber}</span>
                        : <span className="td-secondary">—</span>}
                    </td>
                    <td className="td-secondary">{c.address || '—'}</td>
                    <td>
                      <span className={`badge ${(c.numberOfCases || 0) > 0 ? 'badge-gold' : 'badge-gray'}`}>
                        {c.numberOfCases || 0} قضية
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditing(c); setShowModal(true) }} title="تعديل" id={`edit-client-${c.id}`}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)} title="حذف" id={`delete-client-${c.id}`}>🗑️</button>
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
        <ClientModal
          client={editingClient}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  )
}
