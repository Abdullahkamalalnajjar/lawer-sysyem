(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/lib/api.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    "createFinancialRecord",
    ()=>createFinancialRecord,
    "createSession",
    ()=>createSession,
    "deleteBailiffNotice",
    ()=>deleteBailiffNotice,
    "deleteCase",
    ()=>deleteCase,
    "deleteClient",
    ()=>deleteClient,
    "deleteCurrentUser",
    ()=>deleteCurrentUser,
    "deleteFinancialRecord",
    ()=>deleteFinancialRecord,
    "deleteSession",
    ()=>deleteSession,
    "deleteUser",
    ()=>deleteUser,
    "getAccessToken",
    ()=>getAccessToken,
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
    "getFinancialRecord",
    ()=>getFinancialRecord,
    "getFinancialRecords",
    ()=>getFinancialRecords,
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
    "signup",
    ()=>signup,
    "updateBailiffNotice",
    ()=>updateBailiffNotice,
    "updateCase",
    ()=>updateCase,
    "updateClient",
    ()=>updateClient,
    "updateFinancialRecord",
    ()=>updateFinancialRecord,
    "updateSession",
    ()=>updateSession,
    "uploadBailiffNoticeAttachment",
    ()=>uploadBailiffNoticeAttachment,
    "uploadCaseAttachment",
    ()=>uploadCaseAttachment
]);
const BASE_URL = 'http://lawer-api.runasp.net';
// ── Token helpers ────────────────────────────────────────────
function getTokens() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return JSON.parse(localStorage.getItem('ls_tokens') || '{}');
    } catch  {
        return {};
    }
}
function saveTokens(data) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem('ls_tokens', JSON.stringify(data));
}
function clearTokens() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem('ls_tokens');
    localStorage.removeItem('ls_auth');
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
            if ("TURBOPACK compile-time truthy", 1) window.location.href = '/login';
            throw new Error('غير مصرح — يرجى تسجيل الدخول من جديد');
        }
    }
    // No-content responses
    if (res.status === 204) return {
        isSuccess: true,
        value: null
    };
    const data = await res.json();
    if (!res.ok) {
        const msg = data?.topError?.description || data?.errors?.[0]?.description || data?.title || `خطأ ${res.status}`;
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
    const data = await post('/api/sessions', body);
    return data?.value;
}
async function updateSession(id, body) {
    const data = await put(`/api/sessions/${id}`, {
        id,
        ...body
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/AppShell.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "AuthGuard",
    ()=>AuthGuard,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/api.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
'use client';
;
;
;
// ==================== CONTEXT ====================
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function useApp() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
}
_s(useApp, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
// ==================== SIDEBAR ====================
function Sidebar({ currentPath, isOpen, onClose }) {
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, logout } = useApp();
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
            icon: '📜',
            label: 'المحضرين'
        },
        {
            href: '/finance',
            icon: '💰',
            label: 'المالية'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `sidebar ${isOpen ? 'sidebar-open' : ''}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sidebar-logo",
                style: {
                    justifyContent: 'space-between'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '13px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sidebar-logo-icon",
                                children: "⚖️"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AppShell.js",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sidebar-logo-text",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        children: "نظام المحاماة"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AppShell.js",
                                        lineNumber: 35,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "إدارة قانونية متكاملة"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AppShell.js",
                                        lineNumber: 36,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/AppShell.js",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "sidebar-close-btn",
                        onClick: onClose,
                        "aria-label": "إغلاق القائمة",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "sidebar-nav",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "sidebar-section-title",
                        children: "القائمة الرئيسية"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    navItems.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: item.href,
                            className: `sidebar-link ${currentPath === item.href ? 'active' : ''}`,
                            onClick: (e)=>{
                                e.preventDefault();
                                router.push(item.href);
                                onClose();
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "sidebar-link-icon",
                                    children: item.icon
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AppShell.js",
                                    lineNumber: 51,
                                    columnNumber: 13
                                }, this),
                                item.label
                            ]
                        }, item.href, true, {
                            fileName: "[project]/src/app/components/AppShell.js",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sidebar-footer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sidebar-user-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sidebar-user-avatar",
                                children: user?.email?.[0]?.toUpperCase() || 'م'
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AppShell.js",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "sidebar-user-name",
                                        children: user?.email || 'المستخدم'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AppShell.js",
                                        lineNumber: 61,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "sidebar-user-role",
                                        children: user?.roles?.[0] || 'محامٍ قانوني'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AppShell.js",
                                        lineNumber: 62,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/AppShell.js",
                                lineNumber: 60,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "logout-btn",
                        onClick: logout,
                        children: "تسجيل الخروج 🚪"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 57,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_s1(Sidebar, "VnjklBh0QkDPMG3dr995MqYyZuw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        useApp
    ];
});
_c = Sidebar;
// ==================== HEADER ====================
function Header({ onMenuToggle }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "header",
        style: {
            justifyContent: 'flex-end',
            padding: '0 20px'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: "mobile-menu-btn",
            onClick: onMenuToggle,
            children: "☰"
        }, void 0, false, {
            fileName: "[project]/src/app/components/AppShell.js",
            lineNumber: 77,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c1 = Header;
// ==================== TOAST ====================
function ToastContainer({ toasts, removeToast }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "toast-container",
        children: toasts.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                lineNumber: 87,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c2 = ToastContainer;
function AppProvider({ children }) {
    _s2();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [initialized, setInitialized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // On mount: check if valid token exists and fetch current user
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccessToken"])();
            if (token) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentUser"])().then({
                    "AppProvider.useEffect": (res)=>{
                        if (res?.value) setUser(res.value);
                    }
                }["AppProvider.useEffect"]).catch({
                    "AppProvider.useEffect": ()=>{
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearTokens"])();
                    }
                }["AppProvider.useEffect"]).finally({
                    "AppProvider.useEffect": ()=>setInitialized(true)
                }["AppProvider.useEffect"]);
            } else {
                setInitialized(true);
            }
        }
    }["AppProvider.useEffect"], []);
    const login = async (email, password)=>{
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["login"])({
            email,
            password
        });
        // After successful login fetch user profile
        const userRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentUser"])();
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearTokens"])();
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContainer, {
                toasts: toasts,
                removeToast: removeToast
            }, void 0, false, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 145,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_s2(AppProvider, "FVIC6UwgI3EuM1Fo9Xgn+K6X8Qg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c3 = AppProvider;
function AuthGuard({ children, title }) {
    _s3();
    const { user, initialized } = useApp();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthGuard.useEffect": ()=>{
            if (initialized && !user) {
                router.push('/login');
            }
        }
    }["AuthGuard.useEffect"], [
        user,
        initialized,
        router
    ]);
    if (!initialized || !user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '16px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: '36px',
                        animation: 'spin 1s linear infinite'
                    },
                    children: "⚖️"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AppShell.js",
                    lineNumber: 167,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        color: 'var(--text-muted)',
                        fontSize: '14px'
                    },
                    children: "جارٍ التحقق من الهوية..."
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AppShell.js",
                    lineNumber: 168,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                    children: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }}`
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AppShell.js",
                    lineNumber: 169,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/AppShell.js",
            lineNumber: 166,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-layout",
        children: [
            isMobileMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mobile-overlay",
                onClick: ()=>setIsMobileMenuOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 177,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Sidebar, {
                currentPath: pathname,
                isOpen: isMobileMenuOpen,
                onClose: ()=>setIsMobileMenuOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 179,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "main-content",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Header, {
                        onMenuToggle: ()=>setIsMobileMenuOpen(true)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "page-content",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AppShell.js",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AppShell.js",
                lineNumber: 180,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AppShell.js",
        lineNumber: 175,
        columnNumber: 5
    }, this);
}
_s3(AuthGuard, "L/lwmsjOhH+5jPpJkvNO7str3uc=", false, function() {
    return [
        useApp,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c4 = AuthGuard;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "Sidebar");
__turbopack_context__.k.register(_c1, "Header");
__turbopack_context__.k.register(_c2, "ToastContainer");
__turbopack_context__.k.register(_c3, "AppProvider");
__turbopack_context__.k.register(_c4, "AuthGuard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/ClientWrapper.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayoutClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$AppShell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/AppShell.js [app-client] (ecmascript)");
'use client';
;
;
function RootLayoutClient({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$AppShell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/components/ClientWrapper.js",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = RootLayoutClient;
var _c;
__turbopack_context__.k.register(_c, "RootLayoutClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_0cpthba._.js.map