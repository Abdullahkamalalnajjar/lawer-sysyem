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

  const data = await res.json()

  if (!res.ok) {
    const msg =
      data?.topError?.description ||
      data?.errors?.[0]?.description ||
      data?.title ||
      `خطأ ${res.status}`
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

/** POST /api/clients — { name, phoneNumber, address } */
export async function createClient(body) {
  const data = await post('/api/clients', body)
  return data?.value
}

/** PUT /api/clients/{id} — { id, name, phoneNumber, address } */
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

/** GET /api/cases → CaseDto[] */
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

/** POST /api/sessions — { roll, decision, sessionDate, caseId, requests, sessionType } */
export async function createSession(body) {
  const data = await post('/api/sessions', body)
  return data?.value
}

/** PUT /api/sessions/{id} */
export async function updateSession(id, body) {
  const data = await put(`/api/sessions/${id}`, { id, ...body })
  return data?.value
}

/** DELETE /api/sessions/{id} */
export function deleteSession(id) {
  return del(`/api/sessions/${id}`)
}

/**
 * GET /api/sessions/calendar?startDate=YYYY-M-D&endDate=YYYY-M-D
 * Returns sessions enriched with caseNumber, clientName, opponentName
 */
export async function getSessionsCalendar(startDate, endDate) {
  const data = await get(`/api/sessions/calendar?startDate=${startDate}&endDate=${endDate}`)
  return toList(data)
}

// ════════════════════════════════════════════════════════════
// FINANCIAL RECORDS  /api/financial-records
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

/** POST /api/financial-records — { date, depositNumber, clientId, caseId } */
export async function createFinancialRecord(body) {
  const data = await post('/api/financial-records', body)
  return data?.value
}

/** PUT /api/financial-records/{id} */
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
// ════════════════════════════════════════════════════════════

export async function getBailiffNotices() {
  const data = await get('/api/bailiff-notices')
  return toList(data)
}

export async function createBailiffNotice(body) {
  const data = await post('/api/bailiff-notices', body)
  return data?.value
}

export async function updateBailiffNotice(id, body) {
  const data = await put(`/api/bailiff-notices/${id}`, { id, ...body })
  return data?.value
}

export function deleteBailiffNotice(id) {
  return del(`/api/bailiff-notices/${id}`)
}

// ════════════════════════════════════════════════════════════
// BAILIFF NOTICE ATTACHMENTS  /api/bailiff-notices/{id}/attachments
// ════════════════════════════════════════════════════════════

/**
 * POST /api/bailiff-notices/{bailiffNoticeId}/attachments
 * @param {string} bailiffNoticeId - UUID
 * @param {File}   file
 * Returns: { id, bailiffNoticeId, fileName, filePath, fileType }
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
