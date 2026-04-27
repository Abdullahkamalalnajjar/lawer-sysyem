'use client'

import { useState, useEffect } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import {
  getDailyAccounts, createDailyAccount, updateDailyAccount, deleteDailyAccount,
  getDailyAccountsByUser, getUsers,
} from '../lib/api'

export default function DailyAccountsPage() {
  return (
    <AuthGuard title="الحسابات اليومية" requiredRole="Manager">
      <DailyAccountsContent />
    </AuthGuard>
  )
}

const fmt    = (n) => Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })
const fmtDt  = (iso) => iso ? new Date(iso).toLocaleDateString('ar-EG') : '—'
const tabBtn = (active) => ({
  padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '14px', fontWeight: active ? '800' : '500',
  color: active ? '#0f766e' : '#64748b',
  borderBottom: active ? '2px solid #0f766e' : '2px solid transparent',
  marginBottom: '-2px', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif",
})

// ── Add/Edit Modal ────────────────────────────────────────────
function DailyAccountModal({ record, users, onClose, onSave, saving }) {
  const [form, setForm] = useState(record ? {
    date: record.date?.split('T')[0] || '',
    amount: record.amount ?? '',
    appUserId: record.appUserId || '',
  } : {
    date: new Date().toISOString().split('T')[0],
    amount: '',
    appUserId: '',
  })
  const [errors, setErrors] = useState({})

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.date) errs.date = 'التاريخ مطلوب'
    if (form.amount === '' || isNaN(Number(form.amount))) errs.amount = 'المبلغ مطلوب'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ date: form.date, amount: Number(form.amount), appUserId: form.appUserId || null })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title"><div className="modal-title-icon">📊</div>{record ? 'تعديل الحساب اليومي' : 'إضافة حساب يومي'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body"><div className="form-grid">
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
                value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                style={errors.amount ? { borderColor: 'var(--danger)' } : {}} />
              {errors.amount && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.amount}</span>}
            </div>
            <div className="form-group form-full">
              <label className="form-label">المستخدم (اختياري)</label>
              <select className="form-select" value={form.appUserId}
                onChange={e => setForm(p => ({ ...p, appUserId: e.target.value }))}>
                <option value="">-- غير محدد --</option>
                {users.map(u => <option key={u.userId} value={u.userId}>{u.email}{u.roles?.length ? ` — ${u.roles.join(', ')}` : ''}</option>)}
              </select>
            </div>
          </div></div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ جارٍ الحفظ...' : record ? '💾 حفظ' : '➕ إضافة'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Member accounts panel (right side) ───────────────────────
function MemberAccountsPanel({ member, onClose }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!member) return
    setLoading(true)
    getDailyAccountsByUser(member.userId)
      .then(setAccounts)
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false))
  }, [member?.userId])

  if (!member) return null

  const total = accounts.reduce((s, r) => s + (r.amount || 0), 0)

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '400px', background: '#fff',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 48px rgba(15,118,110,0.18)',
        animation: 'slideInLeft 0.25s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#0f5e56,#0f766e,#14b8a6)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#fff' }}>
                {member.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: '600' }}>حسابات العضو</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff' }}>{member.email}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: '2px' }}>{member.roles?.join(', ')}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', color: '#fff', width: '30px', height: '30px', cursor: 'pointer', fontSize: '13px' }}>✕</button>
          </div>
          {/* Total badge */}
          <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>إجمالي المبالغ</span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{fmt(total)} جنيه</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>جارٍ التحميل...</div>
            </div>
          ) : accounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📊</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>لا توجد حسابات لهذا العضو</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', marginBottom: '4px' }}>
                السجلات ({accounts.length})
              </div>
              {accounts.map((r, i) => (
                <div key={r.id} style={{ border: '1px solid rgba(15,118,110,0.12)', borderRadius: '12px', padding: '14px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f766e' }}>{fmtDt(r.date)}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>#{i + 1}</div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a' }}>{fmt(r.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(15,118,110,0.08)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: 'transparent', color: '#64748b', border: '1.5px solid rgba(15,118,110,0.2)', borderRadius: '10px', padding: '8px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", width: '100%' }}>إغلاق</button>
        </div>
      </div>
      <style>{`@keyframes slideInLeft { from { transform:translateX(-100%); opacity:0 } to { transform:translateX(0); opacity:1 } }`}</style>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────
function DailyAccountsContent() {
  const { showToast } = useApp()
  const [tab, setTab]         = useState('general')
  const [records, setRecords] = useState([])
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear,  setFilterYear]  = useState('')
  const [showModal, setModal] = useState(false)
  const [editRec, setEdit]    = useState(null)
  const [activeMember, setActiveMember] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [recs, usersRes] = await Promise.all([getDailyAccounts(), getUsers()])
      setRecords(recs)
      setUsers(Array.isArray(usersRes) ? usersRes : (usersRes?.value ?? []))
    } catch (e) { showToast(e.message || 'فشل التحميل', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // ── General tab data ──
  const years = [...new Set(records.map(r => r.date?.slice(0,4)).filter(Boolean))].sort((a,b)=>b-a)

  const filteredGeneral = records.filter(r => {
    const d = r.date || ''
    if (filterYear  && !d.startsWith(filterYear))    return false
    if (filterMonth && d.slice(5,7) !== filterMonth) return false
    if (search && !fmtDt(d).includes(search) && !(r.appUserIdentifier||'').includes(search)) return false
    return true
  })
  const hasFilter = filterMonth || filterYear || search
  const resetFilters = () => { setFilterMonth(''); setFilterYear(''); setSearch('') }
  const totalGeneral = records.reduce((s, r) => s + (r.amount || 0), 0)

  // ── Members tab data: group records by appUserIdentifier ──
  const memberMap = {}
  records.forEach(r => {
    const key = r.appUserIdentifier || 'غير محدد'
    if (!memberMap[key]) memberMap[key] = { email: key, total: 0, count: 0 }
    memberMap[key].total += r.amount || 0
    memberMap[key].count += 1
  })
  // merge with users list for userId
  const memberRows = Object.values(memberMap).map(m => ({
    ...m,
    userId: users.find(u => u.email === m.email)?.userId || null,
    roles:  users.find(u => u.email === m.email)?.roles  || [],
  }))

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editRec) { await updateDailyAccount(editRec.id, form); showToast('تم التعديل') }
      else         { await createDailyAccount(form); showToast('تم الإضافة') }
      setModal(false); setEdit(null); await load()
    } catch (e) { showToast(e.message || 'فشل الحفظ', 'error') }
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
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">الحسابات اليومية</span></p>
          <h2>الحسابات اليومية</h2>
          <p>تسجيل ومتابعة الحسابات اليومية للمكتب</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>➕ إضافة حساب يومي</button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card"><div className="stat-icon gold">📊</div><div className="stat-info"><h3>{records.length}</h3><p>إجمالي السجلات</p></div></div>
        <div className="stat-card"><div className="stat-icon green">💵</div><div className="stat-info"><h3 style={{ fontSize: '16px' }}>{fmt(totalGeneral)}</h3><p>إجمالي المبالغ</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">👥</div><div className="stat-info"><h3>{memberRows.length}</h3><p>أعضاء لديهم حسابات</p></div></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid rgba(15,118,110,0.10)', marginBottom: '24px' }}>
        <button style={tabBtn(tab === 'general')} onClick={() => setTab('general')}>📋 السجلات العامة ({records.length})</button>
        <button style={tabBtn(tab === 'members')} onClick={() => setTab('members')}>👥 المحامون والأعضاء ({memberRows.length})</button>
      </div>

      {/* ── GENERAL TAB ── */}
      {tab === 'general' && (
        <div className="card">
          <div style={{ display:'flex', gap:'10px', padding:'16px 20px', borderBottom:'1px solid rgba(15,118,110,0.08)', flexWrap:'wrap', alignItems:'center' }}>
            <div className="search-input-wrapper" style={{ flex:1, minWidth:'180px' }}>
              <span className="search-input-icon">🔍</span>
              <input className="search-input" placeholder="ابحث بالإيميل..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width:'140px', margin:0 }}
              value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="">كل الشهور</option>
              {[['01','يناير'],['02','فبراير'],['03','مارس'],['04','أبريل'],['05','مايو'],['06','يونيو'],['07','يوليو'],['08','أغسطس'],['09','سبتمبر'],['10','أكتوبر'],['11','نوفمبر'],['12','ديسمبر']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
            <select className="form-select" style={{ width:'110px', margin:0 }}
              value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">كل السنوات</option>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            {hasFilter && <button className="btn btn-secondary btn-sm" onClick={resetFilters}>✕ مسح</button>}
            {hasFilter && <span style={{ fontSize:'12px', color:'#64748b', fontWeight:'600' }}>{filteredGeneral.length} من {records.length}</span>}
          </div>
          {loading ? (
            <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ التحميل...</p></div>
          ) : filteredGeneral.length === 0 ? (
            <div className="empty-state"><span className="empty-state-icon">📊</span><h3>لا توجد حسابات</h3>
            <p>{hasFilter ? 'لا نتائج مطابقة للفلتر' : 'ابدأ بإضافة حساب يومي'}</p>
            {hasFilter && <button className="btn btn-secondary btn-sm" style={{ marginTop:'10px' }} onClick={resetFilters}>إعادة تعيين الفلتر</button>}
          </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>التاريخ</th><th>المبلغ</th><th>المستخدم</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {filteredGeneral.map((r, i) => (
                    <tr key={r.id}>
                      <td className="td-secondary">{i + 1}</td>
                      <td style={{ fontWeight: '700', color: 'var(--gold-bright)' }}>{fmtDt(r.date)}</td>
                      <td style={{ fontWeight: '700', color: '#16a34a' }}>{fmt(r.amount)}</td>
                      <td className="td-secondary">{r.appUserIdentifier || '—'}</td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEdit(r); setModal(true) }}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === 'members' && (
        <div className="card">
          {loading ? (
            <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جارٍ التحميل...</p></div>
          ) : memberRows.length === 0 ? (
            <div className="empty-state"><span className="empty-state-icon">👥</span><h3>لا توجد بيانات</h3><p>لم يتم ربط أي حسابات بأعضاء بعد</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>العضو</th><th>الدور</th><th>عدد السجلات</th><th>إجمالي المبالغ</th><th></th></tr></thead>
                <tbody>
                  {memberRows.map((m, i) => (
                    <tr key={m.email} style={{ cursor: 'pointer' }} onClick={() => m.userId && setActiveMember(m)}>
                      <td className="td-secondary">{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#0f766e,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900', color: '#fff', flexShrink: 0 }}>
                            {m.email?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{m.email}</span>
                        </div>
                      </td>
                      <td>{m.roles?.length ? <span className="badge badge-blue">{m.roles.join(', ')}</span> : <span className="td-secondary">—</span>}</td>
                      <td><span className="badge badge-gray">{m.count} سجل</span></td>
                      <td style={{ fontWeight: '800', color: '#16a34a' }}>{fmt(m.total)} جنيه</td>
                      <td>
                        {m.userId ? (
                          <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setActiveMember(m) }}>
                            👁️ عرض التفاصيل
                          </button>
                        ) : (
                          <span className="td-secondary" title="مستخدم غير مرتبط بـ ID">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Member detail panel */}
      {activeMember && <MemberAccountsPanel member={activeMember} onClose={() => setActiveMember(null)} />}

      {showModal && (
        <DailyAccountModal record={editRec} users={users}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave} saving={saving} />
      )}
    </>
  )
}
