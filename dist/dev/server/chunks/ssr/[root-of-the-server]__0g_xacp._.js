module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/lib/api.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================
// API CLIENT — lawer-api.runasp.net
// All endpoints mapped from swagger-lawer.json
// ============================================================
__turbopack_context__.s([
    "BASE_URL",
    ()=>BASE_URL,
    "clearTokens",
    ()=>clearTokens,
    "createBailiffNotice",
    ()=>createBailiffNotice,
    "createCase",
    ()=>createCase,
    "createClient",
    ()=>createClient,
    "createDailyAccount",
    ()=>createDailyAccount,
    "createDailyAttachment",
    ()=>createDailyAttachment,
    "createFinancialRecord",
    ()=>createFinancialRecord,
    "createNote",
    ()=>createNote,
    "createOfficeExpense",
    ()=>createOfficeExpense,
    "createSession",
    ()=>createSession,
    "createSessionForToday",
    ()=>createSessionForToday,
    "deleteBailiffNotice",
    ()=>deleteBailiffNotice,
    "deleteCase",
    ()=>deleteCase,
    "deleteClient",
    ()=>deleteClient,
    "deleteCurrentUser",
    ()=>deleteCurrentUser,
    "deleteDailyAccount",
    ()=>deleteDailyAccount,
    "deleteDailyAttachment",
    ()=>deleteDailyAttachment,
    "deleteFinancialRecord",
    ()=>deleteFinancialRecord,
    "deleteNote",
    ()=>deleteNote,
    "deleteOfficeExpense",
    ()=>deleteOfficeExpense,
    "deleteSession",
    ()=>deleteSession,
    "deleteUser",
    ()=>deleteUser,
    "getAccessToken",
    ()=>getAccessToken,
    "getBailiffNotice",
    ()=>getBailiffNotice,
    "getBailiffNotices",
    ()=>getBailiffNotices,
    "getCase",
    ()=>getCase,
    "getCases",
    ()=>getCases,
    "getClient",
    ()=>getClient,
    "getClients",
    ()=>getClients,
    "getCurrentUser",
    ()=>getCurrentUser,
    "getDailyAccount",
    ()=>getDailyAccount,
    "getDailyAccounts",
    ()=>getDailyAccounts,
    "getDailyAttachment",
    ()=>getDailyAttachment,
    "getDailyAttachments",
    ()=>getDailyAttachments,
    "getDeletedUsers",
    ()=>getDeletedUsers,
    "getFinancialRecord",
    ()=>getFinancialRecord,
    "getFinancialRecords",
    ()=>getFinancialRecords,
    "getNote",
    ()=>getNote,
    "getNotes",
    ()=>getNotes,
    "getOfficeExpense",
    ()=>getOfficeExpense,
    "getOfficeExpenses",
    ()=>getOfficeExpenses,
    "getRefreshToken",
    ()=>getRefreshToken,
    "getSession",
    ()=>getSession,
    "getSessions",
    ()=>getSessions,
    "getSessionsCalendar",
    ()=>getSessionsCalendar,
    "getUsers",
    ()=>getUsers,
    "login",
    ()=>login,
    "requestBailiffVisibility",
    ()=>requestBailiffVisibility,
    "restoreDeletedUser",
    ()=>restoreDeletedUser,
    "signup",
    ()=>signup,
    "updateBailiffNotice",
    ()=>updateBailiffNotice,
    "updateCase",
    ()=>updateCase,
    "updateClient",
    ()=>updateClient,
    "updateDailyAccount",
    ()=>updateDailyAccount,
    "updateDailyAttachment",
    ()=>updateDailyAttachment,
    "updateFinancialRecord",
    ()=>updateFinancialRecord,
    "updateNote",
    ()=>updateNote,
    "updateOfficeExpense",
    ()=>updateOfficeExpense,
    "updateSession",
    ()=>updateSession,
    "uploadBailiffNoticeAttachment",
    ()=>uploadBailiffNoticeAttachment,
    "uploadCaseAttachment",
    ()=>uploadCaseAttachment,
    "uploadDailyAttachmentImage",
    ()=>uploadDailyAttachmentImage,
    "verifyBailiffVisibility",
    ()=>verifyBailiffVisibility
]);
const BASE_URL = 'https://lawer-api.runasp.net';
// ── Token helpers ────────────────────────────────────────────
function getTokens() {
    if ("TURBOPACK compile-time truthy", 1) return {};
    //TURBOPACK unreachable
    ;
}
function saveTokens(data) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function clearTokens() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getAccessToken() {
    return getTokens().accessToken || null;
}
function getRefreshToken() {
    return getTokens().refreshToken || null;
}
// ── Core fetch wrapper ───────────────────────────────────────
async function request(path, options = {}, retry = true) {
    const token = getAccessToken();
    const headers = {
        'Content-Type': 'application/json',
        ...token ? {
            Authorization: `Bearer ${token}`
        } : {},
        ...options.headers
    };
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers
    });
    // Auto refresh on 401
    if (res.status === 401 && retry) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            return request(path, options, false);
        } else {
            clearTokens();
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            throw new Error('غير مصرح — يرجى تسجيل الدخول من جديد');
        }
    }
    // No-content responses
    if (res.status === 204) return {
        isSuccess: true,
        value: null
    };
    // Handle empty body (e.g. 403 with no content)
    const text = await res.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn('JSON parse failed:', e.message, text?.substring(0, 200));
        }
    }
    if (!res.ok) {
        const msg = data?.topError?.description || data?.errors?.[0]?.description || data?.title || (res.status === 403 ? 'غير مصرح بالوصول' : `خطأ ${res.status}`);
        throw new Error(msg);
    }
    return data;
}
// ── Normalise list responses ──────────────────────────────────
// The API sometimes returns a plain array, sometimes { value: [...] }
function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.value)) return data.value;
    return [];
}
async function tryRefreshToken() {
    const { accessToken, refreshToken } = getTokens();
    if (!accessToken || !refreshToken) return false;
    try {
        const res = await fetch(`${BASE_URL}/identity/token/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accessToken,
                refreshToken
            })
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data?.value?.accessToken) {
            saveTokens(data.value);
            return true;
        }
        return false;
    } catch  {
        return false;
    }
}
// ── Helpers ──────────────────────────────────────────────────
function get(path) {
    return request(path, {
        method: 'GET'
    });
}
function post(path, body) {
    return request(path, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}
function put(path, body) {
    return request(path, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}
function del(path) {
    return request(path, {
        method: 'DELETE'
    });
}
async function login({ email, password }) {
    const data = await request('/identity/token/generate', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        })
    }, false);
    if (data?.value) {
        saveTokens(data.value);
        // store minimal user info
        localStorage.setItem('ls_auth', JSON.stringify({
            email
        }));
    }
    return data;
}
async function signup({ email, password, role, city, phoneNumber }) {
    const data = await request('/identity/signup', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
            role,
            city,
            phoneNumber
        })
    }, false);
    if (data?.value) saveTokens(data.value);
    return data;
}
function getCurrentUser() {
    return get('/identity/current-user');
}
function deleteCurrentUser() {
    return del('/identity/current-user');
}
function getUsers() {
    return get('/identity/users');
}
function deleteUser(userId) {
    return del(`/identity/${userId}`);
}
function getDeletedUsers() {
    return get('/identity/users/deleted');
}
function restoreDeletedUser({ email, password }) {
    return post('/identity/restore-deleted-user', {
        email,
        password
    });
}
async function getClients() {
    const data = await get('/api/clients');
    return toList(data);
}
async function getClient(id) {
    const data = await get(`/api/clients/${id}`);
    return data?.value;
}
async function createClient(body) {
    const data = await post('/api/clients', body);
    return data?.value;
}
async function updateClient(id, body) {
    const data = await put(`/api/clients/${id}`, {
        id,
        ...body
    });
    return data?.value;
}
function deleteClient(id) {
    return del(`/api/clients/${id}`);
}
async function getCases() {
    const data = await get('/api/cases');
    return toList(data);
}
async function getCase(id) {
    const data = await get(`/api/cases/${id}`);
    return data?.value;
}
async function createCase(body) {
    const data = await post('/api/cases', body);
    return data?.value;
}
async function updateCase(id, body) {
    const data = await put(`/api/cases/${id}`, {
        id,
        ...body
    });
    return data?.value;
}
function deleteCase(id) {
    return del(`/api/cases/${id}`);
}
async function getSessions() {
    const data = await get('/api/sessions');
    return toList(data);
}
async function getSession(id) {
    const data = await get(`/api/sessions/${id}`);
    return data?.value;
}
async function createSession(body) {
    // Keep date as plain YYYY-MM-DD — server does not accept time component
    const safeBody = {
        ...body,
        sessionDate: body.sessionDate?.split('T')[0]
    };
    const data = await post('/api/sessions', safeBody);
    return data?.value;
}
async function updateSession(id, body) {
    const safeBody = {
        ...body,
        sessionDate: body.sessionDate?.split('T')[0]
    };
    const data = await put(`/api/sessions/${id}`, {
        id,
        ...safeBody
    });
    return data?.value;
}
function deleteSession(id) {
    return del(`/api/sessions/${id}`);
}
async function getSessionsCalendar(startDate, endDate) {
    const data = await get(`/api/sessions/calendar?startDate=${startDate}&endDate=${endDate}`);
    return toList(data);
}
async function createSessionForToday(body) {
    const data = await post('/api/sessions/today', body);
    return data?.value;
}
async function getFinancialRecords() {
    const data = await get('/api/financial-records');
    return toList(data);
}
async function getFinancialRecord(id) {
    const data = await get(`/api/financial-records/${id}`);
    return data?.value;
}
async function createFinancialRecord(body) {
    const data = await post('/api/financial-records', body);
    return data?.value;
}
async function updateFinancialRecord(id, body) {
    const data = await put(`/api/financial-records/${id}`, {
        id,
        ...body
    });
    return data?.value;
}
function deleteFinancialRecord(id) {
    return del(`/api/financial-records/${id}`);
}
async function uploadCaseAttachment(caseId, file) {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('File', file);
    const res = await fetch(`${BASE_URL}/api/cases/${caseId}/attachments`, {
        method: 'POST',
        headers: token ? {
            Authorization: `Bearer ${token}`
        } : {},
        body: formData
    });
    if (!res.ok) {
        let msg = `خطأ ${res.status}`;
        try {
            const err = await res.json();
            msg = err?.topError?.description || err?.errors?.[0]?.description || msg;
        } catch  {}
        throw new Error(msg);
    }
    const data = await res.json();
    return data?.value ?? data;
}
async function getBailiffNotices() {
    const data = await get('/api/bailiff-notices');
    return toList(data);
}
async function getBailiffNotice(id) {
    const data = await get(`/api/bailiff-notices/${id}`);
    return data?.value;
}
async function createBailiffNotice(body) {
    const data = await post('/api/bailiff-notices', body);
    return data?.value;
}
async function updateBailiffNotice(id, body) {
    const data = await put(`/api/bailiff-notices/${id}`, {
        id,
        ...body
    });
    return data?.value;
}
function deleteBailiffNotice(id) {
    return del(`/api/bailiff-notices/${id}`);
}
async function uploadBailiffNoticeAttachment(bailiffNoticeId, file) {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('File', file);
    const res = await fetch(`${BASE_URL}/api/bailiff-notices/${bailiffNoticeId}/attachments`, {
        method: 'POST',
        headers: token ? {
            Authorization: `Bearer ${token}`
        } : {},
        body: formData
    });
    if (!res.ok) {
        let msg = `خطأ ${res.status}`;
        try {
            const err = await res.json();
            msg = err?.topError?.description || err?.errors?.[0]?.description || msg;
        } catch  {}
        throw new Error(msg);
    }
    const data = await res.json();
    return data?.value ?? data;
}
async function requestBailiffVisibility(id, memberUserId) {
    return post(`/api/bailiff-notices/${id}/request-visibility`, {
        memberUserId
    });
}
async function verifyBailiffVisibility(id, memberUserId, code) {
    const data = await post(`/api/bailiff-notices/${id}/verify-visibility`, {
        memberUserId,
        code
    });
    return data?.value ?? data;
}
async function getDailyAccounts() {
    const data = await get('/api/daily-accounts');
    return toList(data);
}
async function getDailyAccount(id) {
    const data = await get(`/api/daily-accounts/${id}`);
    return data?.value;
}
async function createDailyAccount(body) {
    const data = await post('/api/daily-accounts', body);
    return data?.value;
}
async function updateDailyAccount(id, body) {
    const data = await put(`/api/daily-accounts/${id}`, {
        id,
        ...body
    });
    return data?.value;
}
function deleteDailyAccount(id) {
    return del(`/api/daily-accounts/${id}`);
}
async function getDailyAttachments() {
    const data = await get('/api/daily-attachments');
    return toList(data);
}
async function getDailyAttachment(id) {
    const data = await get(`/api/daily-attachments/${id}`);
    return data?.value;
}
async function createDailyAttachment(body) {
    const data = await post('/api/daily-attachments', body);
    return data?.value;
}
async function updateDailyAttachment(id, body) {
    const data = await put(`/api/daily-attachments/${id}`, {
        id,
        ...body
    });
    return data?.value;
}
function deleteDailyAttachment(id) {
    return del(`/api/daily-attachments/${id}`);
}
async function uploadDailyAttachmentImage(attachmentId, file) {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('File', file);
    const res = await fetch(`${BASE_URL}/api/daily-attachments/${attachmentId}/images`, {
        method: 'POST',
        headers: token ? {
            Authorization: `Bearer ${token}`
        } : {},
        body: formData
    });
    if (!res.ok) {
        let msg = `خطأ ${res.status}`;
        try {
            const err = await res.json();
            msg = err?.topError?.description || err?.errors?.[0]?.description || msg;
        } catch  {}
        throw new Error(msg);
    }
    const data = await res.json();
    return data?.value ?? data;
}
async function getNotes() {
    const data = await get('/api/notes');
    return Array.isArray(data) ? data : toList(data);
}
async function getNote(id) {
    const data = await get(`/api/notes/${id}`);
    return data?.value ?? data;
}
async function createNote(body) {
    const data = await post('/api/notes', body);
    return data?.value ?? data;
}
async function updateNote(id, body) {
    const data = await put(`/api/notes/${id}`, {
        id,
        ...body
    });
    return data?.value ?? data;
}
function deleteNote(id) {
    return del(`/api/notes/${id}`);
}
async function getOfficeExpenses() {
    const data = await get('/api/OfficeExpenses');
    return Array.isArray(data) ? data : toList(data);
}
async function getOfficeExpense(id) {
    const data = await get(`/api/OfficeExpenses/${id}`);
    return data?.value ?? data;
}
async function createOfficeExpense(body) {
    const data = await post('/api/OfficeExpenses', body);
    return data?.value ?? data;
}
async function updateOfficeExpense(id, body) {
    const data = await put(`/api/OfficeExpenses/${id}`, {
        id,
        ...body
    });
    return data?.value ?? data;
}
function deleteOfficeExpense(id) {
    return del(`/api/OfficeExpenses/${id}`);
}
}),
"[project]/src/app/components/AppShell.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "AuthGuard",
    ()=>AuthGuard,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/api.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
// ==================== CONTEXT ====================
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function useApp() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
}
// ==================== SIDEBAR ====================
function Sidebar({ currentPath, isOpen, onClose }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, logout } = useApp();
    const isManager = user?.roles?.includes('Manager');
    const navItems = [
        {
            href: '/dashboard',
            icon: '🏛️',
            label: 'لوحة التحكم'
        },
        {
            href: '/clients',
            icon: '👥',
            label: 'الموكلين'
        },
        {
            href: '/cases',
            icon: '⚖️',
            label: 'القضايا'
        },
        {
            href: '/sessions',
            icon: '📋',
            label: 'الجلسات'
        },
        {
            href: '/sessions/agenda',
            icon: '📅',
            label: 'الأجندة'
        },
        {
            href: '/bailiffs',
            icon: '📁',
            label: 'شغل إداري'
        },
        {
            href: '/finance',
            icon: '💰',
            label: 'المالية',
            managerOnly: true
        },
        {
            href: '/daily-accounts',
            icon: '📊',
            label: 'الحسابات اليومية',
            managerOnly: true
        },
        {
            href: '/notes',
            icon: '📝',
            label: 'الملاحظات',
            managerOnly: true
        },
        {
            href: '/office-expenses',
            icon: '🏢',
            label: 'مصروفات المكتب',
            managerOnly: true
        },
        {
            href: '/users',
            icon: '👥',
            label: 'المستخدمين',
            managerOnly: true
        }
    ];
    const visibleItems = navItems.filter((item)=>!item.managerOnly || isManager);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `sidebar ${isOpen ? 'sidebar-open' : ''}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sidebar-logo",
                style: {
                    justifyContent: 'space-between'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '13px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sidebar-logo-icon",
                                children: "⚖️"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AppShell.js",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sidebar-logo-text",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        children: "مؤسسة اليقين"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AppShell.js",
                                        lineNumber: 43,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "الأستاذ / محمود البلوي"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AppShell.js",
                                        lineNumber: 44,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/AppShell.js",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "sidebar-close-btn",
                        onClick: onClose,
                        "aria-label": "إغلاق القائمة",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "sidebar-nav",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "sidebar-section-title",
                        children: "القائمة الرئيسية"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    visibleItems.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: item.href,
                            className: `sidebar-link ${currentPath === item.href ? 'active' : ''}`,
                            onClick: (e)=>{
                                e.preventDefault();
                                router.push(item.href);
                                onClose();
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "sidebar-link-icon",
                                    children: item.icon
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AppShell.js",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this),
                                item.label
                            ]
                        }, item.href, true, {
                            fileName: "[project]/src/app/components/AppShell.js",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sidebar-footer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sidebar-user-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sidebar-user-avatar",
                                children: user?.email?.[0]?.toUpperCase() || 'م'
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AppShell.js",
                                lineNumber: 67,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "sidebar-user-name",
                                        children: user?.email || 'المستخدم'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AppShell.js",
                                        lineNumber: 69,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "sidebar-user-role",
                                        children: user?.roles?.[0] || 'محامٍ قانوني'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AppShell.js",
                                        lineNumber: 70,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/AppShell.js",
                                lineNumber: 68,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "logout-btn",
                        onClick: logout,
                        children: "تسجيل الخروج 🚪"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 65,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
// ==================== HEADER ====================
function Header({ onMenuToggle }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "header",
        style: {
            justifyContent: 'flex-end',
            padding: '0 20px'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: "mobile-menu-btn",
            onClick: onMenuToggle,
            children: "☰"
        }, void 0, false, {
            fileName: "[project]/src/app/components/AppShell.js",
            lineNumber: 85,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
// ==================== TOAST ====================
function ToastContainer({ toasts, removeToast }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "toast-container",
        children: toasts.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `toast toast-${t.type}`,
                onClick: ()=>removeToast(t.id),
                style: {
                    cursor: 'pointer'
                },
                children: [
                    t.type === 'success' ? '✅' : '❌',
                    " ",
                    t.message
                ]
            }, t.id, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 95,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
function AppProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [initialized, setInitialized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // On mount: check if valid token exists and fetch current user
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAccessToken"])();
        if (token) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCurrentUser"])().then((res)=>{
                if (res?.value) setUser(res.value);
            }).catch(()=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearTokens"])();
            }).finally(()=>setInitialized(true));
        } else {
            setInitialized(true);
        }
    }, []);
    const login = async (email, password)=>{
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["login"])({
            email,
            password
        });
        // After successful login fetch user profile
        const userRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCurrentUser"])();
        const userObj = userRes?.value ? {
            ...userRes.value,
            email
        } : {
            email
        };
        setUser(userObj);
        return userObj;
    };
    const logout = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearTokens"])();
        setUser(null);
        router.push('/login');
    };
    const showToast = (message, type = 'success')=>{
        const id = Date.now();
        setToasts((prev)=>[
                ...prev,
                {
                    id,
                    message,
                    type
                }
            ]);
        setTimeout(()=>setToasts((prev)=>prev.filter((t)=>t.id !== id)), 3500);
    };
    const removeToast = (id)=>setToasts((prev)=>prev.filter((t)=>t.id !== id));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        value: {
            user,
            setUser,
            login,
            logout,
            showToast,
            initialized
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContainer, {
                toasts: toasts,
                removeToast: removeToast
            }, void 0, false, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 153,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 151,
        columnNumber: 5
    }, this);
}
function AuthGuard({ children, title, requiredRole }) {
    const { user, initialized } = useApp();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (initialized && !user) {
            router.push('/login');
        }
    }, [
        user,
        initialized,
        router
    ]);
    // Role-based access control
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (initialized && user && requiredRole) {
            const hasRole = user.roles?.includes(requiredRole);
            if (!hasRole) {
                router.push('/dashboard');
            }
        }
    }, [
        initialized,
        user,
        requiredRole,
        router
    ]);
    if (!initialized || !user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '16px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: '36px',
                        animation: 'spin 1s linear infinite'
                    },
                    children: "⚖️"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AppShell.js",
                    lineNumber: 185,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        color: 'var(--text-muted)',
                        fontSize: '14px'
                    },
                    children: "جارٍ التحقق من الهوية..."
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AppShell.js",
                    lineNumber: 186,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                    children: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }}`
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AppShell.js",
                    lineNumber: 187,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/AppShell.js",
            lineNumber: 184,
            columnNumber: 7
        }, this);
    }
    // Block render if role is required and user doesn't have it
    if (requiredRole && !user.roles?.includes(requiredRole)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '16px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: '48px'
                    },
                    children: "🔒"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AppShell.js",
                    lineNumber: 196,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        color: 'var(--text-muted)',
                        fontSize: '16px',
                        fontWeight: '600'
                    },
                    children: "غير مصرح بالوصول لهذه الصفحة"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AppShell.js",
                    lineNumber: 197,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/AppShell.js",
            lineNumber: 195,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-layout",
        children: [
            isMobileMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mobile-overlay",
                onClick: ()=>setIsMobileMenuOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 205,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Sidebar, {
                currentPath: pathname,
                isOpen: isMobileMenuOpen,
                onClose: ()=>setIsMobileMenuOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 207,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "main-content",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Header, {
                        onMenuToggle: ()=>setIsMobileMenuOpen(true)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "page-content",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 208,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 203,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/components/ClientWrapper.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayoutClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$AppShell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/AppShell.js [app-ssr] (ecmascript)");
'use client';
;
;
function RootLayoutClient({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$AppShell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/components/ClientWrapper.js",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0g_xacp._.js.map