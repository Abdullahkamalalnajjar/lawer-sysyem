'use client'
import { useState, useEffect, useMemo } from 'react'
import { useApp, AuthGuard } from '@/app/components/AppShell'
import {
  getBailiffNotices, createBailiffNotice, updateBailiffNotice, deleteBailiffNotice,
  uploadBailiffNoticeAttachment, getUsers, requestBailiffVisibility, verifyBailiffVisibility, BASE_URL
} from '@/app/lib/api'

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
// MODAL — Create / Edit BailiffNotice
// Schema: { userId?, description?, place?, date }
// ══════════════════════════════════════════════════════════════
function BailiffModal({ item, users, onClose, onSave, saving }) {
  const [form, setForm] = useState(item ? {
    userId:      item.userId      || '',
    description: item.description || '',
    place:       item.place       || '',
    date:        item.date        || '',
    isVisible:   item.isVisible   ?? true,
  } : {
    userId: '', description: '', place: '', date: new Date().toISOString().split('T')[0], isVisible: true,
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.date) errs.date = 'التاريخ مطلوب'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      userId:      form.userId      || null,
      description: form.description || null,
      place:       form.place       || null,
      date:        form.date,
      isVisible:   form.isVisible,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">📜</div>
            {item ? 'تعديل السجل الإداري' : 'إضافة سجل إداري جديد'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">

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

              {/* Date */}
              <div className="form-group">
                <label className="form-label"><span className="form-required">*</span>التاريخ</label>
                <input type="date" className="form-input" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={errors.date ? { borderColor: 'var(--danger)' } : {}} />
                {errors.date && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.date}</span>}
              </div>

              {/* Place */}
              <div className="form-group">
                <label className="form-label">المكان</label>
                <select className="form-select" value={form.place}
                  onChange={e => setForm(p => ({ ...p, place: e.target.value }))}>
                  <option value="">-- اختر المكان --</option>
                  <option value="بنها">بنها</option>
                  <option value="شبين">شبين</option>
                  <option value="مكان خارجي">مكان خارجي</option>
                </select>
              </div>

              {/* Description */}
              <div className="form-group form-full">
                <label className="form-label">البيان / الوصف</label>
                <textarea className="form-input" rows={4}
                  placeholder="تفاصيل المهمة والمعلومات ذات الصلة..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '100px' }} />
              </div>

              {/* isVisible toggle */}
              <div className="form-group form-full">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={form.isVisible}
                    onChange={e => setForm(p => ({ ...p, isVisible: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#0f766e', cursor: 'pointer' }} />
                  مرئي للجميع
                </label>
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
// DRAWER — Details & Attachments
// ══════════════════════════════════════════════════════════════
function BailiffDrawer({ item, isManager, onClose, onEdit, onUploadDone, showToast }) {
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
        boxShadow: '-8px 0 48px rgba(15,118,110,0.18)', zIndex: 201,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #0f5e56 0%, #0f766e 60%, #14b8a6 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>📜</span>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: '600' }}>تفاصيل إنذار المحضر</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>
                  {item.place || 'إنذار محضر'}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <span style={chipStyle}>{item.date}</span>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid rgba(15,118,110,0.10)' }}>
          {[{ id: 'info', label: 'بيانات الإنذار' }, { id: 'atts', label: `المرفقات (${atts.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '13px 8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === t.id ? '800' : '500', color: tab === t.id ? '#0f766e' : '#64748b', borderBottom: tab === t.id ? '2px solid #0f766e' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f7faf9', padding: '16px', borderRadius: '12px', border: '1px solid rgba(15,118,110,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>التاريخ</div>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{item.date || '—'}</div>
              </div>
              <div style={{ background: '#f7faf9', padding: '16px', borderRadius: '12px', border: '1px solid rgba(15,118,110,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>المكان</div>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{item.place || '—'}</div>
              </div>
              {item.description && (
                <div style={{ background: '#fcfcfc', padding: '16px', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '11px', color: '#777', fontWeight: '700', marginBottom: '4px' }}>البيان</div>
                  <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.7' }}>{item.description}</div>
                </div>
              )}
              {isManager && (
                <button onClick={() => onEdit(item)} style={{ ...actionBtnStyle('#f7faf9', '#0f766e'), border: '1px solid rgba(15,118,110,0.2)' }}>
                  ✏️ تعديل البيانات
                </button>
              )}
            </div>
          )}

          {tab === 'atts' && (
            <div>
              {isManager && (
                <label style={{ ...actionBtnStyle('#f7faf9', '#0f766e'), border: '1px dashed #0f766e', marginBottom: '16px', cursor: 'pointer' }}>
                  {isUploading ? '⏳ جاري الرفع...' : '➕ رفع مستند'}
                  <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleUpload} disabled={isUploading} />
                </label>
              )}
              {atts.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>لا توجد مرفقات</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {atts.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fcfcfc', border: '1px solid #eee', padding: '10px 14px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.fileName}</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>{a.fileType}</div>
                      </div>
                      <a href={`${BASE_URL}/${a.filePath}`} target="_blank" rel="noreferrer"
                        style={{ background: '#f4f4f5', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#333', textDecoration: 'none', fontWeight: '600' }}>عرض</a>
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
    <AuthGuard title="شغل إداري">
      <BailiffsContent />
    </AuthGuard>
  )
}

// ── Unlock Modal for Members ──────────────────────────────────
function UnlockModal({ noticeId, userId, onClose, onUnlocked, showToast }) {
  const [step, setStep] = useState('request') // 'request' | 'verify'
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const handleRequest = async () => {
    setBusy(true)
    try {
      await requestBailiffVisibility(noticeId, userId)
      showToast('تم إرسال كود التحقق')
      setStep('verify')
    } catch (e) { showToast(e.message || 'فشل إرسال الكود', 'error') }
    finally { setBusy(false) }
  }

  const handleVerify = async () => {
    if (!code.trim()) return
    setBusy(true)
    try {
      await verifyBailiffVisibility(noticeId, userId, code.trim())
      showToast('تم فتح السجل بنجاح')
      onUnlocked()
    } catch (e) { showToast(e.message || 'كود خاطئ', 'error') }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">🔐</div>
            {step === 'request' ? 'طلب فتح سجل مخفي' : 'إدخال كود التحقق'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {step === 'request' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
                هذا السجل مخفي. اضغط لطلب كود التحقق لفتحه.
              </p>
              <button className="btn btn-primary" onClick={handleRequest} disabled={busy} style={{ width: '100%' }}>
                {busy ? '⏳ جاري الإرسال...' : '📩 طلب كود التحقق'}
              </button>
            </div>
          ) : (
            <div style={{ padding: '20px 0' }}>
              <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '16px' }}>📬</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
                تم إرسال كود التحقق. أدخله هنا:
              </p>
              <input className="form-input" placeholder="أدخل الكود" dir="ltr"
                value={code} onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '6px', fontWeight: '800', marginBottom: '16px' }} />
              <button className="btn btn-primary" onClick={handleVerify} disabled={busy || !code.trim()} style={{ width: '100%' }}>
                {busy ? '⏳ جاري التحقق...' : '✅ تأكيد الكود'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BailiffsContent() {
  const { showToast, user } = useApp()
  const isManager = user?.roles?.includes('Manager')
  const [data, setData]         = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showModal, setModal]   = useState(false)
  const [editingItem, setEdit]  = useState(null)
  const [detailItem, setDetail] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [unlockTarget, setUnlockTarget] = useState(null) // notice id to unlock
  const [unlockedIds, setUnlockedIds]   = useState(new Set()) // locally unlocked

  const load = async () => {
    setLoading(true)
    try {
      const ds = await getBailiffNotices()
      setData(ds)
    } catch (err) { showToast(err.message || 'فشل التحميل', 'error') }
    // Load users separately — may fail for non-Manager
    try {
      const usersRes = await getUsers()
      const list = Array.isArray(usersRes) ? usersRes : (usersRes?.value ?? [])
      setUsers(list)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // userId → email map
  const userMap = Object.fromEntries(users.map(u => [u.userId, u.email]))

  const filtered = useMemo(() => {
    return data.filter(d =>
      !search ||
      d.description?.includes(search) ||
      d.place?.includes(search) ||
      d.date?.includes(search) ||
      (userMap[d.userId] || '').includes(search)
    )
  }, [data, search, userMap])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editingItem?.id) { await updateBailiffNotice(editingItem.id, form); showToast('تم التعديل') }
      else                 { await createBailiffNotice(form); showToast('تم إضافة الإنذار') }
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
      const notices = await getBailiffNotices()
      const updated = notices.find(b => b.id === detailItem?.id)
      if (updated) setDetail(updated)
      setData(notices)
    } catch {}
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-header-breadcrumb">
            <span>الرئيسية</span> <span>›</span> <span className="active">شغل إداري</span>
          </p>
          <h2>شغل إداري</h2>
          <p>متابعة المهام والإجراءات الإدارية ({data.length} سجل)</p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>
            ➕ إضافة سجل إداري
          </button>
        )}
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper" style={{ flex: 2 }}>
            <span className="search-input-icon">🔍</span>
            <input className="search-input" placeholder="ابحث بالبيان أو المكان أو التاريخ..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ fontSize: '36px' }}>⏳</div><p>جاري تحميل الإنذارات...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <h3>لا توجد سجلات إدارية</h3>
            <p>لم يتم تسجيل أي مهام إدارية بعد.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>التاريخ</th>
                  <th>المستخدم</th>
                  <th>المكان</th>
                  <th>البيان</th>
                  {!isManager && <th>الحالة</th>}
                  {isManager && <th>الإجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const isHidden = !isManager && d.isVisible === false && !unlockedIds.has(d.id)
                  return (
                  <tr key={d.id} onClick={() => !isHidden && setDetail(d)}
                    style={{ cursor: isHidden ? 'default' : 'pointer', position: 'relative', background: detailItem?.id === d.id ? 'rgba(15,118,110,0.05)' : undefined, borderRight: detailItem?.id === d.id ? '3px solid #0f766e' : '3px solid transparent' }}>
                    <td className="td-secondary" style={isHidden ? { filter: 'blur(6px)', userSelect: 'none' } : {}}>{i + 1}</td>
                    <td style={{ fontWeight: '700', color: 'var(--gold-bright)', ...(isHidden ? { filter: 'blur(6px)', userSelect: 'none' } : {}) }}>{d.date || '—'}</td>
                    <td className="td-secondary" style={isHidden ? { filter: 'blur(6px)', userSelect: 'none' } : {}}>{userMap[d.userId] || '—'}</td>
                    <td style={{ fontWeight: '600', ...(isHidden ? { filter: 'blur(6px)', userSelect: 'none' } : {}) }}>{d.place || '—'}</td>
                    <td className="td-secondary" style={{ maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...(isHidden ? { filter: 'blur(6px)', userSelect: 'none' } : {}) }}>
                      {d.description || '—'}
                    </td>

                    {!isManager && (
                      <td onClick={e => e.stopPropagation()}>
                        {isHidden ? (
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => setUnlockTarget(d.id)}
                            style={{ fontSize: '11px', padding: '4px 12px', whiteSpace: 'nowrap' }}>
                            🔒 طلب إظهار
                          </button>
                        ) : (
                          <span className="badge badge-gold">✅ مرئي</span>
                        )}
                      </td>
                    )}

                    {isManager && (
                      <td>
                        <div className="td-actions" onClick={e => e.stopPropagation()}>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEdit(d); setModal(true) }}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(d.id)}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <BailiffModal
          item={editingItem}
          users={users}
          onClose={() => { setModal(false); setEdit(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {detailItem && (
        <BailiffDrawer
          item={detailItem}
          isManager={isManager}
          onClose={() => setDetail(null)}
          onEdit={c => { setEdit(c); setModal(true) }}
          onUploadDone={onUploadDone}
          showToast={showToast}
        />
      )}
      {unlockTarget && (
        <UnlockModal
          noticeId={unlockTarget}
          userId={user?.userId}
          onClose={() => setUnlockTarget(null)}
          onUnlocked={() => {
            setUnlockedIds(prev => new Set([...prev, unlockTarget]))
            setUnlockTarget(null)
            load()
          }}
          showToast={showToast}
        />
      )}
    </>
  )
}
