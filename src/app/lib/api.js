// ============================================================
// API CLIENT — lawer-api.runasp.net
// All endpoints mapped from swagger-lawer.json
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
// The API sometimes returns a plain array, sometimes { value: [...] }
function toList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.value)) return data.value
  return []
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

// ── Helpers ──────────────────────────────────────────────────
function get(path) {
  return request(path, { method: 'GET' })
}

function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) })
}

function put(path, body) {
  return request(path, { method: 'PUT', body: JSON.stringify(body) })
}

function del(path) {
  return request(path, { method: 'DELETE' })
}

// ════════════════════════════════════════════════════════════
// AUTH  /identity/*
// ════════════════════════════════════════════════════════════

/** POST /identity/token/generate → { accessToken, refreshToken, expiresOnUtc } */
export async function login({ email, password }) {
  const data = await request('/identity/token/generate', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false)
  if (data?.value) {
    saveTokens(data.value)
    // store minimal user info
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
export function getCurrentUser() {
  return get('/identity/current-user')
}

/** DELETE /identity/current-user */
export function deleteCurrentUser() {
  return del('/identity/current-user')
}

/** GET /identity/users */
export function getUsers() {
  return get('/identity/users')
}

/** DELETE /identity/{userId} */
export function deleteUser(userId) {
  return del(`/identity/${userId}`)
}

/** GET /identity/users/deleted */
export function getDeletedUsers() {
  return get('/identity/users/deleted')
}

/** POST /identity/restore-deleted-user */
export function restoreDeletedUser({ email, password }) {
  return post('/identity/restore-deleted-user', { email, password })
}

// ════════════════════════════════════════════════════════════
// CLIENTS  /api/clients
// ════════════════════════════════════════════════════════════

/** GET /api/clients → ClientDto[] */
export async function getClients() {
  const data = await get('/api/clients')
  return toList(data)
}

/** GET /api/clients/{id} */
export async function getClient(id) {
  const data = await get(`/api/clients/${id}`)
  return data?.value
}

/** POST /api/clients — { name, phoneNumber, address, caseNumber } */
export async function createClient(body) {
  const data = await post('/api/clients', body)
  return data?.value
}

/** PUT /api/clients/{id} — { id, name, phoneNumber, address, caseNumber } */
export async function updateClient(id, body) {
  const data = await put(`/api/clients/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/clients/{id} */
export function deleteClient(id) {
  return del(`/api/clients/${id}`)
}

// ════════════════════════════════════════════════════════════
// CASES  /api/cases
// ════════════════════════════════════════════════════════════

/** GET /api/cases → CaseDto[] (now includes attachments[]) */
export async function getCases() {
  const data = await get('/api/cases')
  return toList(data)
}

/** GET /api/cases/{id} */
export async function getCase(id) {
  const data = await get(`/api/cases/${id}`)
  return data?.value
}

/** POST /api/cases — { caseNumber, caseType, clientId, opponentName, caseClassification, caseDegree } */
export async function createCase(body) {
  const data = await post('/api/cases', body)
  return data?.value
}

/** PUT /api/cases/{id} */
export async function updateCase(id, body) {
  const data = await put(`/api/cases/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/cases/{id} */
export function deleteCase(id) {
  return del(`/api/cases/${id}`)
}

// ════════════════════════════════════════════════════════════
// SESSIONS  /api/sessions
// ════════════════════════════════════════════════════════════

/** GET /api/sessions → SessionDto[] */
export async function getSessions() {
  const data = await get('/api/sessions')
  return toList(data)
}

/** GET /api/sessions/{id} */
export async function getSession(id) {
  const data = await get(`/api/sessions/${id}`)
  return data?.value
}

/** POST /api/sessions — { roll, decision, sessionDate, caseId, request, sessionType } */
export async function createSession(body) {
  // Keep date as plain YYYY-MM-DD — server does not accept time component
  const safeBody = { ...body, sessionDate: body.sessionDate?.split('T')[0] }
  const data = await post('/api/sessions', safeBody)
  return data?.value
}

/** PUT /api/sessions/{id} */
export async function updateSession(id, body) {
  const safeBody = { ...body, sessionDate: body.sessionDate?.split('T')[0] }
  const data = await put(`/api/sessions/${id}`, { id, ...safeBody })
  return data?.value
}

/** DELETE /api/sessions/{id} */
export function deleteSession(id) {
  return del(`/api/sessions/${id}`)
}

/**
 * GET /api/sessions/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Returns SessionCalendarDto[] enriched with caseNumber, clientName, opponentName
 */
export async function getSessionsCalendar(startDate, endDate) {
  const data = await get(`/api/sessions/calendar?startDate=${startDate}&endDate=${endDate}`)
  return toList(data)
}

/**
 * POST /api/sessions/today
 * Create a session for today — { roll, decision, caseId, requests, sessionType }
 */
export async function createSessionForToday(body) {
  const data = await post('/api/sessions/today', body)
  return data?.value
}

// ════════════════════════════════════════════════════════════
// FINANCIAL RECORDS  /api/financial-records
// UPDATED SCHEMA: clientId (uuid), caseNumber (string),
//                 agreedAmount, currentAmount, finalTotal
// ════════════════════════════════════════════════════════════

/** GET /api/financial-records → FinancialRecordDto[] */
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
 * Body: { clientId, caseNumber, agreedAmount, currentAmount, finalTotal }
 */
export async function createFinancialRecord(body) {
  const data = await post('/api/financial-records', body)
  return data?.value
}

/**
 * PUT /api/financial-records/{id}
 * Body: { id, clientId, caseNumber, agreedAmount, currentAmount, finalTotal }
 */
export async function updateFinancialRecord(id, body) {
  const data = await put(`/api/financial-records/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/financial-records/{id} */
export function deleteFinancialRecord(id) {
  return del(`/api/financial-records/${id}`)
}

// ════════════════════════════════════════════════════════════
// CASE ATTACHMENTS  /api/cases/{caseId}/attachments
// ════════════════════════════════════════════════════════════

/**
 * POST /api/cases/{caseId}/attachments
 * @param {string} caseId - UUID of the case
 * @param {File}   file   - File object from <input type="file">
 * Returns: { id, caseId, fileName, filePath, fileType }
 */
export async function uploadCaseAttachment(caseId, file) {
  const token = getAccessToken()
  const formData = new FormData()
  formData.append('File', file)

  const res = await fetch(`${BASE_URL}/api/cases/${caseId}/attachments`, {
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

/**
 * POST /api/bailiff-notices
 * Body: { userId, description, place, date }
 */
export async function createBailiffNotice(body) {
  const data = await post('/api/bailiff-notices', body)
  return data?.value
}

/**
 * PUT /api/bailiff-notices/{id}
 * Body: { id, userId, description, place, date }
 */
export async function updateBailiffNotice(id, body) {
  const data = await put(`/api/bailiff-notices/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/bailiff-notices/{id} */
export function deleteBailiffNotice(id) {
  return del(`/api/bailiff-notices/${id}`)
}

/**
 * POST /api/bailiff-notices/{bailiffNoticeId}/attachments
 * @param {string} bailiffNoticeId - UUID
 * @param {File}   file
 */
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

/**
 * POST /api/bailiff-notices/{id}/request-visibility
 * Request visibility for a member — sends a verification code
 * Body: { memberUserId }
 */
export async function requestBailiffVisibility(id, memberUserId) {
  return post(`/api/bailiff-notices/${id}/request-visibility`, { memberUserId })
}

/**
 * POST /api/bailiff-notices/{id}/verify-visibility
 * Verify visibility with code — returns updated BailiffNoticeDto
 * Body: { memberUserId, code }
 */
export async function verifyBailiffVisibility(id, memberUserId, code) {
  const data = await post(`/api/bailiff-notices/${id}/verify-visibility`, { memberUserId, code })
  return data?.value ?? data
}

// ════════════════════════════════════════════════════════════
// DAILY ACCOUNTS  /api/daily-accounts
// Schema: { id, date, amount, userId, fullName }
// ════════════════════════════════════════════════════════════

/** GET /api/daily-accounts → DailyAccountDto[] */
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
 * Body: { date, amount, userId }
 */
export async function createDailyAccount(body) {
  const data = await post('/api/daily-accounts', body)
  return data?.value
}

/**
 * PUT /api/daily-accounts/{id}
 * Body: { id, date, amount, userId }
 */
export async function updateDailyAccount(id, body) {
  const data = await put(`/api/daily-accounts/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/daily-accounts/{id} */
export function deleteDailyAccount(id) {
  return del(`/api/daily-accounts/${id}`)
}

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
export function deleteDailyAttachment(id) {
  return del(`/api/daily-attachments/${id}`)
}

/**
 * POST /api/daily-attachments/{id}/images  (multipart/form-data)
 * @param {string} attachmentId - UUID
 * @param {File}   file
 * Returns: DailyAttachmentImageDto { id, dailyAttachmentId, filePath, fileName, fileType }
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

/**
 * POST /api/notes
 * Body: { date, description }
 */
export async function createNote(body) {
  const data = await post('/api/notes', body)
  return data?.value ?? data
}

/**
 * PUT /api/notes/{id}
 * Body: { id, date, description }
 */
export async function updateNote(id, body) {
  const data = await put(`/api/notes/${id}`, { id, ...body })
  return data?.value ?? data
}

/** DELETE /api/notes/{id} */
export function deleteNote(id) {
  return del(`/api/notes/${id}`)
}

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

/**
 * POST /api/OfficeExpenses
 * Body: { date, amount, description }
 */
export async function createOfficeExpense(body) {
  const data = await post('/api/OfficeExpenses', body)
  return data?.value ?? data
}

/**
 * PUT /api/OfficeExpenses/{id}
 * Body: { id, date, amount, description }
 */
export async function updateOfficeExpense(id, body) {
  const data = await put(`/api/OfficeExpenses/${id}`, { id, ...body })
  return data?.value ?? data
}

/** DELETE /api/OfficeExpenses/{id} */
export function deleteOfficeExpense(id) {
  return del(`/api/OfficeExpenses/${id}`)
}
