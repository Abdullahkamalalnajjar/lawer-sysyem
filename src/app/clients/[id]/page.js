'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp, AuthGuard } from '../../components/AppShell'
import { getClients, getCases, getClientCases, getClientSessions, updateClient, deleteClient, createCase, createSession } from '../../lib/api'

export default function ClientDetailPage() {
  return <AuthGuard title="ملف الموكل"><ClientDetail /></AuthGuard>
}

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` }
const chipStyle = { padding:'4px 12px', borderRadius:'99px', background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.28)', color:'#fff', fontSize:'12px', fontWeight:'700' }
const btnS = (bg, color, border='none') => ({ background:bg, color, border: border==='none'?'none':border, borderRadius:'10px', padding:'10px 20px', fontWeight:'700', fontSize:'13.5px', cursor:'pointer', fontFamily:"'Cairo',sans-serif" })
const tabBtn = (active) => ({ padding:'13px 24px', background:'none', border:'none', cursor:'pointer', fontSize:'14px', fontWeight: active?'800':'500', color: active?'#0f766e':'#64748b', borderBottom: active?'2px solid #0f766e':'2px solid transparent', marginBottom:'-2px', transition:'all 0.2s', fontFamily:"'Cairo',sans-serif" })

const CASE_TYPES = ['مدني','جنائي','جنح','تجاري','إداري','أحوال شخصية','عمالي','دستوري','أخرى']
const DEGREES    = ['عادي','معرضة','استئناف','معرضة استئنافية','نقض']

// ── Add Case Modal ────────────────────────────────────────────
function AddCaseModal({ clientId, defaultCaseNumber = '', onClose, onSaved }) {
  const { showToast } = useApp()

  const [form, setForm] = useState({ caseNumber: defaultCaseNumber, caseType: 'مدني', opponent: '', degree: DEGREES[0] })
  const [saving, setSaving] = useState(false)
  const f = (k) => ({ value: form[k], onChange: e => setForm(p=>({...p,[k]:e.target.value})) })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.caseNumber.trim()) return showToast('رقم القضية مطلوب', 'error')
    setSaving(true)
    try {
      await createCase({ ...form, clientId })
      showToast('تم إضافة القضية بنجاح')
      onSaved()
    } catch (err) { showToast(err.message || 'فشل الحفظ', 'error') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:'560px' }}>
        <div className="modal-header">
          <div className="modal-title"><div className="modal-title-icon">⚖️</div>إضافة قضية جديدة</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body"><div className="form-grid">
            <div className="form-group">
              <label className="form-label"><span className="form-required">*</span>رقم القضية</label>
              <input className="form-input" placeholder="مثال: 2024/1234" dir="ltr" {...f('caseNumber')} />
            </div>
            <div className="form-group">
              <label className="form-label">نوع القضية</label>
              <select className="form-select" {...f('caseType')}>
                {CASE_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">الخصم</label>
              <input className="form-input" placeholder="اسم الخصم" {...f('opponent')} />
            </div>
            <div className="form-group">
              <label className="form-label">الدرجة</label>
              <select className="form-select" {...f('degree')}>
                {DEGREES.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div></div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'⏳ جارن الحفظ...':'➕ إضافة القضية'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add Session Modal ─────────────────────────────────────────
function AddSessionModal({ clientCases, onClose, onSaved }) {
  const { showToast } = useApp()
  const [form, setForm] = useState({ caseId:'', sessionDate:'', nextSessionDate:'', roll:'', decision:'', requests:'' })
  const [saving, setSaving] = useState(false)
  const f = (k) => ({ value: form[k], onChange: e => setForm(p=>({...p,[k]:e.target.value})) })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.caseId)       return showToast('يجب اختيار القضية', 'error')
    if (!form.sessionDate)  return showToast('تاريخ الجلسة مطلوب', 'error')
    setSaving(true)
    try {
      await createSession({ ...form, nextSessionDate: form.nextSessionDate || null })
      showToast('تم إضافة الجلسة بنجاح')
      onSaved()
    } catch (err) { showToast(err.message || 'فشل الحفظ', 'error') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:'600px' }}>
        <div className="modal-header">
          <div className="modal-title"><div className="modal-title-icon">📅</div>إضافة جلسة جديدة</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body"><div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label"><span className="form-required">*</span>القضية</label>
              <select className="form-select" {...f('caseId')}>
                <option value="">-- اختر القضية --</option>
                {clientCases.map(c=><option key={c.id} value={c.id}>{c.caseNumber} — {c.caseType}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label"><span className="form-required">*</span>تاريخ الجلسة</label>
              <input className="form-input" type="datetime-local" dir="ltr" {...f('sessionDate')} />
            </div>
            <div className="form-group">
              <label className="form-label">الجلسة القادمة (اختياري)</label>
              <input className="form-input" type="datetime-local" dir="ltr" {...f('nextSessionDate')} />
            </div>
            <div className="form-group">
              <label className="form-label">الجولة</label>
              <input className="form-input" placeholder="مثال: ١" {...f('roll')} />
            </div>
            <div className="form-group">
              <label className="form-label">القرار</label>
              <input className="form-input" placeholder="قرار الجلسة" {...f('decision')} />
            </div>
            <div className="form-group form-full">
              <label className="form-label">الطلبات</label>
              <textarea className="form-input" rows={3} placeholder="طلبات الجلسة..." style={{ resize:'vertical' }} {...f('requests')} />
            </div>
          </div></div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'⏳ جارٍ الحفظ...':'➕ إضافة الجلسة'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
function ClientDetail() {
  const { id }        = useParams()
  const router        = useRouter()
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')

  const [client,   setClient]   = useState(null)
  const [cases,    setCases]    = useState([])
  const [allCases, setAllCases] = useState([])   // all system cases for numbering
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('info')
  const [showEdit,    setShowEdit]    = useState(false)
  const [showAddCase, setShowAddCase] = useState(false)
  const [showAddSess, setShowAddSess] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({})

  const reload = () => {
    setLoading(true)
    Promise.all([getClients(), getCases(), getClientCases(id), getClientSessions(id)])
      .then(([all, allC, c, s]) => {
        const found = all.find(cl => cl.id === id)
        setClient(found || null)
        setForm(found ? { name:found.name||'', phone:found.phone||found.phoneNumber||'', address:found.address||'', caseNumber:found.caseNumber||'' } : {})
        setAllCases(allC)
        setCases(c); setSessions(s)
      })
      .catch(err => showToast(err.message || 'فشل تحميل البيانات', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (id) reload() }, [id])

  const handleSave = async () => {
    setSaving(true)
    try { await updateClient(id, form); showToast('تم التعديل بنجاح'); setClient(p=>({...p,...form})); setShowEdit(false) }
    catch (err) { showToast(err.message || 'فشل الحفظ', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد؟')) return
    try { await deleteClient(id); showToast('تم الحذف'); router.push('/clients') }
    catch (err) { showToast(err.message || 'فشل الحذف', 'error') }
  }

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:'16px',color:'#94a3b8' }}><div style={{ fontSize:'48px' }}>⏳</div><div style={{ fontSize:'14px',fontWeight:'600' }}>جارٍ تحميل ملف الموكل...</div></div>
  if (!client) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:'16px' }}><div style={{ fontSize:'48px' }}>🔍</div><div style={{ fontSize:'16px',fontWeight:'700' }}>الموكل غير موجود</div><button onClick={()=>router.push('/clients')} style={btnS('#0f766e','#fff')}>← العودة</button></div>

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span style={{ cursor:'pointer',color:'var(--text-muted)' }} onClick={()=>router.push('/clients')}>الموكلين</span>
            <span>›</span><span className="active">{client.name}</span>
          </p>
          <h2>ملف الموكل</h2>
          <p>القضايا والجلسات المرتبطة بهذا الموكل</p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={()=>router.push('/clients')} className="btn btn-secondary">← العودة</button>
          {isManager && <button onClick={()=>setShowEdit(true)} className="btn btn-primary">✏️ تعديل البيانات</button>}
        </div>
      </div>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0f5e56,#0f766e,#14b8a6)', borderRadius:'16px', padding:'28px 32px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'24px', boxShadow:'0 8px 32px rgba(15,118,110,0.25)' }}>
        <div style={{ width:'72px',height:'72px',borderRadius:'50%',background:'rgba(255,255,255,0.22)',border:'3px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:'900',color:'#fff',flexShrink:0 }}>{client.name?.[0]}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'24px',fontWeight:'900',color:'#fff',marginBottom:'6px' }}>{client.name}</div>
          <div style={{ display:'flex',gap:'10px',flexWrap:'wrap' }}>
            {client.phone && <span style={chipStyle}>📞 {client.phone}</span>}
            {client.caseNumber && <span style={chipStyle}>🗂️ {client.caseNumber}</span>}
            {client.address && <span style={chipStyle}>📍 {client.address}</span>}
          </div>
        </div>
        <div style={{ display:'flex',gap:'16px',flexShrink:0 }}>
          {[{label:'القضايا',value:cases.length,icon:'⚖️'},{label:'الجلسات',value:sessions.length,icon:'📅'},{label:'القادمة',value:sessions.filter(s=>!s.isEnded).length,icon:'⏳'}].map((s,i)=>(
            <div key={i} style={{ textAlign:'center',background:'rgba(255,255,255,0.15)',borderRadius:'12px',padding:'12px 18px',border:'1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize:'20px',marginBottom:'4px' }}>{s.icon}</div>
              <div style={{ fontSize:'22px',fontWeight:'900',color:'#fff' }}>{s.value}</div>
              <div style={{ fontSize:'11px',color:'rgba(255,255,255,0.75)',fontWeight:'600' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:'2px solid rgba(15,118,110,0.10)',marginBottom:'24px' }}>
        {[{id:'info',label:'👤 المعلومات'},{id:'cases',label:`⚖️ القضايا (${cases.length})`},{id:'sessions',label:`📅 الجلسات (${sessions.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={tabBtn(tab===t.id)}>{t.label}</button>
        ))}
      </div>

      {/* INFO TAB */}
      {tab==='info' && (
        <div className="card" style={{ padding:'0' }}>
          <div className="card-header"><div className="card-title">👤 بيانات الموكل</div></div>
          <div style={{ padding:'8px 24px 24px' }}>
            {[{label:'الاسم الكامل',value:client.name},{label:'رقم الهاتف',value:client.phone||client.phoneNumber,ltr:true},{label:'رقم القضية',value:client.caseNumber,gold:true},{label:'العنوان',value:client.address||'—'}].map((row,i)=>(
              <div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'16px 0',borderBottom:'1px solid rgba(15,118,110,0.07)',alignItems:'center' }}>
                <span style={{ fontSize:'14px',color:'#64748b',fontWeight:'600' }}>{row.label}</span>
                <span style={{ fontSize:'15px',fontWeight:'700',color:row.gold?'#0f766e':'#0f172a',direction:row.ltr?'ltr':'inherit' }}>{row.value||'—'}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:'16px 24px',borderTop:'1px solid rgba(15,118,110,0.08)',display:'flex',gap:'12px' }}>
            {isManager && <button onClick={()=>setShowEdit(true)} style={btnS('#0f766e','#fff')}>✏️ تعديل البيانات</button>}
            {isManager && <button onClick={handleDelete} style={btnS('transparent','#dc2626','1.5px solid #fca5a5')}>🗑️ حذف الموكل</button>}
          </div>
        </div>
      )}

      {/* CASES TAB */}
      {tab==='cases' && (
        <div className="card" style={{ padding:'0' }}>
          <div className="card-header">
            <div><div className="card-title">⚖️ قضايا الموكل</div><div className="card-subtitle">{cases.length} قضية مسجلة</div></div>
            {isManager && <button className="btn btn-primary btn-sm" onClick={()=>setShowAddCase(true)} id="add-case-btn">➕ إضافة قضية</button>}
          </div>
          {cases.length===0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">⚖️</span><h3>لا توجد قضايا</h3>
              <p>لم يتم تسجيل قضايا لهذا الموكل بعد</p>
              <button className="btn btn-primary" style={{ marginTop:'12px' }} onClick={()=>setShowAddCase(true)}>➕ إضافة أول قضية</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>رقم القضية</th><th>نوع القضية</th><th>الخصم</th><th>الدرجة</th><th>الصور</th></tr></thead>
                <tbody>
                  {cases.map((c,i)=>(
                    <tr key={c.id}>
                      <td className="td-secondary">{i+1}</td>
                      <td><span style={{ fontWeight:'800',color:'#0f766e',fontSize:'14px' }}>{c.caseNumber}</span></td>
                      <td><span className={`badge ${c.caseType==='مدني'?'badge-blue':c.caseType==='جنائي'?'badge-red':'badge-gray'}`}>{c.caseType}</span></td>
                      <td className="td-secondary">{c.opponent||'—'}</td>
                      <td className="td-secondary">{c.degree||'—'}</td>
                      <td className="td-secondary">{c.images?.length?`🖼️ ${c.images.length}`:'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SESSIONS TAB */}
      {tab==='sessions' && (
        <div className="card" style={{ padding:'0' }}>
          <div className="card-header">
            <div><div className="card-title">📅 جلسات الموكل</div><div className="card-subtitle">{sessions.length} جلسة مسجلة</div></div>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowAddSess(true)} id="add-session-btn" disabled={cases.length===0} title={cases.length===0?'يجب إضافة قضية أولاً':''}>➕ إضافة جلسة</button>
          </div>
          {sessions.length===0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📅</span><h3>لا توجد جلسات</h3>
              <p>{cases.length===0?'يجب إضافة قضية أولاً قبل إضافة جلسة':'لم يتم تسجيل جلسات لهذا الموكل بعد'}</p>
              {cases.length>0 && <button className="btn btn-primary" style={{ marginTop:'12px' }} onClick={()=>setShowAddSess(true)}>➕ إضافة أول جلسة</button>}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>تاريخ الجلسة</th><th>الجولة</th><th>القرار</th><th>الطلبات</th><th>الجلسة القادمة</th><th>الحالة</th></tr></thead>
                <tbody>
                  {sessions.map((s,i)=>(
                    <tr key={s.id} style={{ opacity:s.isEnded?0.72:1 }}>
                      <td className="td-secondary">{i+1}</td>
                      <td><span style={{ fontWeight:'700',color:s.isEnded?'#64748b':'#0f766e' }}>{fmtDate(s.sessionDate)}</span></td>
                      <td className="td-secondary">{s.roll||'—'}</td>
                      <td style={{ maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.decision||'—'}</td>
                      <td style={{ maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#555' }}>{s.requests||'—'}</td>
                      <td className="td-secondary">{fmtDate(s.nextSessionDate)}</td>
                      <td><span className={`badge ${s.isEnded?'badge-gray':'badge-green'}`}>{s.isEnded?'✅ منتهية':'⏳ قادمة'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Client Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowEdit(false)}>
          <div className="modal" style={{ maxWidth:'560px' }}>
            <div className="modal-header"><div className="modal-title"><div className="modal-title-icon">✏️</div>تعديل بيانات الموكل</div><button className="modal-close" onClick={()=>setShowEdit(false)}>✕</button></div>
            <div className="modal-body"><div className="form-grid">
              {[{key:'name',label:'الاسم الكامل',ph:'أحمد محمد علي',req:true},{key:'phone',label:'رقم الهاتف',ph:'01xxxxxxxxx',req:true,ltr:true},{key:'caseNumber',label:'رقم القضية',ph:'2024/1234',ltr:true},{key:'address',label:'العنوان',ph:'القاهرة - مدينة نصر',full:true}].map(fi=>(
                <div key={fi.key} className={`form-group${fi.full?' form-full':''}`}>
                  <label className="form-label">{fi.req&&<span className="form-required">*</span>}{fi.label}</label>
                  <input className="form-input" placeholder={fi.ph} dir={fi.ltr?'ltr':'rtl'} value={form[fi.key]||''} onChange={e=>setForm(p=>({...p,[fi.key]:e.target.value}))} />
                </div>
              ))}
            </div></div>
            <div className="modal-footer">
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>{saving?'⏳ جارٍ الحفظ...':'💾 حفظ التعديلات'}</button>
              <button onClick={()=>setShowEdit(false)} className="btn btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showAddCase && <AddCaseModal clientId={id} defaultCaseNumber={client?.caseNumber || ''} onClose={()=>setShowAddCase(false)} onSaved={()=>{ setShowAddCase(false); reload() }} />}
      {showAddSess && <AddSessionModal clientCases={cases} onClose={()=>setShowAddSess(false)} onSaved={()=>{ setShowAddSess(false); reload() }} />}
    </>
  )
}
