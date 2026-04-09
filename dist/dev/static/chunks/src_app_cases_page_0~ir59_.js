(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/cases/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CasesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$AppShell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/AppShell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/api.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
const BASE_URL = 'http://lawer-api.runasp.net';
function CasesPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$AppShell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthGuard"], {
        title: "إدارة القضايا",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CasesContent, {}, void 0, false, {
            fileName: "[project]/src/app/cases/page.js",
            lineNumber: 12,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/cases/page.js",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = CasesPage;
const CASE_TYPES = [
    'مدني',
    'تجاري',
    'جنائي',
    'إداري',
    'أحوال شخصية',
    'عمالي',
    'دستوري',
    'أخرى'
];
const CLASSIFICATIONS = [
    'بداية',
    'استئناف',
    'نقض',
    'جنحة',
    'جناية',
    'دستوري'
];
const DEGREES = [
    'أول',
    'ثاني',
    'ثالث',
    'نهائي'
];
function typeBadge(type) {
    const map = {
        'مدني': 'badge-blue',
        'تجاري': 'badge-gold',
        'جنائي': 'badge-red',
        'إداري': 'badge-yellow',
        'أحوال شخصية': 'badge-green'
    };
    return map[type] || 'badge-gray';
}
// ══════════════════════════════════════════════════════════════
// CASE DETAIL DRAWER
// ══════════════════════════════════════════════════════════════
function CaseDrawer({ caseItem, clientName, onClose, onEdit, onUploadDone, showToast }) {
    _s();
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('info') // 'info' | 'attachments'
    ;
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // existing attachments from API + new ones uploaded this session
    const existingAttachments = caseItem.attachments || [];
    const [newUploads, setNewUploads] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const allAttachments = [
        ...newUploads,
        ...existingAttachments
    ];
    const [dragOver, setDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])();
    // reset when switching case
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CaseDrawer.useEffect": ()=>{
            setTab('info');
            setFile(null);
            setNewUploads([]);
        }
    }["CaseDrawer.useEffect"], [
        caseItem?.id
    ]);
    const handleUpload = async ()=>{
        if (!file) return;
        setUploading(true);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadCaseAttachment"])(caseItem.id, file);
            // build a display object matching the API attachment shape
            const uploaded = {
                id: result?.id || Date.now(),
                fileName: result?.fileName || file.name,
                filePath: result?.filePath || '',
                fileType: result?.fileType || file.type,
                _localUrl: URL.createObjectURL(file)
            };
            setNewUploads((prev)=>[
                    uploaded,
                    ...prev
                ]);
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
            showToast(`✅ تم رفع "${file.name}" بنجاح`);
            onUploadDone?.();
        } catch (err) {
            showToast(err.message || 'فشل رفع الملف', 'error');
        } finally{
            setUploading(false);
        }
    };
    const handleDrop = (e)=>{
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
    };
    const ext = file?.name?.split('.').pop()?.toLowerCase();
    const isImg = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg'
    ].includes(ext);
    const fileIcon = file ? isImg ? '🖼️' : '📄' : '📂';
    const infoRows = [
        {
            label: 'رقم القضية',
            value: caseItem.caseNumber,
            bold: true,
            red: true
        },
        {
            label: 'نوع القضية',
            value: caseItem.caseType
        },
        {
            label: 'الموكل',
            value: clientName || '—'
        },
        {
            label: 'الخصم',
            value: caseItem.opponentName || '—'
        },
        {
            label: 'التصنيف',
            value: caseItem.caseClassification
        },
        {
            label: 'الدرجة',
            value: caseItem.caseDegree
        },
        {
            label: 'عدد الجلسات',
            value: caseItem.numberOfSessions ?? 0
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: onClose,
                style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(30,8,8,0.35)',
                    backdropFilter: 'blur(3px)',
                    zIndex: 200,
                    animation: 'fadeIn 0.2s ease'
                }
            }, void 0, false, {
                fileName: "[project]/src/app/cases/page.js",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "case-drawer",
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    background: '#fff',
                    boxShadow: '-8px 0 48px rgba(192,57,43,0.18)',
                    zIndex: 201,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideInLeft 0.28s cubic-bezier(0.22,1,0.36,1)',
                    borderRight: '1px solid rgba(192,57,43,0.12)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '20px 24px',
                            background: 'linear-gradient(135deg, #8b1a1a 0%, #c0392b 60%, #e74c3c 100%)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '24px'
                                                },
                                                children: "⚖️"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 123,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: 'rgba(255,255,255,0.65)',
                                                            fontWeight: '600',
                                                            letterSpacing: '0.8px',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "تفاصيل القضية"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cases/page.js",
                                                        lineNumber: 125,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '20px',
                                                            fontWeight: '900',
                                                            color: '#fff',
                                                            fontFamily: "'Playfair Display', serif",
                                                            letterSpacing: '-0.3px'
                                                        },
                                                        children: caseItem.caseNumber
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cases/page.js",
                                                        lineNumber: 126,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 124,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: '8px',
                                            display: 'flex',
                                            gap: '8px',
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: chipStyle,
                                                children: caseItem.caseType
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 132,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: chipStyle,
                                                children: caseItem.caseClassification
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 133,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: chipStyle,
                                                children: [
                                                    "درجة ",
                                                    caseItem.caseDegree
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 134,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 131,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 121,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                style: closeBtnStyle,
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            borderBottom: '2px solid rgba(192,57,43,0.10)',
                            flexShrink: 0
                        },
                        children: [
                            {
                                id: 'info',
                                label: '📋 معلومات القضية'
                            },
                            {
                                id: 'attachments',
                                label: `📎 المرافقات${allAttachments.length ? ` (${allAttachments.length})` : ''}`
                            }
                        ].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setTab(t.id),
                                style: {
                                    flex: 1,
                                    padding: '13px 8px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: tab === t.id ? '800' : '500',
                                    color: tab === t.id ? '#c0392b' : '#9b7070',
                                    borderBottom: tab === t.id ? '2px solid #c0392b' : '2px solid transparent',
                                    marginBottom: '-2px',
                                    transition: 'all 0.2s',
                                    fontFamily: "'Cairo', sans-serif"
                                },
                                children: t.label
                            }, t.id, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 146,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: '24px'
                        },
                        children: [
                            tab === 'info' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    infoRows.map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '13px 0',
                                                borderBottom: i < infoRows.length - 1 ? '1px solid rgba(192,57,43,0.07)' : 'none',
                                                alignItems: 'center'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '13px',
                                                        color: '#9b7070',
                                                        fontWeight: '600'
                                                    },
                                                    children: row.label
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 178,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '14px',
                                                        fontWeight: row.bold ? '800' : '600',
                                                        color: row.red ? '#c0392b' : '#1a0a0a'
                                                    },
                                                    children: row.value
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 179,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/src/app/cases/page.js",
                                            lineNumber: 172,
                                            columnNumber: 17
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: '28px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onEdit(caseItem),
                                                style: actionBtnStyle('#c0392b', '#fff'),
                                                children: "✏️  تعديل بيانات القضية"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 191,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setTab('attachments'),
                                                style: actionBtnStyle('transparent', '#c0392b', '1.5px solid #c0392b'),
                                                children: "📎  إضافة مرافقة"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 197,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 190,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this),
                            tab === 'attachments' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: '13px',
                                            color: '#9b7070',
                                            marginBottom: '18px'
                                        },
                                        children: "ارفع المستندات والمرافقات المتعلقة بهذه القضية"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 210,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "drawer-file-input",
                                        onDragOver: (e)=>{
                                            e.preventDefault();
                                            setDragOver(true);
                                        },
                                        onDragLeave: ()=>setDragOver(false),
                                        onDrop: handleDrop,
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px dashed ${dragOver ? '#c0392b' : file ? '#e74c3c' : 'rgba(192,57,43,0.25)'}`,
                                            borderRadius: '14px',
                                            padding: '32px 20px',
                                            cursor: 'pointer',
                                            background: dragOver ? 'rgba(192,57,43,0.06)' : file ? 'rgba(192,57,43,0.03)' : '#fdf9f9',
                                            transition: 'all 0.2s ease',
                                            gap: '10px',
                                            textAlign: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '36px'
                                                },
                                                children: fileIcon
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 233,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: '700',
                                                    color: '#1a0a0a',
                                                    fontSize: '14px'
                                                },
                                                children: file ? file.name : 'اسحب الملف هنا أو اضغط للاختيار'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 234,
                                                columnNumber: 17
                                            }, this),
                                            file ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '12px',
                                                    color: '#9b7070'
                                                },
                                                children: [
                                                    (file.size / 1024).toFixed(1),
                                                    " KB — ",
                                                    file.type || ext
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 238,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '12px',
                                                    color: '#9b7070'
                                                },
                                                children: "PDF, Word, صور — حجم أقصى 10 MB"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 242,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                id: "drawer-file-input",
                                                ref: fileRef,
                                                type: "file",
                                                style: {
                                                    display: 'none'
                                                },
                                                onChange: (e)=>setFile(e.target.files[0] || null)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 246,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 215,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: '10px',
                                            marginTop: '14px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleUpload,
                                                disabled: !file || uploading,
                                                style: {
                                                    ...actionBtnStyle('#c0392b', '#fff'),
                                                    flex: 1,
                                                    opacity: !file || uploading ? 0.55 : 1,
                                                    cursor: !file || uploading ? 'not-allowed' : 'pointer'
                                                },
                                                children: uploading ? '⏳ جارٍ الرفع...' : '📤 رفع المستند'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 257,
                                                columnNumber: 17
                                            }, this),
                                            file && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setFile(null);
                                                    if (fileRef.current) fileRef.current.value = '';
                                                },
                                                style: actionBtnStyle('transparent', '#9b7070', '1.5px solid rgba(192,57,43,0.20)'),
                                                children: "✕ إلغاء"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 270,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 256,
                                        columnNumber: 15
                                    }, this),
                                    allAttachments.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: '24px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '12px',
                                                    fontWeight: '800',
                                                    color: '#9b7070',
                                                    letterSpacing: '1px',
                                                    textTransform: 'uppercase',
                                                    marginBottom: '12px'
                                                },
                                                children: [
                                                    "المرافقات (",
                                                    allAttachments.length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 282,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '12px'
                                                },
                                                children: allAttachments.map((att, i)=>{
                                                    const isImage = att.fileType?.startsWith('image/');
                                                    const imgUrl = att._localUrl || (att.filePath ? `${BASE_URL}/${att.filePath}` : null);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            border: '1px solid rgba(192,57,43,0.12)',
                                                            borderRadius: '12px',
                                                            overflow: 'hidden',
                                                            background: '#fdf9f9'
                                                        },
                                                        children: [
                                                            isImage && imgUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                href: imgUrl,
                                                                target: "_blank",
                                                                rel: "noreferrer",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: imgUrl,
                                                                    alt: att.fileName,
                                                                    style: {
                                                                        width: '100%',
                                                                        maxHeight: '200px',
                                                                        objectFit: 'cover',
                                                                        display: 'block',
                                                                        borderBottom: '1px solid rgba(192,57,43,0.10)'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/cases/page.js",
                                                                    lineNumber: 299,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/cases/page.js",
                                                                lineNumber: 298,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '10px',
                                                                    padding: '10px 14px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: '20px'
                                                                        },
                                                                        children: isImage ? '🖼️' : att.fileType?.includes('pdf') ? '📑' : '📄'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/cases/page.js",
                                                                        lineNumber: 317,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            flex: 1,
                                                                            minWidth: 0
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    fontSize: '12.5px',
                                                                                    fontWeight: '700',
                                                                                    color: '#1a0a0a',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap'
                                                                                },
                                                                                children: att.fileName
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/cases/page.js",
                                                                                lineNumber: 321,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    fontSize: '11px',
                                                                                    color: '#9b7070',
                                                                                    marginTop: '2px'
                                                                                },
                                                                                children: att.fileType
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/cases/page.js",
                                                                                lineNumber: 324,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/cases/page.js",
                                                                        lineNumber: 320,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    imgUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                        href: imgUrl,
                                                                        target: "_blank",
                                                                        rel: "noreferrer",
                                                                        style: {
                                                                            fontSize: '18px',
                                                                            textDecoration: 'none'
                                                                        },
                                                                        title: "فتح الملف",
                                                                        children: "🔗"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/cases/page.js",
                                                                        lineNumber: 329,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/cases/page.js",
                                                                lineNumber: 313,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, att.id || i, true, {
                                                        fileName: "[project]/src/app/cases/page.js",
                                                        lineNumber: 290,
                                                        columnNumber: 25
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 285,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 281,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: 'center',
                                            color: '#d4bfbf',
                                            fontSize: '13px',
                                            marginTop: '28px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '36px',
                                                    marginBottom: '8px'
                                                },
                                                children: "📁"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 347,
                                                columnNumber: 19
                                            }, this),
                                            "لا توجد مرافقات بعد"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 346,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 209,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '16px 24px',
                            borderTop: '1px solid rgba(192,57,43,0.08)',
                            background: '#fdf9f9',
                            flexShrink: 0,
                            display: 'flex',
                            justifyContent: 'flex-end'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                ...actionBtnStyle('transparent', '#9b7070', '1.5px solid rgba(192,57,43,0.20)'),
                                padding: '8px 20px',
                                fontSize: '13px'
                            },
                            children: "إغلاق"
                        }, void 0, false, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 363,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 356,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/cases/page.js",
                lineNumber: 103,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/app/cases/page.js",
                lineNumber: 369,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(CaseDrawer, "JZBH7yO6qpj/b/7o2NOiwesezOM=");
_c1 = CaseDrawer;
// ── Shared style helpers ─────────────────────────────────────
const chipStyle = {
    padding: '3px 10px',
    borderRadius: '99px',
    background: 'rgba(255,255,255,0.20)',
    border: '1px solid rgba(255,255,255,0.30)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700'
};
const closeBtnStyle = {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '8px',
    color: '#fff',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
};
const actionBtnStyle = (bg, color, border = 'none')=>({
        background: bg,
        color,
        border: border === 'none' ? 'none' : border,
        borderRadius: '10px',
        padding: '10px 18px',
        fontWeight: '700',
        fontSize: '13.5px',
        cursor: 'pointer',
        fontFamily: "'Cairo', sans-serif",
        transition: 'all 0.18s',
        boxShadow: bg === '#c0392b' ? '0 4px 14px rgba(192,57,43,0.28)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
    });
// ══════════════════════════════════════════════════════════════
// CASE EDIT MODAL
// ══════════════════════════════════════════════════════════════
function CaseModal({ caseItem, clients, onClose, onSave, saving }) {
    _s1();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(caseItem ? {
        caseNumber: caseItem.caseNumber || '',
        caseType: caseItem.caseType || 'مدني',
        clientId: caseItem.clientId || '',
        opponentName: caseItem.opponentName || '',
        caseClassification: caseItem.caseClassification || 'بداية',
        caseDegree: caseItem.caseDegree || 'أول'
    } : {
        caseNumber: '',
        caseType: 'مدني',
        clientId: '',
        opponentName: '',
        caseClassification: 'بداية',
        caseDegree: 'أول'
    });
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const validate = ()=>{
        const errs = {};
        if (!form.caseNumber.trim()) errs.caseNumber = 'رقم القضية مطلوب';
        if (!form.clientId) errs.clientId = 'يجب اختيار الموكل';
        if (!form.opponentName.trim()) errs.opponentName = 'اسم الخصم مطلوب';
        return errs;
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        onSave(form);
    };
    const sel = (key, label, options, opts = {})=>{
        const { full, req, placeholder: ph, ...domProps } = opts;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `form-group ${full ? 'form-full' : ''}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "form-label",
                    children: [
                        req && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "form-required",
                            children: "*"
                        }, void 0, false, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 439,
                            columnNumber: 47
                        }, this),
                        label
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/cases/page.js",
                    lineNumber: 439,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    className: "form-select",
                    value: form[key],
                    onChange: (e)=>setForm((p)=>({
                                ...p,
                                [key]: e.target.value
                            })),
                    style: errors[key] ? {
                        borderColor: 'var(--danger)'
                    } : {},
                    ...domProps,
                    children: [
                        ph && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: "",
                            children: ph
                        }, void 0, false, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 443,
                            columnNumber: 18
                        }, this),
                        options.map((o)=>typeof o === 'string' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: o,
                                children: o
                            }, o, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 445,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: o.id,
                                children: o.name
                            }, o.id, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 446,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/cases/page.js",
                    lineNumber: 440,
                    columnNumber: 9
                }, this),
                errors[key] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: '12px',
                        color: 'var(--danger)'
                    },
                    children: errors[key]
                }, void 0, false, {
                    fileName: "[project]/src/app/cases/page.js",
                    lineNumber: 449,
                    columnNumber: 25
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/cases/page.js",
            lineNumber: 438,
            columnNumber: 7
        }, this);
    };
    const inp = (key, label, placeholder, opts = {})=>{
        const { full, req, ...domProps } = opts;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `form-group ${full ? 'form-full' : ''}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "form-label",
                    children: [
                        req && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "form-required",
                            children: "*"
                        }, void 0, false, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 458,
                            columnNumber: 47
                        }, this),
                        label
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/cases/page.js",
                    lineNumber: 458,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    className: "form-input",
                    placeholder: placeholder,
                    value: form[key],
                    onChange: (e)=>setForm((p)=>({
                                ...p,
                                [key]: e.target.value
                            })),
                    style: errors[key] ? {
                        borderColor: 'var(--danger)'
                    } : {},
                    ...domProps
                }, void 0, false, {
                    fileName: "[project]/src/app/cases/page.js",
                    lineNumber: 459,
                    columnNumber: 9
                }, this),
                errors[key] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: '12px',
                        color: 'var(--danger)'
                    },
                    children: errors[key]
                }, void 0, false, {
                    fileName: "[project]/src/app/cases/page.js",
                    lineNumber: 462,
                    columnNumber: 25
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/cases/page.js",
            lineNumber: 457,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "modal-overlay",
        onClick: (e)=>e.target === e.currentTarget && onClose(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "modal",
            style: {
                maxWidth: '740px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-header",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-title",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "modal-title-icon",
                                    children: "⚖️"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cases/page.js",
                                    lineNumber: 472,
                                    columnNumber: 13
                                }, this),
                                caseItem ? 'تعديل بيانات القضية' : 'إضافة قضية جديدة'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 471,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "modal-close",
                            onClick: onClose,
                            children: "✕"
                        }, void 0, false, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 475,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/cases/page.js",
                    lineNumber: 470,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    id: "case-form",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-body",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-grid",
                                children: [
                                    inp('caseNumber', 'رقم القضية', 'مثال: 1234/2025', {
                                        req: true
                                    }),
                                    sel('caseType', 'نوع القضية', CASE_TYPES),
                                    sel('clientId', 'الموكل', clients, {
                                        req: true,
                                        placeholder: '-- اختر الموكل --'
                                    }),
                                    inp('opponentName', 'اسم الخصم', 'اسم الطرف الخصم', {
                                        req: true
                                    }),
                                    sel('caseClassification', 'تصنيف القضية', CLASSIFICATIONS),
                                    sel('caseDegree', 'درجة القضية', DEGREES)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 479,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 478,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-footer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "btn btn-primary",
                                    disabled: saving,
                                    id: "save-case-btn",
                                    children: saving ? '⏳ جارٍ الحفظ...' : caseItem ? '💾 حفظ التعديلات' : '➕ إضافة القضية'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cases/page.js",
                                    lineNumber: 489,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn btn-secondary",
                                    onClick: onClose,
                                    children: "إلغاء"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cases/page.js",
                                    lineNumber: 492,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 488,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/cases/page.js",
                    lineNumber: 477,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/cases/page.js",
            lineNumber: 469,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/cases/page.js",
        lineNumber: 468,
        columnNumber: 5
    }, this);
}
_s1(CaseModal, "k7d99Yx7NNcdFvYabpHQ3bDA4mE=");
_c2 = CaseModal;
// ══════════════════════════════════════════════════════════════
// MAIN CONTENT
// ══════════════════════════════════════════════════════════════
function CasesContent() {
    _s2();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$AppShell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const [cases, setCases] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [clients, setClients] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterType, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showModal, setModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingCase, setEdit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [detailCase, setDetail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null) // ← drawer
    ;
    const load = async ()=>{
        setLoading(true);
        try {
            const [c, cl] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCases"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClients"])()
            ]);
            setCases(c);
            setClients(cl);
        } catch (err) {
            showToast(err.message || 'فشل تحميل البيانات', 'error');
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CasesContent.useEffect": ()=>{
            load();
        }
    }["CasesContent.useEffect"], []);
    const clientMap = Object.fromEntries(clients.map((c)=>[
            c.id,
            c.name
        ]));
    const filtered = cases.filter((c)=>{
        const s = !search || (c.caseNumber || '').includes(search) || (clientMap[c.clientId] || '').includes(search) || (c.opponentName || '').includes(search);
        const t = !filterType || c.caseType === filterType;
        return s && t;
    });
    const handleSave = async (form)=>{
        setSaving(true);
        try {
            if (editingCase) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateCase"])(editingCase.id, form);
                showToast('تم تعديل بيانات القضية بنجاح');
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCase"])(form);
                showToast('تم إضافة القضية بنجاح');
            }
            setModal(false);
            setEdit(null);
            await load();
        } catch (err) {
            showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
        } finally{
            setSaving(false);
        }
    };
    const handleDelete = async (id)=>{
        if (!confirm('هل أنت متأكد من حذف هذه القضية؟')) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteCase"])(id);
            showToast('تم حذف القضية', 'error');
            if (detailCase?.id === id) setDetail(null);
            await load();
        } catch (err) {
            showToast(err.message || 'فشل الحذف', 'error');
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "page-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "page-header-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "page-header-breadcrumb",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "الرئيسية"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 567,
                                        columnNumber: 13
                                    }, this),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "›"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 567,
                                        columnNumber: 35
                                    }, this),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "active",
                                        children: "القضايا"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 567,
                                        columnNumber: 50
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 566,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "إدارة القضايا"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 569,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "جميع القضايا المسجلة في النظام (",
                                    cases.length,
                                    " قضية)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 570,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 565,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        id: "add-case-btn",
                        className: "btn btn-primary",
                        onClick: ()=>{
                            setEdit(null);
                            setModal(true);
                        },
                        children: "➕ إضافة قضية"
                    }, void 0, false, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 572,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/cases/page.js",
                lineNumber: 564,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "stats-grid cases-stats-grid",
                style: {
                    marginBottom: '24px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon gold",
                                children: "⚖️"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 580,
                                columnNumber: 36
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-info",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: cases.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 580,
                                        columnNumber: 103
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "إجمالي القضايا"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 580,
                                        columnNumber: 126
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 580,
                                columnNumber: 76
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 580,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon blue",
                                children: "📋"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 581,
                                columnNumber: 36
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-info",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: cases.filter((c)=>c.caseType === 'مدني').length
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 581,
                                        columnNumber: 103
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "القضايا المدنية"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 581,
                                        columnNumber: 161
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 581,
                                columnNumber: 76
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 581,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon red",
                                children: "⚡"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 582,
                                columnNumber: 36
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-info",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: cases.filter((c)=>c.caseType === 'جنائي').length
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 582,
                                        columnNumber: 101
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "القضايا الجنائية"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 582,
                                        columnNumber: 160
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 582,
                                columnNumber: 74
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 582,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon green",
                                children: "📅"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 583,
                                columnNumber: 36
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-info",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: cases.reduce((s, c)=>s + (c.numberOfSessions || 0), 0)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 583,
                                        columnNumber: 104
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "إجمالي الجلسات"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 583,
                                        columnNumber: 171
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 583,
                                columnNumber: 77
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 583,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/cases/page.js",
                lineNumber: 579,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "search-bar",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "search-input-wrapper",
                                style: {
                                    flex: 2
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "search-input-icon",
                                        children: "🔍"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 589,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "cases-search",
                                        className: "search-input",
                                        placeholder: "ابحث برقم القضية أو الموكل أو الخصم...",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 590,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 588,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "filter-case-type",
                                className: "form-select",
                                style: {
                                    width: '160px'
                                },
                                value: filterType,
                                onChange: (e)=>setFilter(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "كل الأنواع"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 596,
                                        columnNumber: 13
                                    }, this),
                                    CASE_TYPES.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: t,
                                            children: t
                                        }, t, false, {
                                            fileName: "[project]/src/app/cases/page.js",
                                            lineNumber: 597,
                                            columnNumber: 34
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 594,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 587,
                        columnNumber: 9
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "empty-state",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '36px'
                                },
                                children: "⏳"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 602,
                                columnNumber: 40
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "جارٍ تحميل البيانات..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 602,
                                columnNumber: 81
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 602,
                        columnNumber: 11
                    }, this) : filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "empty-state",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "empty-state-icon",
                                children: "⚖️"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 605,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: "لا توجد قضايا"
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 606,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: search || filterType ? 'لا توجد نتائج مطابقة' : 'ابدأ بتسجيل أول قضية'
                            }, void 0, false, {
                                fileName: "[project]/src/app/cases/page.js",
                                lineNumber: 607,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 604,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "table-wrapper",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "#"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 613,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "رقم القضية"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 613,
                                                columnNumber: 27
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "نوع القضية"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 613,
                                                columnNumber: 46
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "الموكل"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 613,
                                                columnNumber: 65
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "الخصم"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 614,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "التصنيف"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 614,
                                                columnNumber: 31
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "الدرجة"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 614,
                                                columnNumber: 47
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "الجلسات"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 614,
                                                columnNumber: 62
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "الإجراءات"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cases/page.js",
                                                lineNumber: 614,
                                                columnNumber: 78
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cases/page.js",
                                        lineNumber: 612,
                                        columnNumber: 22
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cases/page.js",
                                    lineNumber: 612,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: filtered.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            onClick: ()=>setDetail(c),
                                            style: {
                                                cursor: 'pointer',
                                                background: detailCase?.id === c.id ? 'rgba(192,57,43,0.05)' : undefined,
                                                borderRight: detailCase?.id === c.id ? '3px solid #c0392b' : '3px solid transparent'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "td-secondary",
                                                    children: i + 1
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 627,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: '800',
                                                            color: '#c0392b',
                                                            fontSize: '14px'
                                                        },
                                                        children: c.caseNumber
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cases/page.js",
                                                        lineNumber: 629,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 628,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `badge ${typeBadge(c.caseType)}`,
                                                        children: c.caseType
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cases/page.js",
                                                        lineNumber: 633,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 633,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        fontWeight: '600'
                                                    },
                                                    children: clientMap[c.clientId] || '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 634,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "td-secondary",
                                                    children: c.opponentName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 635,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-blue",
                                                        children: c.caseClassification
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cases/page.js",
                                                        lineNumber: 636,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 636,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "td-secondary",
                                                    children: c.caseDegree
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 637,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-gold",
                                                        children: c.numberOfSessions || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cases/page.js",
                                                        lineNumber: 638,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 638,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "td-actions",
                                                        onClick: (e)=>e.stopPropagation(),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn btn-secondary btn-sm btn-icon",
                                                                onClick: ()=>{
                                                                    setEdit(c);
                                                                    setModal(true);
                                                                },
                                                                title: "تعديل",
                                                                id: `edit-case-${c.id}`,
                                                                children: "✏️"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/cases/page.js",
                                                                lineNumber: 641,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn btn-danger btn-sm btn-icon",
                                                                onClick: ()=>handleDelete(c.id),
                                                                title: "حذف",
                                                                id: `delete-case-${c.id}`,
                                                                children: "🗑️"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/cases/page.js",
                                                                lineNumber: 644,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/cases/page.js",
                                                        lineNumber: 640,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cases/page.js",
                                                    lineNumber: 639,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, c.id, true, {
                                            fileName: "[project]/src/app/cases/page.js",
                                            lineNumber: 618,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cases/page.js",
                                    lineNumber: 616,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cases/page.js",
                            lineNumber: 611,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/cases/page.js",
                        lineNumber: 610,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/cases/page.js",
                lineNumber: 586,
                columnNumber: 7
            }, this),
            showModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CaseModal, {
                caseItem: editingCase,
                clients: clients,
                onClose: ()=>{
                    setModal(false);
                    setEdit(null);
                },
                onSave: handleSave,
                saving: saving
            }, void 0, false, {
                fileName: "[project]/src/app/cases/page.js",
                lineNumber: 659,
                columnNumber: 9
            }, this),
            detailCase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CaseDrawer, {
                caseItem: detailCase,
                clientName: clientMap[detailCase.clientId],
                onClose: ()=>setDetail(null),
                onEdit: (c)=>{
                    setEdit(c);
                    setModal(true);
                },
                onUploadDone: ()=>load(),
                showToast: showToast
            }, void 0, false, {
                fileName: "[project]/src/app/cases/page.js",
                lineNumber: 670,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s2(CasesContent, "VFjUoHhbGDWSJKWHsGhaLdSxIdA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$AppShell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"]
    ];
});
_c3 = CasesContent;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "CasesPage");
__turbopack_context__.k.register(_c1, "CaseDrawer");
__turbopack_context__.k.register(_c2, "CaseModal");
__turbopack_context__.k.register(_c3, "CasesContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_cases_page_0~ir59_.js.map