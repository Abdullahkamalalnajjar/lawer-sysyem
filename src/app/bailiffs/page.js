'use client'
import { useState, useEffect, useMemo } from 'react'
import { useApp, AuthGuard } from '@/app/components/AppShell'
import {
  getBailiffNotices, createBailiffNotice, updateBailiffNotice, deleteBailiffNotice,
  uploadBailiffNoticeAttachment,
  getCases, getClients, BASE_URL
} from '@/app/lib/api'

// shared styling
const chipStyle = {
  padding: '3px 10px', borderRadius: '99px',
  background: 'rgba(255,255,255,0.20)',
  border: '1px solid rgba(255,255,255,0.30)',
  color: '#fff', fontSize: '11px', fontWeight: '700',
}
const closeBtnStyle = {
  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: '8px', color: '#fff', width: '32px', height: '32px',
  cursor: 'pointer', fontSize: '14px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
const actionBtnStyle = (bg, color) => ({
  background: bg, color, border: 'none',
  borderRadius: '10px', padding: '10px 18px',
  fontWeight: '700', fontSize: '13.5px', cursor: 'pointer',
  fontFamily: "'Cairo', sans-serif", transition: 'all 0.18s',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
})

// ══════════════════════════════════════════════════════════════
// BAILIFF MODAL
// ══════════════════════════════════════════════════════════════
function BailiffModal({ item, cases, clients, onClose, onSave, saving }) {
  const [form, setForm] = useState(item ? {
    clientId: item.clientId || '',
    caseId: item.caseId || '',
    noticeType: item.noticeType || '',
    deliveryDate: item.deliveryDate ? item.deliveryDate.split('T')[0] : '',
    opponentName: item.opponentName || ''
  } : {
    clientId: '', caseId: '', noticeType: 'إنذار رسمي', deliveryDate: '', opponentName: ''
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.clientId) errs.clientId = 'اختر الموكل'
    if (!form.caseId) errs.caseId = 'اختر القضية'
    if (!form.noticeType.trim()) errs.noticeType = 'نوع الإنذار مطلوب'
    if (!form.deliveryDate) errs.deliveryDate = 'تاريخ التسليم مطلوب'
    if (!form.opponentName.trim()) errs.opponentName = 'اسم الخصم/المنذر إليه مطلوب'
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
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-title"><div className="modal-title-icon">📜</div>{item ? 'تعديل إنذار المحضر' : 'إضافة إنذار محضر جديد'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              
              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span> الموكل</label>
                <select className="form-select" value={form.clientId}
                  onChange={e => setForm({ ...form, clientId: e.target.value })}
                  style={errors.clientId ? { borderColor: 'var(--danger)' } : {}}>
                  <option value="">اختر الموكل</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.clientId && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.clientId}</span>}
              </div>

              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span> القضية المرتبطة</label>
                <select className="form-select" value={form.caseId}
                  onChange={e => setForm({ ...form, caseId: e.target.value })}
                  style={errors.caseId ? { borderColor: 'var(--danger)' } : {}}>
                  <option value="">اختر القضية</option>
                  {cases.filter(c => !form.clientId || c.clientId === form.clientId).map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.caseType}</option>)}
                </select>
                {errors.caseId && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.caseId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span> نوع الإنذار</label>
                <input className="form-input" value={form.noticeType} placeholder="مثال: إنذار عرض، إعلان دعوى..."
                  onChange={e => setForm({ ...form, noticeType: e.target.value })}
                  style={errors.noticeType ? { borderColor: 'var(--danger)' } : {}} />
                {errors.noticeType && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.noticeType}</span>}
              </div>

              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span> تاريخ الإعلان / التسليم</label>
                <input type="date" className="form-input" value={form.deliveryDate}
                  onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                  style={errors.deliveryDate ? { borderColor: 'var(--danger)' } : {}} />
                {errors.deliveryDate && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.deliveryDate}</span>}
              </div>

              <div className="form-group form-full">
                <label className="form-label"><span className="form-required">*</span> اسم الخصم / المُعلن إليه</label>
                <input className="form-input" value={form.opponentName} placeholder="اسم المطلوب إعلانه"
                  onChange={e => setForm({ ...form, opponentName: e.target.value })}
                  style={errors.opponentName ? { borderColor: 'var(--danger)' } : {}} />
                {errors.opponentName && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.opponentName}</span>}
              </div>

            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'جاري الحفظ...' : item ? 'حفظ التعديلات' : 'إضافة الإنذار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// BAILIFF DRAWER (Details & Attachments)
// ══════════════════════════════════════════════════════════════
function BailiffDrawer({ item, clientName, caseNum, onClose, onEdit, onUploadDone, showToast }) {
  const [tab, setTab] = useState('info')
  const [isUploading, setIsUp] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUp(true)
    try {
      await uploadBailiffNoticeAttachment(item.id, file)
      showToast('تم رفع المرفق بنجاح')
      onUploadDone()
    } catch (err) {
      showToast(err.message || 'فشل رفع الملف', 'error')
    } finally {
      setIsUp(false)
      e.target.value = ''
    }
  }

  const atts = item.attachments || []

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '430px', background: '#fff',
        boxShadow: '-8px 0 48px rgba(192,57,43,0.18)', zIndex: 201,
        display: 'flex', flexDirection: 'column', animation: 'slideInLeft 0.28s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #8b1a1a 0%, #c0392b 60%, #dc2626 100%)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>📜</span>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: '600' }}>تفاصيل إنذار المحضر</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{item.noticeType}</div>
              </div>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <span style={chipStyle}>{item.deliveryDate?.split('T')[0]}</span>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '2px solid rgba(192,57,43,0.10)' }}>
          {[ { id: 'info', label: 'معلومات الإنذار' }, { id: 'atts', label: `المرفقات (${atts.length})` } ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '13px 8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === t.id ? '800' : '500', color: tab === t.id ? '#c0392b' : '#9b7070', borderBottom: tab === t.id ? '2px solid #c0392b' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fcf9f9', padding: '16px', borderRadius: '12px', border: '1px solid rgba(192,57,43,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#9b7070', fontWeight: '700' }}>المُعلن إليه / الخصم</div>
                <div style={{ fontSize: '15px', color: '#1a0a0a', fontWeight: '700' }}>{item.opponentName}</div>
              </div>
              <div style={{ background: '#fcfcfc', padding: '16px', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ fontSize: '11px', color: '#777', fontWeight: '700' }}>الموكل</div>
                <div style={{ fontSize: '14px', color: '#333', fontWeight: '700' }}>{clientName || '—'}</div>
                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <div style={{ fontSize: '11px', color: '#777', fontWeight: '700' }}>القضية المرتبطة</div>
                <div style={{ fontSize: '14px', color: '#333', fontWeight: '700' }}>{caseNum || '—'}</div>
              </div>
              
              <button onClick={() => onEdit(item)} style={{ ...actionBtnStyle('#fcf9f9', '#c0392b'), border: '1px solid rgba(192,57,43,0.2)', marginTop: 'auto' }}>✏️ تعديل البيانات</button>
            </div>
          )}

          {tab === 'atts' && (
            <div>
              <label style={{ ...actionBtnStyle('#fcf9f9', '#c0392b'), border: '1px dashed #c0392b', marginBottom: '16px' }}>
                {isUploading ? '⏳ جاري الرفع...' : '➕ رفع مستند لإنذار المحضر'}
                <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleUpload} disabled={isUploading} />
              </label>

              {atts.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9b7070', padding: '40px 0' }}>لا توجد مرفقات</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {atts.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fcfcfc', border: '1px solid #eee', padding: '10px 14px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.fileName}</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>{a.fileType}</div>
                      </div>
                      <a href={`${BASE_URL}/${a.filePath}`} target="_blank" rel="noreferrer" style={{ background: '#f4f4f5', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#333', textDecoration: 'none', fontWeight: '600' }}>عرض</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════
export default function BailiffsPage() {
  return (
    <AuthGuard title="إنذارات المحضرين">
      <BailiffsContent />
    </AuthGuard>
  )
}

function BailiffsContent() {
  const { showToast } = useApp()
  const [data, setData] = useState([])
  const [clients, setClients] = useState([])
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setModal] = useState(false)
  const [editingItem, setEdit] = useState(null)
  const [detailItem, setDetail] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [ds, cls, css] = await Promise.all([ getBailiffNotices(), getClients(), getCases() ])
      setData(ds)
      setClients(cls)
      setCases(css)
    } catch (err) { showToast(err.message || 'فشل التحميل', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c.name])), [clients])
  const caseMap = useMemo(() => Object.fromEntries(cases.map(c => [c.id, c.caseNumber])), [cases])

  const filtered = useMemo(() => {
    return data.filter(d => 
      !search || 
      d.noticeType?.includes(search) || 
      d.opponentName?.includes(search) ||
      clientMap[d.clientId]?.includes(search)
    )
  }, [data, search, clientMap])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editingItem?.id) { await updateBailiffNotice(editingItem.id, form); showToast('تم التعديل') }
      else                 { await createBailiffNotice(form); showToast('تم الإضافة') }
      setModal(false); setEdit(null)
      await load()
    } catch(e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('تأكيد حذف إنذار المحضر؟')) return
    try {
      await deleteBailiffNotice(id)
      showToast('تم الحذف', 'error')
      if (detailItem?.id === id) setDetail(null)
      await load()
    } catch(e) { showToast(e.message, 'error') }
  }

  const onUploadDone = async () => {
    try {
      const notice = (await getBailiffNotices()).find(b => b.id === detailItem.id)
      if (notice) setDetail(notice)
      await load()
    } catch {}
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span>الرئيسية</span> <span>›</span> <span className="active">قسم المحضرين</span>
          </p>
          <h2>إنذارات المحضرين</h2>
          <p>متابعة إعلانات وإنذارات المحكمة ({data.length} إنذار)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>
          ➕ تسجيل إنذار محضر
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper" style={{ flex: 2 }}>
            <span className="search-input-icon">🔍</span>
            <input className="search-input" placeholder="ابحث باسم الموكل، الخصم المُنذر، أو نوع الإعلان..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
           <div className="empty-state"><div style={{fontSize:'36px'}}>⏳</div><p>جاري تحميل الإنذارات...</p></div>
        ) : filtered.length === 0 ? (
           <div className="empty-state"><div className="empty-state-icon">📜</div><h3>لا توجد إنذارات</h3><p>لم يتم العثور على أي معلومات مسجلة بقسم المحضرين.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>نوع الإنذار / الإعلان</th>
                  <th>تاريخ الإعلان</th>
                  <th>اسم الموكل</th>
                  <th>رقم القضية</th>
                  <th>المُعلن إليه / الخصم</th>
                  <th>المرفقات</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id} onClick={() => setDetail(d)} style={{ cursor: 'pointer', background: detailItem?.id === d.id ? 'rgba(192,57,43,0.05)' : undefined, borderRight: detailItem?.id === d.id ? '3px solid #c0392b' : '3px solid transparent' }}>
                    <td className="td-secondary">{i + 1}</td>
                    <td><span style={{ fontWeight: '800', color: '#c0392b', fontSize: '13.5px' }}>{d.noticeType}</span></td>
                    <td className="td-secondary">{d.deliveryDate?.split('T')[0] || '—'}</td>
                    <td style={{ fontWeight: '600' }}>{clientMap[d.clientId] || '—'}</td>
                    <td><span className="badge badge-gray">{caseMap[d.caseId] || '—'}</span></td>
                    <td className="td-secondary">{d.opponentName}</td>
                    <td><span className="badge badge-gold">{d.attachments?.length || 0} مرفق</span></td>
                    <td>
                       <div className="td-actions" onClick={e => e.stopPropagation()}>
                         <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEdit(d); setModal(true) }}>✏️</button>
                         <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(d.id)}>🗑️</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <BailiffModal item={editingItem} cases={cases} clients={clients} onClose={() => { setModal(false); setEdit(null) }} onSave={handleSave} saving={saving} />}
      {detailItem && <BailiffDrawer item={detailItem} clientName={clientMap[detailItem.clientId]} caseNum={caseMap[detailItem.caseId]} onClose={() => setDetail(null)} onEdit={c => { setEdit(c); setModal(true) }} onUploadDone={onUploadDone} showToast={showToast} />}
    </>
  )
}
