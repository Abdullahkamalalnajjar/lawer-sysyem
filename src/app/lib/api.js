// ============================================================
// API CLIENT — lawer-api.runasp.net
// All endpoints mapped from swagger-lawer.json (updated)
// ============================================================

export const BASE_URL = 'https://lawer-api.runasp.net'

// ── Token helpers ────────────────────────────────────────────
function getTokens() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem('ls_tokens') || '{}')
  } catch { return {} }
}

function saveTokens(data) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ls_tokens', JSON.stringify(data))
}

export function clearTokens() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('ls_tokens')
  localStorage.removeItem('ls_auth')
}

export function getAccessToken() {
  return getTokens().accessToken || null
}

export function getRefreshToken() {
  return getTokens().refreshToken || null
}

// ── Core fetch wrapper ───────────────────────────────────────
async function request(path, options = {}, retry = true) {
  const token = getAccessToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Auto refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      return request(path, options, false)
    } else {
      clearTokens()
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw new Error('غير مصرح — يرجى تسجيل الدخول من جديد')
    }
  }

  // No-content responses
  if (res.status === 204) return { isSuccess: true, value: null }

  // Handle empty body (e.g. 403 with no content)
  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) }
    catch (e) { console.warn('JSON parse failed:', e.message, text?.substring(0, 200)) }
  }

  if (!res.ok) {
    const msg =
      data?.topError?.description ||
      data?.errors?.[0]?.description ||
      data?.title ||
      (res.status === 403 ? 'غير مصرح بالوصول' : `خطأ ${res.status}`)
    throw new Error(msg)
  }

  return data
}

// ── Normalise list responses ──────────────────────────────────
function toList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.value)) return data.value
  return []
}

/**
 * Convert a YYYY-MM-DD string (or partial ISO) to a full ISO 8601 date-time string.
 * The swagger schema specifies format: "date-time" for sessionDate, nextSessionDate, etc.
 * Sending only a date string causes a 400/500 from the backend.
 */
function toDateTime(val) {
  if (!val) return val
  if (val instanceof Date) return val.toISOString()
  const s = String(val)
  // Already a full datetime
  if (s.includes('T')) return s
  // Date-only YYYY-MM-DD → append midnight UTC
  return `${s}T00:00:00Z`
}


async function tryRefreshToken() {
  const { accessToken, refreshToken } = getTokens()
  if (!accessToken || !refreshToken) return false
  try {
    const res = await fetch(`${BASE_URL}/identity/token/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    if (data?.value?.accessToken) {
      saveTokens(data.value)
      return true
    }
    return false
  } catch {
    return false
  }
}

// ── HTTP helpers ─────────────────────────────────────────────
function get(path) { return request(path, { method: 'GET' }) }
function post(path, body) { return request(path, { method: 'POST', body: JSON.stringify(body) }) }
function put(path, body) { return request(path, { method: 'PUT', body: JSON.stringify(body) }) }
function del(path) { return request(path, { method: 'DELETE' }) }

// ════════════════════════════════════════════════════════════
// AUTH  /identity/*
// ════════════════════════════════════════════════════════════

/** POST /identity/token/generate */
export async function login({ email, password }) {
  const data = await request('/identity/token/generate', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false)
  if (data?.value) {
    saveTokens(data.value)
    localStorage.setItem('ls_auth', JSON.stringify({ email }))
  }
  return data
}

/** POST /identity/signup */
export async function signup({ email, password, role, city, phoneNumber }) {
  const data = await request('/identity/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, role, city, phoneNumber }),
  }, false)
  if (data?.value) saveTokens(data.value)
  return data
}

/** GET /identity/current-user */
export function getCurrentUser() { return get('/identity/current-user') }

/** DELETE /identity/current-user */
export function deleteCurrentUser() { return del('/identity/current-user') }

/** GET /identity/users */
export function getUsers() { return get('/identity/users') }

/** DELETE /identity/{userId} */
export function deleteUser(userId) { return del(`/identity/${userId}`) }

/** GET /identity/users/deleted */
export function getDeletedUsers() { return get('/identity/users/deleted') }

/** POST /identity/restore-deleted-user */
export function restoreDeletedUser({ email, password }) {
  return post('/identity/restore-deleted-user', { email, password })
}

// ════════════════════════════════════════════════════════════
// CLIENTS  /api/clients
// Schema: { id, name, caseNumber, phone, address }
// CHANGE: phoneNumber → phone
// ════════════════════════════════════════════════════════════

/** GET /api/clients → ClientResponse[] */
export async function getClients() {
  const data = await get('/api/clients')
  return toList(data)
}

/** GET /api/clients/{id} */
export async function getClient(id) {
  const data = await get(`/api/clients/${id}`)
  return data?.value
}

/**
 * POST /api/clients
 * Body: { name, phone, address, caseNumber }
 * NOTE: UI may still send phoneNumber — we normalise it here
 */
export async function createClient(body) {
  const { phoneNumber, ...rest } = body
  const payload = { ...rest }
  if (phoneNumber !== undefined && payload.phone === undefined) payload.phone = phoneNumber
  const data = await post('/api/clients', payload)
  return data?.value
}

/**
 * PUT /api/clients/{id}
 * Body: { id, name, phone, address, caseNumber }
 */
export async function updateClient(id, body) {
  const { phoneNumber, ...rest } = body
  const payload = { id, ...rest }
  if (phoneNumber !== undefined && payload.phone === undefined) payload.phone = phoneNumber
  const data = await put(`/api/clients/${id}`, payload)
  return data?.value
}

/** DELETE /api/clients/{id} */
export function deleteClient(id) { return del(`/api/clients/${id}`) }

/** GET /api/cases/client/{clientId} → cases for a specific client */
export async function getClientCases(clientId) {
  const data = await get(`/api/cases/client/${clientId}`)
  return toList(data)
}

/** GET /api/sessions/client/{clientId} → sessions for a specific client */
export async function getClientSessions(clientId) {
  const data = await get(`/api/sessions/client/${clientId}`)
  return toList(data)
}

// ════════════════════════════════════════════════════════════
// CASES  /api/cases
// Schema: { id, caseNumber, caseType, clientId, opponent, degree }
// CHANGES: opponentName → opponent, caseDegree → degree, caseClassification removed
// ════════════════════════════════════════════════════════════

/** GET /api/cases → CaseResponse[] */
export async function getCases() {
  const data = await get('/api/cases')
  return toList(data)
}

/** GET /api/cases/{id} */
export async function getCase(id) {
  const data = await get(`/api/cases/${id}`)
  return data?.value
}

/**
 * POST /api/cases
 * Body: { caseNumber, caseType, clientId, opponent, degree }
 */
export async function createCase(body) {
  // Normalise legacy UI field names → new API field names
  const { opponentName, caseDegree, caseClassification, ...rest } = body
  const payload = { ...rest }
  if (opponentName !== undefined && payload.opponent === undefined) payload.opponent = opponentName
  if (caseDegree   !== undefined && payload.degree   === undefined) payload.degree   = caseDegree
  const data = await post('/api/cases', payload)
  return data?.value
}

/**
 * PUT /api/cases/{id}
 * Body: { id, caseNumber, caseType, clientId, opponent, degree }
 */
export async function updateCase(id, body) {
  const { opponentName, caseDegree, caseClassification, ...rest } = body
  const payload = { id, ...rest }
  if (opponentName !== undefined && payload.opponent === undefined) payload.opponent = opponentName
  if (caseDegree   !== undefined && payload.degree   === undefined) payload.degree   = caseDegree
  const data = await put(`/api/cases/${id}`, payload)
  return data?.value
}

/** DELETE /api/cases/{id} */
export function deleteCase(id) { return del(`/api/cases/${id}`) }

/**
 * POST /api/cases/{id}/images  (multipart/form-data)
 * Returns: { id, fileName, contentType, url }
 */
export async function uploadCaseImage(caseId, file) {
  const token = getAccessToken()
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/api/cases/${caseId}/images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    let msg = `خطأ ${res.status}`
    try { const err = await res.json(); msg = err?.topError?.description || err?.errors?.[0]?.description || msg } catch {}
    throw new Error(msg)
  }
  const data = await res.json()
  return data?.value ?? data
}

// ════════════════════════════════════════════════════════════
// SESSIONS  /api/sessions
// Schema: { id, caseId, decision, sessionDate, nextSessionDate, isEnded, roll, requests }
// Calendar schema: { id, caseId, title, start, end, isEnded, reminderSent }
// ════════════════════════════════════════════════════════════

/** GET /api/sessions → SessionResponse[] */
export async function getSessions() {
  const data = await get('/api/sessions')
  return toList(data)
}

/**
 * GET /api/sessions/calendar?from=YYYY-M-D&to=YYYY-M-D
 * Returns: CalendarSessionDto[] { id, caseId, title, start, end, isEnded, reminderSent }
 */
export async function getSessionsCalendar(from, to) {
  const data = await get(`/api/sessions/calendar?from=${from}&to=${to}`)
  return toList(data)
}

/** GET /api/sessions/{id} */
export async function getSession(id) {
  const data = await get(`/api/sessions/${id}`)
  return data?.value
}

/**
  * POST /api/sessions
  * Body: { caseId, decision, sessionDate, nextSessionDate?, isEnded, reminderSent, roll, requests }
  */
export async function createSession(body) {
  const { request, sessionType, ...rest } = body
  const safeBody = { ...rest }
  if (safeBody.sessionDate)     safeBody.sessionDate     = toDateTime(safeBody.sessionDate)
  if (safeBody.nextSessionDate) safeBody.nextSessionDate = toDateTime(safeBody.nextSessionDate)
  else                          safeBody.nextSessionDate = null
  if (request !== undefined && safeBody.requests === undefined) safeBody.requests = request
  const data = await post('/api/sessions', safeBody)
  return data?.value
}

/**
 * PUT /api/sessions/{id}
 * Body: { id, caseId, decision, sessionDate, nextSessionDate?, roll, requests }
 */
export async function updateSession(id, body) {
  const { request, sessionType, ...rest } = body
  const safeBody = { id, ...rest }
  if (safeBody.sessionDate)     safeBody.sessionDate     = toDateTime(safeBody.sessionDate)
  if (safeBody.nextSessionDate) safeBody.nextSessionDate = toDateTime(safeBody.nextSessionDate)
  else                          safeBody.nextSessionDate = null
  if (request !== undefined && safeBody.requests === undefined) safeBody.requests = request
  const data = await put(`/api/sessions/${id}`, safeBody)
  return data?.value
}

/** DELETE /api/sessions/{id} */
export function deleteSession(id) { return del(`/api/sessions/${id}`) }

// ════════════════════════════════════════════════════════════
// FINANCIAL RECORDS  /api/financial-records
// NEW SCHEMA: { id, clientId, date, agreedAmount, paidAmount }
// REMOVED: caseNumber, currentAmount, finalTotal
// ADDED: date, paidAmount
// ════════════════════════════════════════════════════════════

/** GET /api/financial-records → FinancialRecordResponse[] */
export async function getFinancialRecords() {
  const data = await get('/api/financial-records')
  return toList(data)
}

/** GET /api/financial-records/{id} */
export async function getFinancialRecord(id) {
  const data = await get(`/api/financial-records/${id}`)
  return data?.value
}

/**
 * POST /api/financial-records
 * Body: { clientId, date, agreedAmount, paidAmount }
 */
export async function createFinancialRecord(body) {
  const payload = { ...body }
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await post('/api/financial-records', payload)
  return data?.value
}

/**
 * PUT /api/financial-records/{id}
 * Body: { id, clientId, date, agreedAmount, paidAmount }
 */
export async function updateFinancialRecord(id, body) {
  const payload = { id, ...body }
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await put(`/api/financial-records/${id}`, payload)
  return data?.value
}

/** DELETE /api/financial-records/{id} */
export function deleteFinancialRecord(id) { return del(`/api/financial-records/${id}`) }

/**
 * GET /api/financial-records/clients/{clientId}/summary  ← NEW
 * Returns: { clientId, totalPaidAmount }
 */
export async function getClientFinancialSummary(clientId) {
  const data = await get(`/api/financial-records/clients/${clientId}/summary`)
  return data?.value
}

// ════════════════════════════════════════════════════════════
// ADMINISTRATIVE WORKS  /api/administrative-works  ← NEW
// Schema: { id, date, appUserId, isForAllUsers, sessionId, place, statement, isVisible }
// ════════════════════════════════════════════════════════════

/** GET /api/administrative-works → AdministrativeWorkResponse[] */
export async function getAdministrativeWorks() {
  const data = await get('/api/administrative-works')
  return toList(data)
}

/** GET /api/administrative-works/{id} */
export async function getAdministrativeWork(id) {
  const data = await get(`/api/administrative-works/${id}`)
  return data?.value
}

/**
 * POST /api/administrative-works
 * Body: { date, appUserId?, isForAllUsers, place?, statement? }
 */
export async function createAdministrativeWork(body) {
  const payload = { ...body }
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await post('/api/administrative-works', payload)
  return data?.value
}

/**
 * PUT /api/administrative-works/{id}
 * Body: { id, date, appUserId?, isForAllUsers, place?, statement?, isVisible }
 */
export async function updateAdministrativeWork(id, body) {
  const payload = { id, ...body }
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await put(`/api/administrative-works/${id}`, payload)
  return data?.value
}

/** DELETE /api/administrative-works/{id} */
export function deleteAdministrativeWork(id) { return del(`/api/administrative-works/${id}`) }

/**
 * GET /api/administrative-works/users/{userId}
 * Returns administrative works visible to a specific user (used by Member role)
 */
export async function getAdministrativeWorksByUser(userId) {
  const data = await get(`/api/administrative-works/users/${userId}`)
  return toList(data)
}

// ════════════════════════════════════════════════════════════
// DAILY ACCOUNTS  /api/daily-accounts
// Schema: { id, date, amount, appUserId }
// CHANGE: userId → appUserId, fullName removed
// ════════════════════════════════════════════════════════════

/** GET /api/daily-accounts → DailyAccountResponse[] */
export async function getDailyAccounts() {
  const data = await get('/api/daily-accounts')
  return toList(data)
}

/** GET /api/daily-accounts/{id} */
export async function getDailyAccount(id) {
  const data = await get(`/api/daily-accounts/${id}`)
  return data?.value
}

/**
 * POST /api/daily-accounts
 * Body: { date, amount, appUserId }
 */
export async function createDailyAccount(body) {
  const { userId, ...rest } = body
  const payload = { ...rest }
  if (userId !== undefined && payload.appUserId === undefined) payload.appUserId = userId
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await post('/api/daily-accounts', payload)
  return data?.value
}

/**
 * PUT /api/daily-accounts/{id}
 * Body: { id, date, amount, appUserId }
 */
export async function updateDailyAccount(id, body) {
  const { userId, ...rest } = body
  const payload = { id, ...rest }
  if (userId !== undefined && payload.appUserId === undefined) payload.appUserId = userId
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await put(`/api/daily-accounts/${id}`, payload)
  return data?.value
}

/** DELETE /api/daily-accounts/{id} */
export function deleteDailyAccount(id) { return del(`/api/daily-accounts/${id}`) }

/** GET /api/daily-accounts/user/{userId} → accounts for a specific member */
export async function getDailyAccountsByUser(userId) {
  const data = await get(`/api/daily-accounts/user/${userId}`)
  return toList(data)
}

// ════════════════════════════════════════════════════════════
// DAILY EXPENSES  /api/daily-expenses  ← NEW
// Schema: { id, date, amount, description }
// ════════════════════════════════════════════════════════════

/** GET /api/daily-expenses → DailyExpenseResponse[] */
export async function getDailyExpenses() {
  const data = await get('/api/daily-expenses')
  return toList(data)
}

/** GET /api/daily-expenses/{id} */
export async function getDailyExpense(id) {
  const data = await get(`/api/daily-expenses/${id}`)
  return data?.value
}

/**
 * POST /api/daily-expenses
 * Body: { date, amount, description? }
 */
export async function createDailyExpense(body) {
  const payload = { ...body }
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await post('/api/daily-expenses', payload)
  return data?.value
}

/**
 * PUT /api/daily-expenses/{id}
 * Body: { id, date, amount, description? }
 */
export async function updateDailyExpense(id, body) {
  const payload = { id, ...body }
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await put(`/api/daily-expenses/${id}`, payload)
  return data?.value
}

/** DELETE /api/daily-expenses/{id} */
export function deleteDailyExpense(id) { return del(`/api/daily-expenses/${id}`) }

// ════════════════════════════════════════════════════════════
// DAILY NOTES  /api/daily-notes  ← NEW
// Schema: { id, date, noteText }
// ════════════════════════════════════════════════════════════

/** GET /api/daily-notes → DailyNoteResponse[] */
export async function getDailyNotes() {
  const data = await get('/api/daily-notes')
  return toList(data)
}

/** GET /api/daily-notes/{id} */
export async function getDailyNote(id) {
  const data = await get(`/api/daily-notes/${id}`)
  return data?.value
}

/**
 * POST /api/daily-notes
 * Body: { date, noteText }
 */
export async function createDailyNote(body) {
  const payload = { ...body }
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await post('/api/daily-notes', payload)
  return data?.value
}

/**
 * PUT /api/daily-notes/{id}
 * Body: { id, date, noteText }
 */
export async function updateDailyNote(id, body) {
  const payload = { id, ...body }
  if (payload.date) payload.date = toDateTime(payload.date)
  const data = await put(`/api/daily-notes/${id}`, payload)
  return data?.value
}

/** DELETE /api/daily-notes/{id} */
export function deleteDailyNote(id) { return del(`/api/daily-notes/${id}`) }

// ════════════════════════════════════════════════════════════
// DAILY ATTACHMENTS  /api/daily-attachments
// Schema: { id, date, clientName, caseNumber, images[] }
// ════════════════════════════════════════════════════════════

/** GET /api/daily-attachments → DailyAttachmentDto[] */
export async function getDailyAttachments() {
  const data = await get('/api/daily-attachments')
  return toList(data)
}

/** GET /api/daily-attachments/{id} */
export async function getDailyAttachment(id) {
  const data = await get(`/api/daily-attachments/${id}`)
  return data?.value
}

/**
 * POST /api/daily-attachments
 * Body: { date, clientName, caseNumber }
 */
export async function createDailyAttachment(body) {
  const data = await post('/api/daily-attachments', body)
  return data?.value
}

/**
 * PUT /api/daily-attachments/{id}
 * Body: { id, date, clientName, caseNumber }
 */
export async function updateDailyAttachment(id, body) {
  const data = await put(`/api/daily-attachments/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/daily-attachments/{id} */
export function deleteDailyAttachment(id) { return del(`/api/daily-attachments/${id}`) }

/**
 * POST /api/daily-attachments/{id}/images  (multipart/form-data)
 */
export async function uploadDailyAttachmentImage(attachmentId, file) {
  const token = getAccessToken()
  const formData = new FormData()
  formData.append('File', file)

  const res = await fetch(`${BASE_URL}/api/daily-attachments/${attachmentId}/images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!res.ok) {
    let msg = `خطأ ${res.status}`
    try {
      const err = await res.json()
      msg = err?.topError?.description || err?.errors?.[0]?.description || msg
    } catch {}
    throw new Error(msg)
  }

  const data = await res.json()
  return data?.value ?? data
}

// ════════════════════════════════════════════════════════════
// NOTES  /api/notes
// Schema: { id, date, description }
// ════════════════════════════════════════════════════════════

/** GET /api/notes → NoteDto[] */
export async function getNotes() {
  const data = await get('/api/notes')
  return Array.isArray(data) ? data : toList(data)
}

/** GET /api/notes/{id} */
export async function getNote(id) {
  const data = await get(`/api/notes/${id}`)
  return data?.value ?? data
}

/** POST /api/notes — Body: { date, description } */
export async function createNote(body) {
  const data = await post('/api/notes', body)
  return data?.value ?? data
}

/** PUT /api/notes/{id} — Body: { id, date, description } */
export async function updateNote(id, body) {
  const data = await put(`/api/notes/${id}`, { id, ...body })
  return data?.value ?? data
}

/** DELETE /api/notes/{id} */
export function deleteNote(id) { return del(`/api/notes/${id}`) }

// ════════════════════════════════════════════════════════════
// OFFICE EXPENSES  /api/OfficeExpenses
// Schema: { id, date, amount, description }
// ════════════════════════════════════════════════════════════

/** GET /api/OfficeExpenses → OfficeExpenseDto[] */
export async function getOfficeExpenses() {
  const data = await get('/api/OfficeExpenses')
  return Array.isArray(data) ? data : toList(data)
}

/** GET /api/OfficeExpenses/{id} */
export async function getOfficeExpense(id) {
  const data = await get(`/api/OfficeExpenses/${id}`)
  return data?.value ?? data
}

/** POST /api/OfficeExpenses — Body: { date, amount, description } */
export async function createOfficeExpense(body) {
  const data = await post('/api/OfficeExpenses', body)
  return data?.value ?? data
}

/** PUT /api/OfficeExpenses/{id} — Body: { id, date, amount, description } */
export async function updateOfficeExpense(id, body) {
  const data = await put(`/api/OfficeExpenses/${id}`, { id, ...body })
  return data?.value ?? data
}

/** DELETE /api/OfficeExpenses/{id} */
export function deleteOfficeExpense(id) { return del(`/api/OfficeExpenses/${id}`) }

// ════════════════════════════════════════════════════════════
// BAILIFF NOTICES  /api/bailiff-notices
// Schema: { id, userId, description, place, date, attachments[] }
// ════════════════════════════════════════════════════════════

/** GET /api/bailiff-notices → BailiffNoticeDto[] */
export async function getBailiffNotices() {
  const data = await get('/api/bailiff-notices')
  return toList(data)
}

/** GET /api/bailiff-notices/{id} */
export async function getBailiffNotice(id) {
  const data = await get(`/api/bailiff-notices/${id}`)
  return data?.value
}

/** POST /api/bailiff-notices — Body: { userId, description, place, date } */
export async function createBailiffNotice(body) {
  const data = await post('/api/bailiff-notices', body)
  return data?.value
}

/** PUT /api/bailiff-notices/{id} — Body: { id, userId, description, place, date } */
export async function updateBailiffNotice(id, body) {
  const data = await put(`/api/bailiff-notices/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/bailiff-notices/{id} */
export function deleteBailiffNotice(id) { return del(`/api/bailiff-notices/${id}`) }

/** POST /api/bailiff-notices/{bailiffNoticeId}/attachments */
export async function uploadBailiffNoticeAttachment(bailiffNoticeId, file) {
  const token = getAccessToken()
  const formData = new FormData()
  formData.append('File', file)

  const res = await fetch(`${BASE_URL}/api/bailiff-notices/${bailiffNoticeId}/attachments`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!res.ok) {
    let msg = `خطأ ${res.status}`
    try {
      const err = await res.json()
      msg = err?.topError?.description || err?.errors?.[0]?.description || msg
    } catch {}
    throw new Error(msg)
  }

  const data = await res.json()
  return data?.value ?? data
}

/** POST /api/bailiff-notices/{id}/request-visibility — Body: { memberUserId } */
export async function requestBailiffVisibility(id, memberUserId) {
  return post(`/api/bailiff-notices/${id}/request-visibility`, { memberUserId })
}

/** POST /api/bailiff-notices/{id}/verify-visibility — Body: { memberUserId, code } */
export async function verifyBailiffVisibility(id, memberUserId, code) {
  const data = await post(`/api/bailiff-notices/${id}/verify-visibility`, { memberUserId, code })
  return data?.value ?? data
}

// ════════════════════════════════════════════════════════════
// QAWADY  /api/qawady
// Schema: { id, name, images[] }
// ════════════════════════════════════════════════════════════

/** GET /api/qawady → QawadyResponse[] */
export async function getQawady() {
  const data = await get('/api/qawady')
  return toList(data)
}

/** GET /api/qawady/{id} */
export async function getQawadyById(id) {
  const data = await get(`/api/qawady/${id}`)
  return data?.value
}

/** POST /api/qawady — Body: { name } */
export async function createQawady(body) {
  const data = await post('/api/qawady', body)
  return data?.value
}

/** PUT /api/qawady/{id} — Body: { id, name } */
export async function updateQawady(id, body) {
  const data = await put(`/api/qawady/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/qawady/{id} */
export function deleteQawady(id) { return del(`/api/qawady/${id}`) }

/** POST /api/qawady/{id}/images — multipart/form-data */
export async function uploadQawadyImage(qawadyId, file) {
  const token = getAccessToken()
  const form  = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/api/qawady/${qawadyId}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.errors?.[0]?.message || `Upload failed: ${res.status}`)
  }
  const data = await res.json()
  return data?.value
}

// ════════════════════════════════════════════════════════════
// PAYMENTS  /api/financial-records/{id}/payments
// Schema: { id, date, amount }
// ════════════════════════════════════════════════════════════

/** POST /api/financial-records/{id}/payments — Body: { id, date, amount } */
export async function createPayment(financialRecordId, body) {
  const payload = {
    id:     financialRecordId,
    date:   body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
    amount: Number(body.amount),
  }
  const data = await post(`/api/financial-records/${financialRecordId}/payments`, payload)
  return data?.value
}
