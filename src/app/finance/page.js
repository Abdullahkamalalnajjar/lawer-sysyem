'use client'

import { useState, useEffect, Fragment } from 'react'
import { useApp, AuthGuard } from '../components/AppShell'
import {
  getFinancialRecords, createFinancialRecord, updateFinancialRecord, deleteFinancialRecord,
  getClients, getDailyAccounts, getDailyAccountsByUser, getUsers, createPayment,
} from '../lib/api'

export default function FinancePage() {
  return <AuthGuard title="السجلات المالية" requiredRole="Manager"><FinanceContent /></AuthGuard>
}

const fmt   = (n) => Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })
const fmtDt = (iso) => iso ? new Date(iso).toLocaleDateString('ar-EG') : '—'
const tabBtn = (active) => ({
  padding: '13px 28px', background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '14px', fontWeight: active ? '800' : '500',
  color: active ? '#0f766e' : '#64748b',
  borderBottom: active ? '2px solid #0f766e' : '2px solid transparent',
  marginBottom: '-2px', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif",
})

// ── Finance Modal ─────────────────────────────────────────────
function FinanceModal({ record, clients, onClose, onSave, saving }) {
  const [form, setForm] = useState(record
    ? { clientId: record.clientId||'', date: record.date?.split('T')[0]||new Date().toISOString().split('T')[0], agreedAmount: record.agreedAmount??'', paidAmount: record.paidAmount??'' }
    : { clientId: '', date: new Date().toISOString().split('T')[0], agreedAmount: '', paidAmount: '' })
  const [errors, setErrors] = useState({})

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.clientId) errs.clientId = 'يجب اختيار الموكل'
    if (form.agreedAmount === '' || isNaN(Number(form.agreedAmount))) errs.agreedAmount = 'المبلغ المتفق عليه مطلوب'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ clientId: form.clientId, date: form.date, agreedAmount: Number(form.agreedAmount), paidAmount: form.paidAmount !== '' ? Number(form.paidAmount) : 0 })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title"><div className="modal-title-icon">💰</div>{record ? 'تعديل السجل المالي' : 'إضافة سجل مالي جديد'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body"><div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label"><span className="form-required">*</span>الموكل</label>
              <select className="form-select" value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} style={errors.clientId ? { borderColor: 'var(--danger)' } : {}}>
                <option value="">-- اختر الموكل --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.clientId && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.clientId}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">تاريخ السجل</label>
              <input className="form-input" type="date" dir="ltr" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label"><span className="form-required">*</span>المبلغ المتفق عليه</label>
              <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" dir="ltr" value={form.agreedAmount} onChange={e => setForm(p => ({ ...p, agreedAmount: e.target.value }))} style={errors.agreedAmount ? { borderColor: 'var(--danger)' } : {}} />
              {errors.agreedAmount && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.agreedAmount}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">المبلغ المدفوع</label>
              <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" dir="ltr" value={form.paidAmount} onChange={e => setForm(p => ({ ...p, paidAmount: e.target.value }))} />
            </div>
          </div></div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-finance-btn">{saving ? '⏳ جارٍ الحفظ...' : record ? '💾 حفظ التعديلات' : '➕ إضافة السجل'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Payment Modal ─────────────────────────────────────────────
function PaymentModal({ record, clientName, onClose, onSave, saving }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ date: today, amount: '' })
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('أدخل مبلغاً صحيحاً أكبر من صفر'); return
    }
    onSave({ date: form.date, amount: Number(form.amount) })
  }

  const remain = Math.max(0, (record?.agreedAmount || 0) - (record?.paidAmount || 0))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div className="modal-title"><div className="modal-title-icon">💵</div>إضافة دفعة جديدة</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {/* Summary */}
            <div style={{ background:'rgba(15,118,110,0.05)', border:'1px solid rgba(15,118,110,0.12)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', display:'flex', flexDirection:'column', gap:'4px' }}>
              <span style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>📋 {clientName}</span>
              <span style={{ fontSize:'12px', color:'#64748b' }}>المتبقي: <strong style={{ color: remain > 0 ? '#dc2626' : '#16a34a' }}>{Number(remain).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} جنيه</strong></span>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">تاريخ الدفعة</label>
                <input className="form-input" type="date" dir="ltr" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>مبلغ الدفعة</label>
                <input className="form-input" type="number" min="0.01" step="0.01" placeholder="0.00" dir="ltr"
                  value={form.amount} onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setError('') }}
                  style={error ? { borderColor: 'var(--danger)' } : {}} autoFocus />
                {error && <span style={{ fontSize:'12px', color:'var(--danger)' }}>{error}</span>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-payment-btn">
              {saving ? '⏳ جارٍ الحفظ...' : '💵 تأكيد الدفعة'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Member Detail Panel ───────────────────────────────────────
function MemberPanel({ member, onClose }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!member?.userId) return
    setLoading(true)
    getDailyAccountsByUser(member.userId)
      .then(setAccounts).catch(() => setAccounts([]))
      .finally(() => setLoading(false))
  }, [member?.userId])

  if (!member) return null
  const total = accounts.reduce((s, r) => s + (r.amount || 0), 0)

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.3)',backdropFilter:'blur(2px)',zIndex:200 }} />
      <div style={{ position:'fixed',top:0,left:0,bottom:0,width:'380px',background:'#fff',zIndex:201,display:'flex',flexDirection:'column',boxShadow:'-8px 0 48px rgba(15,118,110,0.18)',animation:'slideInLeft 0.25s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ padding:'20px 24px',background:'linear-gradient(135deg,#0f5e56,#0f766e,#14b8a6)',flexShrink:0 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
              <div style={{ width:'44px',height:'44px',borderRadius:'50%',background:'rgba(255,255,255,0.22)',border:'2px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'900',color:'#fff' }}>{member.email?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontSize:'10px',color:'rgba(255,255,255,0.65)',fontWeight:'600' }}>الحسابات اليومية</div>
                <div style={{ fontSize:'14px',fontWeight:'900',color:'#fff' }}>{member.email}</div>
                {member.roles?.length > 0 && <div style={{ fontSize:'11px',color:'rgba(255,255,255,0.7)',marginTop:'2px' }}>{member.roles.join(', ')}</div>}
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:'8px',color:'#fff',width:'30px',height:'30px',cursor:'pointer',fontSize:'13px' }}>✕</button>
          </div>
          <div style={{ background:'rgba(255,255,255,0.15)',borderRadius:'10px',padding:'10px 16px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span style={{ fontSize:'12px',color:'rgba(255,255,255,0.75)',fontWeight:'600' }}>إجمالي الحسابات</span>
            <span style={{ fontSize:'18px',fontWeight:'900',color:'#fff' }}>{fmt(total)} جنيه</span>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px' }}>
          {loading ? (
            <div style={{ textAlign:'center',padding:'40px',color:'#94a3b8' }}><div style={{ fontSize:'32px',marginBottom:'10px' }}>⏳</div><div style={{ fontSize:'13px',fontWeight:'600' }}>جارٍ التحميل...</div></div>
          ) : accounts.length === 0 ? (
            <div style={{ textAlign:'center',padding:'40px',color:'#94a3b8' }}><div style={{ fontSize:'36px',marginBottom:'10px' }}>📊</div><div style={{ fontSize:'13px',fontWeight:'600' }}>لا توجد حسابات لهذا العضو</div></div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
              <div style={{ fontSize:'11px',fontWeight:'800',color:'#94a3b8',letterSpacing:'1px',marginBottom:'4px' }}>السجلات ({accounts.length})</div>
              {accounts.map((r, i) => (
                <div key={r.id} style={{ border:'1px solid rgba(15,118,110,0.12)',borderRadius:'12px',padding:'14px',background:'#f8fafc',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:'13px',fontWeight:'800',color:'#0f766e' }}>{fmtDt(r.date)}</div>
                    <div style={{ fontSize:'11px',color:'#94a3b8',marginTop:'2px' }}>#{i + 1}</div>
                  </div>
                  <div style={{ fontSize:'16px',fontWeight:'900',color:'#16a34a' }}>{fmt(r.amount)} جنيه</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding:'14px 20px',borderTop:'1px solid rgba(15,118,110,0.08)',flexShrink:0 }}>
          <button onClick={onClose} style={{ background:'transparent',color:'#64748b',border:'1.5px solid rgba(15,118,110,0.2)',borderRadius:'10px',padding:'8px 20px',fontWeight:'700',fontSize:'13px',cursor:'pointer',fontFamily:"'Cairo',sans-serif",width:'100%' }}>إغلاق</button>
        </div>
      </div>
      <style>{`@keyframes slideInLeft{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────
function FinanceContent() {
  const { showToast } = useApp()
  const [tab, setTab]       = useState('clients')
  const [records, setRecords] = useState([])
  const [clients, setClients] = useState([])
  const [dailyAll, setDailyAll] = useState([])
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]  = useState(false)
  const [search, setSearch]  = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear,  setFilterYear]  = useState('')
  const [editRecord, setEdit]   = useState(null)
  const [showModal, setModal]   = useState(false)
  const [payRecord, setPay]     = useState(null)
  const [activeMember, setActiveMember] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [r, cl, da, u] = await Promise.all([getFinancialRecords(), getClients(), getDailyAccounts(), getUsers()])
      setRecords(r); setClients(cl)
      setDailyAll(da)
      setUsers(Array.isArray(u) ? u : (u?.value ?? []))
    } catch (err) { showToast(err.message || 'فشل تحميل البيانات', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]))

  // Separate parent records from payment sub-records
  const parentRecords  = records.filter(r => !r.parentFinancialRecordId)
  const paymentRecords = records.filter(r =>  r.parentFinancialRecordId)
  const paymentsMap    = {}           // parentId → payment[]
  paymentRecords.forEach(p => {
    const pid = p.parentFinancialRecordId
    if (!paymentsMap[pid]) paymentsMap[pid] = []
    paymentsMap[pid].push(p)
  })

  // Clients tab filter — only parent records
  const years = [...new Set(parentRecords.map(r => r.date?.slice(0,4)).filter(Boolean))].sort((a,b)=>b-a)
  const filteredClients = parentRecords.filter(r => {
    const d = r.date || ''
    if (filterYear  && !d.startsWith(filterYear))    return false
    if (filterMonth && d.slice(5,7) !== filterMonth) return false
    if (search && !(clientMap[r.clientId]||'').includes(search)) return false
    return true
  })
  const hasFilter = filterMonth || filterYear || search
  const resetFilters = () => { setFilterMonth(''); setFilterYear(''); setSearch('') }

  // Totals from parent records using API fields
  const totalAgreed = parentRecords.reduce((s, r) => s + (r.originalAgreedAmount ?? r.agreedAmount ?? 0), 0)
  const totalPaid   = parentRecords.reduce((s, r) => s + (r.paidAmount || 0) + (paymentsMap[r.id]||[]).reduce((ps,p)=>ps+(p.paidAmount||0),0), 0)
  const totalRemain = parentRecords.reduce((s, r) => s + (r.remainingAmount ?? 0), 0)

  // Members tab — group daily accounts by appUserIdentifier
  const memberMap = {}
  dailyAll.forEach(r => {
    const key = r.appUserIdentifier || 'غير محدد'
    if (!memberMap[key]) memberMap[key] = { email: key, total: 0, count: 0 }
    memberMap[key].total += r.amount || 0
    memberMap[key].count += 1
  })
  const memberRows = Object.values(memberMap).map(m => ({
    ...m,
    userId: users.find(u => u.email === m.email)?.userId || null,
    roles:  users.find(u => u.email === m.email)?.roles  || [],
  }))

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editRecord) { await updateFinancialRecord(editRecord.id, form); showToast('تم تعديل السجل المالي بنجاح') }
      else            { await createFinancialRecord(form); showToast('تم إضافة السجل المالي بنجاح') }
      setModal(false); setEdit(null); await load()
    } catch (err) { showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error') }
    finally { setSaving(false) }
  }

  const handlePayment = async (form) => {
    setSaving(true)
    try {
      await createPayment(payRecord.id, form)
      showToast('تم تسجيل الدفعة بنجاح ✅')
      setPay(null); await load()
    } catch (err) { showToast(err.message || 'فشل تسجيل الدفعة', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل المالي؟')) return
    try { await deleteFinancialRecord(id); showToast('تم حذف السجل المالي', 'error'); await load() }
    catch (err) { showToast(err.message || 'فشل الحذف', 'error') }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb"><span>الرئيسية</span> <span>›</span> <span className="active">المالية</span></p>
          <h2>السجلات المالية</h2>
          <p>إدارة مالية الموكلين والمحامين والأعضاء</p>
        </div>
        {tab === 'clients' && (
          <button id="add-finance-btn" className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>➕ إضافة سجل مالي</button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '24px' }}>
        <div className="stat-card"><div className="stat-icon gold">💰</div><div className="stat-info"><h3>{records.length}</h3><p>سجلات الموكلين</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">📝</div><div className="stat-info"><h3 style={{ fontSize:'16px' }}>{fmt(totalAgreed)}</h3><p>إجمالي المتفق عليه</p></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3 style={{ fontSize:'16px' }}>{fmt(totalPaid)}</h3><p>إجمالي المدفوع</p></div></div>
        <div className="stat-card"><div className="stat-icon red">👥</div><div className="stat-info"><h3>{memberRows.length}</h3><p>أعضاء لديهم حسابات</p></div></div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'2px solid rgba(15,118,110,0.10)', marginBottom:'24px' }}>
        <button style={tabBtn(tab === 'clients')} onClick={() => { setTab('clients'); setSearch('') }}>💰 الموكلين ({parentRecords.length})</button>
        <button style={tabBtn(tab === 'members')} onClick={() => { setTab('members'); setSearch('') }}>👥 المحامون والأعضاء ({memberRows.length})</button>
      </div>

      {/* ── CLIENTS TAB ── */}
      {tab === 'clients' && (
        <div className="card">
          <div style={{ display:'flex', gap:'10px', padding:'16px 20px', borderBottom:'1px solid rgba(15,118,110,0.08)', flexWrap:'wrap', alignItems:'center' }}>
            <div className="search-input-wrapper" style={{ flex:1, minWidth:'180px' }}>
              <span className="search-input-icon">🔍</span>
              <input id="finance-search" className="search-input" placeholder="ابحث باسم الموكل..." value={search} onChange={e => setSearch(e.target.value)} />
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
            {hasFilter && <span style={{ fontSize:'12px', color:'#64748b', fontWeight:'600' }}>{filteredClients.length} من {records.length}</span>}
          </div>
          {loading ? (
            <div className="empty-state"><div style={{ fontSize:'36px' }}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state"><span className="empty-state-icon">💰</span><h3>لا توجد سجلات مالية</h3>
            <p>{hasFilter ? 'لا توجد نتائج مطابقة' : 'ابدأ بإضافة أول سجل مالي'}</p>
            {hasFilter && <button className="btn btn-secondary btn-sm" style={{ marginTop:'10px' }} onClick={resetFilters}>إعادة تعيين الفلتر</button>}
          </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>الموكل</th><th>التاريخ</th><th>المبلغ المتفق عليه</th><th>المدفوع</th><th>المتبقي</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {filteredClients.map((r, i) => {
                    const agreedAmt  = r.originalAgreedAmount ?? r.agreedAmount ?? 0
                    const paidAmt    = r.paidAmount ?? 0
                    const remain     = r.remainingAmount ?? Math.max(0, agreedAmt - paidAmt)
                    const subPayments = paymentsMap[r.id] || []
                    return (
                      <Fragment key={r.id}>
                        <tr key={r.id}>
                          <td className="td-secondary">{i + 1}</td>
                          <td style={{ fontWeight:'600' }}>{clientMap[r.clientId] || '—'}</td>
                          <td className="td-secondary">{fmtDt(r.date)}</td>
                          <td style={{ fontWeight:'700', color:'var(--gold-bright)' }}>{fmt(agreedAmt)}</td>
                          <td style={{ fontWeight:'600', color:'#16a34a' }}>
                            {fmt(paidAmt)}
                            {subPayments.length > 0 && (
                              <span style={{ fontSize:'10px', color:'#0f766e', fontWeight:'700', marginRight:'4px' }}>
                                +{subPayments.length} دفعة
                              </span>
                            )}
                          </td>
                          <td style={{ fontWeight:'700', color: remain > 0 ? '#dc2626' : '#16a34a' }}>{fmt(remain)}</td>
                          <td>
                            <div className="td-actions">
                              <button className="btn btn-success btn-sm btn-icon" title="إضافة دفعة"
                                onClick={() => setPay(r)} id={`pay-finance-${r.id}`}>💵</button>
                              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEdit(r); setModal(true) }} id={`edit-finance-${r.id}`}>✏️</button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)} id={`delete-finance-${r.id}`}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                        {subPayments.map((p, pi) => (
                          <tr key={p.id} style={{ background:'rgba(22,163,74,0.04)', borderTop:'none' }}>
                            <td style={{ color:'#94a3b8', fontSize:'11px', paddingRight:'28px' }}>└ {pi + 1}</td>
                            <td style={{ color:'#64748b', fontSize:'12px' }}>
                              <span style={{ background:'rgba(22,163,74,0.1)', color:'#16a34a', borderRadius:'6px', padding:'2px 8px', fontSize:'11px', fontWeight:'700' }}>
                                💵 دفعة
                              </span>
                            </td>
                            <td className="td-secondary" style={{ fontSize:'12px' }}>{fmtDt(p.date)}</td>
                            <td style={{ color:'#94a3b8', fontSize:'12px' }}>—</td>
                            <td style={{ fontWeight:'700', color:'#16a34a', fontSize:'13px' }}>{fmt(p.paidAmount)}</td>
                            <td style={{ color:'#94a3b8', fontSize:'12px' }}>—</td>
                            <td></td>
                          </tr>
                        ))}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
              {/* Footer total */}
              <div style={{ padding:'14px 20px', borderTop:'2px solid rgba(15,118,110,0.08)', display:'flex', gap:'32px', background:'rgba(15,118,110,0.03)' }}>
                <span style={{ fontSize:'13px', color:'#64748b', fontWeight:'600' }}>الإجمالي:</span>
                <span style={{ fontSize:'13px', fontWeight:'800', color:'#1e40af' }}>متفق عليه: {fmt(totalAgreed)}</span>
                <span style={{ fontSize:'13px', fontWeight:'800', color:'#16a34a' }}>مدفوع: {fmt(totalPaid)}</span>
                <span style={{ fontSize:'13px', fontWeight:'800', color:'#dc2626' }}>متبقي: {fmt(totalRemain)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === 'members' && (
        <div className="card">
          {loading ? (
            <div className="empty-state"><div style={{ fontSize:'36px' }}>⏳</div><p>جارٍ تحميل البيانات...</p></div>
          ) : memberRows.length === 0 ? (
            <div className="empty-state"><span className="empty-state-icon">👥</span><h3>لا توجد بيانات</h3><p>لم يتم ربط أي حسابات يومية بأعضاء بعد</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>العضو / المحامي</th><th>الدور</th><th>عدد السجلات</th><th>إجمالي الحسابات</th><th></th></tr></thead>
                <tbody>
                  {memberRows.map((m, i) => (
                    <tr key={m.email} style={{ cursor: m.userId ? 'pointer' : 'default' }} onClick={() => m.userId && setActiveMember(m)}>
                      <td className="td-secondary">{i + 1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#0f766e,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:'900', color:'#fff', flexShrink:0 }}>
                            {m.email?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight:'600', fontSize:'13px' }}>{m.email}</span>
                        </div>
                      </td>
                      <td>{m.roles?.length ? <span className="badge badge-blue">{m.roles.join(', ')}</span> : <span className="td-secondary">—</span>}</td>
                      <td><span className="badge badge-gray">{m.count} سجل</span></td>
                      <td style={{ fontWeight:'800', color:'#16a34a' }}>{fmt(m.total)} جنيه</td>
                      <td>
                        {m.userId ? (
                          <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); setActiveMember(m) }}>👁️ عرض التفاصيل</button>
                        ) : <span className="td-secondary">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeMember && <MemberPanel member={activeMember} onClose={() => setActiveMember(null)} />}

      {showModal && (
        <FinanceModal record={editRecord} clients={clients}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave} saving={saving} />
      )}

      {payRecord && (
        <PaymentModal
          record={payRecord}
          clientName={clientMap[payRecord.clientId] || '—'}
          onClose={() => setPay(null)}
          onSave={handlePayment}
          saving={saving}
        />
      )}
    </>
  )
}
