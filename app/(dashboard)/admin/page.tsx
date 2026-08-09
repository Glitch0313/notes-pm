'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteReviewStatus, PurchaseStatus } from '@/types'

interface AdminStats {
  totalUsers: number; totalNotes: number; totalPublicNotes: number
  totalDownloads: number; totalPurchases: number
  recentUsers: { id: string; username: string; fullName: string | null; email: string; role: string; avatarColor: string; createdAt: string }[]
  recentNotes: { id: string; title: string; visibility: string; downloads: number; createdAt: string; author: { username: string; fullName: string | null } }[]
  topAuthors: { id: string; username: string; fullName: string | null; avatarColor: string; _count: { notes: number } }[]
}

interface AdminUser {
  id: string; username: string; email: string; fullName: string | null
  role: 'USER' | 'ADMIN'; isActive: boolean; avatarColor: string; createdAt: string
  _count: { notes: number; purchases: number }
}

interface PendingPurchase {
  id: string; noteId: string; noteTitle: string; price: number
  status: PurchaseStatus; createdAt: string
  buyer: { id: string; username: string; fullName: string | null; avatarColor: string }
}

interface AdminArticle {
  id: string; title: string; content: string; category: string
  coverImage: string | null; reviewStatus: NoteReviewStatus; reviewNote: string | null
  canShare: boolean
  createdAt: string
  author: { id: string; username: string; fullName: string | null; avatarColor: string }
}

interface SiteSettings {
  site_name: string; site_description: string; admin_whatsapp: string
  require_approval: string; allow_register: string
  gemini_api_key?: string; gemini_model?: string
}

const VISIBILITY_LABELS: Record<string, string> = { PRIVATE: 'خاصة', PUBLIC: 'عامة', FOR_SALE: 'للبيع' }

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl ${color} shadow-sm shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{value.toLocaleString('ar-SA')}</p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats]       = useState<AdminStats | null>(null)
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [search, setSearch]     = useState('')
  const [tab, setTab]           = useState<'overview' | 'users' | 'payments' | 'articles' | 'settings' | 'database'>('overview')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  // users filters & actions state
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL')
  const [usersPage, setUsersPage] = useState(1)
  const [actioningUserId, setActioningUserId] = useState<string | null>(null)
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [usersMsg, setUsersMsg] = useState('')

  // payments state
  const [purchases, setPurchases]   = useState<PendingPurchase[]>([])
  const [payFilter, setPayFilter]   = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [payMsg, setPayMsg]         = useState('')

  // articles state
  const [articles, setArticles]       = useState<AdminArticle[]>([])
  const [artFilter, setArtFilter]     = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_EDIT'>('PENDING')
  const [artActionId, setArtActionId] = useState<string | null>(null)
  const [artMsg, setArtMsg]           = useState('')
  const [artNote, setArtNote]         = useState<Record<string, string>>({})
  const [aiReview, setAiReview]       = useState<Record<string, string>>({})
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  // settings state
  const [settings, setSettings]       = useState<SiteSettings>({ site_name: '', site_description: '', admin_whatsapp: '', require_approval: 'false', allow_register: 'true', gemini_api_key: '', gemini_model: 'gemini-3.5-flash-lite' })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMsg, setSettingsMsg]   = useState('')
  const [testAiMsg, setTestAiMsg]       = useState('')

  // format-notes state
  const [formatting, setFormatting] = useState(false)
  const [formatMsg, setFormatMsg]   = useState('')

  // database explorer state
  type DbTable = 'User' | 'Note' | 'Notification' | 'Purchase' | 'Setting'
  const [dbTable, setDbTable]         = useState<DbTable>('User')
  const [dbRows, setDbRows]           = useState<Record<string, unknown>[]>([])
  const [dbTotal, setDbTotal]         = useState(0)
  const [dbPage, setDbPage]           = useState(1)
  const [dbSearch, setDbSearch]       = useState('')
  const [dbEditable, setDbEditable]   = useState<string[]>([])
  const [dbLoading, setDbLoading]     = useState(false)
  const [dbMsg, setDbMsg]             = useState('')
  const [dbEditRow, setDbEditRow]     = useState<Record<string, unknown> | null>(null)
  const [dbEditData, setDbEditData]   = useState<Record<string, unknown>>({})
  const [dbDeleteId, setDbDeleteId]   = useState<string | null>(null)
  const [dbSaving, setDbSaving]       = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (!data.authenticated || data.role !== 'ADMIN') router.replace('/dashboard') })
      .catch(() => router.replace('/dashboard'))
  }, [router])

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { if (data.success) setStats(data.data); else setError(data.error) })
      .catch(() => setError('فشل تحميل الإحصائيات'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab !== 'users') return
    const params = new URLSearchParams({ search, page: String(usersPage), role: roleFilter, status: statusFilter })
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(data => { if (data.success) { setUsers(data.data.users); setUsersTotal(data.data.total) } })
  }, [tab, search, roleFilter, statusFilter, usersPage])

  const loadPurchases = useCallback((status: string) => {
    fetch(`/api/admin/purchases?status=${status}`)
      .then(r => r.json())
      .then(data => { if (data.success) setPurchases(data.data.purchases) })
  }, [])

  const loadArticles = useCallback((status: string) => {
    fetch(`/api/admin/articles?status=${status}`)
      .then(r => r.json())
      .then(data => { if (data.success) setArticles(data.data.notes) })
  }, [])

  useEffect(() => {
    if (tab === 'payments') loadPurchases(payFilter)
  }, [tab, payFilter, loadPurchases])

  useEffect(() => {
    if (tab === 'articles') loadArticles(artFilter)
  }, [tab, artFilter, loadArticles])

  useEffect(() => {
    if (tab !== 'settings') return
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => { if (data.success) setSettings(s => ({ ...s, ...data.data.settings })) })
  }, [tab])

  const loadDbData = useCallback((table: string, page: number, search: string) => {
    setDbLoading(true)
    setDbMsg('')
    const params = new URLSearchParams({ table, page: String(page), search })
    fetch(`/api/admin/db?${params}`)
      .then(async r => {
        const text = await r.text()
        try { return JSON.parse(text) }
        catch { throw new Error(`استجابة غير صالحة (${r.status})`) }
      })
      .then(data => {
        if (data.success) {
          setDbRows(data.data.rows)
          setDbTotal(data.data.total)
          setDbEditable(data.data.editableFields)
        } else {
          setDbMsg(data.error || 'فشل تحميل البيانات')
        }
      })
      .catch((e: Error) => setDbMsg(`تعذّر الاتصال: ${e.message}`))
      .finally(() => setDbLoading(false))
  }, [])

  useEffect(() => {
    if (tab !== 'database') return
    loadDbData(dbTable, dbPage, dbSearch)
  }, [tab, dbTable, dbPage, dbSearch, loadDbData])

  async function handleDecision(id: string, status: 'APPROVED' | 'REJECTED') {
    setActioningId(id)
    setPayMsg('')
    try {
      const res = await fetch(`/api/admin/purchases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (json.success) {
        setPayMsg(status === 'APPROVED' ? '✅ تم تأكيد الدفع وإشعار المشتري' : '❌ تم رفض الطلب')
        loadPurchases(payFilter)
      } else {
        setPayMsg(json.error || 'حدث خطأ')
      }
    } catch {
      setPayMsg('تعذّر الاتصال')
    } finally {
      setActioningId(null)
    }
  }

  async function handleArticleDecision(id: string, status: 'APPROVED' | 'REJECTED' | 'NEEDS_EDIT') {
    setArtActionId(id)
    setArtMsg('')
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: artNote[id] || undefined }),
      })
      const json = await res.json()
      if (json.success) {
        const msgs: Record<string, string> = { APPROVED: '✅ تم قبول المقال', REJECTED: '❌ تم رفض المقال', NEEDS_EDIT: '✏️ أُرسل للتعديل' }
        setArtMsg(msgs[status])
        loadArticles(artFilter)
      } else {
        setArtMsg(json.error || 'حدث خطأ')
      }
    } catch {
      setArtMsg('تعذّر الاتصال')
    } finally {
      setArtActionId(null)
    }
  }

  async function handleShareToggle(id: string, canShare: boolean) {
    setArtActionId(id)
    try {
      const res = await fetch(`/api/admin/articles/${id}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canShare }),
      })
      const json = await res.json()
      if (json.success) {
        setArticles(prev => prev.map(a => a.id === id ? { ...a, canShare } : a))
        setArtMsg(canShare ? '✅ تم تفعيل الشير للمقال' : '🚫 تم تعطيل الشير للمقال')
        setTimeout(() => setArtMsg(''), 2000)
      }
    } catch {
      setArtMsg('تعذّر الاتصال')
    } finally {
      setArtActionId(null)
    }
  }

  async function handleAIReview(article: AdminArticle) {
    setReviewingId(article.id)
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review', content: article.content, title: article.title }),
      })
      const json = await res.json()
      if (json.success) setAiReview(prev => ({ ...prev, [article.id]: json.data.result }))
    } catch {
      setAiReview(prev => ({ ...prev, [article.id]: 'تعذّر الحصول على تقييم AI' }))
    } finally {
      setReviewingId(null)
    }
  }

  async function handleSaveSettings() {
    setSettingsSaving(true)
    setSettingsMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const json = await res.json()
      setSettingsMsg(json.success ? '✅ تم حفظ الإعدادات' : json.error || 'حدث خطأ')
    } catch {
      setSettingsMsg('تعذّر الاتصال')
    } finally {
      setSettingsSaving(false)
    }
  }

  async function handleDbSave() {
    if (!dbEditRow) return
    setDbSaving(true)
    setDbMsg('')
    const pkField = dbTable === 'Setting' ? 'key' : 'id'
    const id = String(dbEditRow[pkField])
    try {
      const res = await fetch(`/api/admin/db?table=${dbTable}&id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbEditData),
      })
      const json = await res.json()
      if (json.success) {
        setDbMsg('✅ تم الحفظ بنجاح')
        setDbEditRow(null)
        setDbEditData({})
        loadDbData(dbTable, dbPage, dbSearch)
      } else {
        setDbMsg(json.error || 'فشل الحفظ')
      }
    } catch {
      setDbMsg('تعذّر الاتصال')
    } finally {
      setDbSaving(false)
      setTimeout(() => setDbMsg(''), 3000)
    }
  }

  async function handleDbDelete(id: string) {
    setDbSaving(true)
    setDbMsg('')
    try {
      const res = await fetch(`/api/admin/db?table=${dbTable}&id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setDbMsg('✅ تم الحذف')
        setDbDeleteId(null)
        loadDbData(dbTable, dbPage, dbSearch)
      } else {
        setDbMsg(json.error || 'فشل الحذف')
      }
    } catch {
      setDbMsg('تعذّر الاتصال')
    } finally {
      setDbSaving(false)
      setTimeout(() => setDbMsg(''), 3000)
    }
  }

  async function handleFormatNotes() {
    setFormatting(true)
    setFormatMsg('')
    try {
      const res  = await fetch('/api/admin/format-notes', { method: 'POST' })
      const json = await res.json()
      setFormatMsg(json.success ? json.data.message : json.error || 'حدث خطأ')
    } catch {
      setFormatMsg('تعذّر الاتصال')
    } finally {
      setFormatting(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: 'USER' | 'ADMIN') {
    setActioningUserId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const json = await res.json()
      if (json.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        setUsersMsg(newRole === 'ADMIN' ? '✅ تم منح صلاحية الأدمن' : '✅ تم سحب صلاحية الأدمن')
      } else { setUsersMsg(json.error || 'حدث خطأ') }
    } catch { setUsersMsg('تعذّر الاتصال') }
    finally { setActioningUserId(null); setTimeout(() => setUsersMsg(''), 3000) }
  }

  async function handleStatusChange(userId: string, isActive: boolean) {
    setActioningUserId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      const json = await res.json()
      if (json.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive } : u))
        setUsersMsg(isActive ? '✅ تم تفعيل الحساب' : '✅ تم تعطيل الحساب')
      } else { setUsersMsg(json.error || 'حدث خطأ') }
    } catch { setUsersMsg('تعذّر الاتصال') }
    finally { setActioningUserId(null); setTimeout(() => setUsersMsg(''), 3000) }
  }

  async function handleDeleteUser(userId: string) {
    setActioningUserId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        setUsersTotal(prev => prev - 1)
        setUsersMsg('✅ تم حذف المستخدم')
        setDeleteConfirmUser(null)
        setDeleteInput('')
      } else { setUsersMsg(json.error || 'حدث خطأ') }
    } catch { setUsersMsg('تعذّر الاتصال') }
    finally { setActioningUserId(null); setTimeout(() => setUsersMsg(''), 3000) }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-32" dir="rtl">
      <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="max-w-xl mx-auto mt-16 text-center" dir="rtl">
      <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">{error}</p>
    </div>
  )

  const TABS = [
    { key: 'overview',  label: 'نظرة عامة',   icon: '📊' },
    { key: 'articles',  label: 'المقالات',     icon: '📄' },
    { key: 'payments',  label: 'المدفوعات',    icon: '💬' },
    { key: 'users',     label: 'المستخدمون',   icon: '👥' },
    { key: 'database',  label: 'قاعدة البيانات', icon: '🗄️' },
    { key: 'settings',  label: 'الإعدادات',    icon: '⚙️' },
  ]

  const DB_TABLES: { key: DbTable; label: string; icon: string }[] = [
    { key: 'User',         label: 'المستخدمون',  icon: '👤' },
    { key: 'Note',         label: 'المذكرات',    icon: '📝' },
    { key: 'Notification', label: 'الإشعارات',   icon: '🔔' },
    { key: 'Purchase',     label: 'المشتريات',   icon: '💰' },
    { key: 'Setting',      label: 'الإعدادات',   icon: '⚙️' },
  ]

  const COL_LABELS: Record<string, string> = {
    id: 'المعرف', key: 'المفتاح', username: 'اسم المستخدم', email: 'البريد',
    fullName: 'الاسم الكامل', role: 'الدور', isActive: 'نشط', avatarColor: 'اللون',
    bio: 'النبذة', createdAt: 'التاريخ', updatedAt: 'آخر تحديث',
    title: 'العنوان', category: 'الفئة', visibility: 'الظهور', reviewStatus: 'حالة المراجعة',
    downloads: 'التحميلات', isPinned: 'مثبتة', isPublic: 'عامة', price: 'السعر',
    tags: 'الوسوم', coverColor: 'لون الغلاف', coverImage: 'صورة الغلاف', authorId: 'المؤلف',
    type: 'النوع', message: 'الرسالة', isRead: 'مقروءة', userId: 'المستخدم',
    status: 'الحالة', buyerId: 'المشتري', sellerId: 'البائع', noteId: 'المذكرة',
    value: 'القيمة',
  }

  // Columns to show in the table view (subset of all columns)
  const TABLE_DISPLAY_COLS: Record<DbTable, string[]> = {
    User:         ['username', 'email', 'fullName', 'role', 'isActive', 'createdAt'],
    Note:         ['title', 'category', 'visibility', 'reviewStatus', 'downloads', 'authorId'],
    Notification: ['type', 'message', 'isRead', 'userId', 'createdAt'],
    Purchase:     ['price', 'status', 'buyerId', 'noteId', 'createdAt'],
    Setting:      ['key', 'value', 'updatedAt'],
  }

  return (
    <div className="max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl shrink-0">🛡️</div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">لوحة الأدمن</h1>
            <p className="text-xs sm:text-sm text-gray-500">إدارة المنصة والمستخدمين</p>
          </div>
        </div>
        {/* Format Notes button */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {formatMsg && <span className="text-xs sm:text-sm text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl">{formatMsg}</span>}
          <button
            onClick={handleFormatNotes}
            disabled={formatting}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition shadow-sm active:scale-95"
          >
            {formatting ? '⏳' : '✨'} تنسيق تلقائي للنوتس
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 sm:gap-2 mb-6 border-b border-gray-100 overflow-x-auto no-scrollbar scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl border-b-2 whitespace-nowrap shrink-0 transition-colors ${
              tab === t.key ? 'border-red-500 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard label="المستخدمون"  value={stats.totalUsers}       icon="👥" color="bg-blue-50" />
            <StatCard label="المذكرات"    value={stats.totalNotes}       icon="📝" color="bg-indigo-50" />
            <StatCard label="المنشورة"    value={stats.totalPublicNotes} icon="🌐" color="bg-green-50" />
            <StatCard label="التحميلات"   value={stats.totalDownloads}   icon="⬇️" color="bg-amber-50" />
            <StatCard label="المبيعات"    value={stats.totalPurchases}   icon="💰" color="bg-purple-50" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">آخر المستخدمين</h2>
              <ul className="space-y-3">
                {stats.recentUsers.map((u, idx) => (
                  <li key={u.id ?? idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: u.avatarColor }}>
                      {(u.fullName || u.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.fullName || u.username}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    {u.role === 'ADMIN' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">أدمن</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">آخر المذكرات</h2>
              <ul className="space-y-3">
                {stats.recentNotes.map((n, idx) => (
                  <li key={n.id ?? idx} className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                      <p className="text-xs text-gray-400">{n.author.fullName || n.author.username} · {VISIBILITY_LABELS[n.visibility]}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{n.downloads}⬇️</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">أكثر الكتّاب نشاطاً</h2>
              <ol className="space-y-3">
                {stats.topAuthors.map((a, i) => (
                  <li key={a.id ?? i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: a.avatarColor }}>
                      {(a.fullName || a.username).charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm text-gray-800 truncate">{a.fullName || a.username}</span>
                    <span className="text-sm font-semibold text-indigo-600 shrink-0">{a._count.notes} 📝</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ── Payments ── */}
      {tab === 'payments' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2 flex-wrap items-center">
            {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
              <button key={s} onClick={() => setPayFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  payFilter === s
                    ? s === 'PENDING'  ? 'bg-amber-100 text-amber-700'
                    : s === 'APPROVED' ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s === 'PENDING' ? '⏳ معلقة' : s === 'APPROVED' ? '✅ مؤكدة' : '❌ مرفوضة'}
              </button>
            ))}
            {payMsg && (
              <span className={`text-sm px-3 py-1.5 rounded-xl border ${
                payMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>{payMsg}</span>
            )}
          </div>

          {purchases.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              لا توجد طلبات {payFilter === 'PENDING' ? 'معلقة' : payFilter === 'APPROVED' ? 'مؤكدة' : 'مرفوضة'}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">المشتري</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">المذكرة</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">السعر</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">التاريخ</th>
                    {payFilter === 'PENDING' && <th className="text-right px-4 py-3 font-medium text-gray-600">إجراء</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {purchases.map((p, idx) => (
                    <tr key={p.id ?? idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: p.buyer.avatarColor }}>
                            {(p.buyer.fullName || p.buyer.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{p.buyer.fullName || p.buyer.username}</p>
                            <p className="text-xs text-gray-400">@{p.buyer.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">{p.noteTitle}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">{p.price?.toString()} ج.م</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString('ar-SA')}</td>
                      {payFilter === 'PENDING' && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecision(p.id, 'APPROVED')}
                              disabled={actioningId === p.id}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition"
                            >
                              ✅ تأكيد
                            </button>
                            <button
                              onClick={() => handleDecision(p.id, 'REJECTED')}
                              disabled={actioningId === p.id}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition"
                            >
                              ❌ رفض
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          {/* Search + message */}
          <div className="flex items-center gap-3 flex-wrap">
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setUsersPage(1) }}
              placeholder="ابحث بالاسم أو البريد..."
              className="flex-1 max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            <span className="text-sm text-gray-500">{usersTotal} مستخدم</span>
            {usersMsg && (
              <span className={`text-sm px-3 py-1.5 rounded-xl border ${usersMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {usersMsg}
              </span>
            )}
          </div>

          {/* Role filter */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500 self-center">الدور:</span>
            {(['ALL', 'USER', 'ADMIN'] as const).map(r => (
              <button key={r} onClick={() => { setRoleFilter(r); setUsersPage(1) }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${roleFilter === r ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {r === 'ALL' ? 'الكل' : r === 'ADMIN' ? '🛡️ أدمن' : '👤 مستخدم'}
              </button>
            ))}
            <span className="text-xs text-gray-500 self-center mr-2">الحالة:</span>
            {(['ALL', 'active', 'inactive'] as const).map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setUsersPage(1) }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${statusFilter === s ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {s === 'ALL' ? 'الكل' : s === 'active' ? '🟢 نشط' : '🔴 معطل'}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المستخدم</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">البريد</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الدور</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المذكرات</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u, idx) => (
                  <tr key={u.id ?? idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: u.avatarColor }}>
                          {(u.fullName || u.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.fullName || u.username}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role === 'ADMIN' ? '🛡️ أدمن' : '👤 مستخدم'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? '🟢 نشط' : '🔴 معطل'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{u._count.notes}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleRoleChange(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                          disabled={actioningUserId === u.id}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg disabled:opacity-50 transition ${u.role === 'ADMIN' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          {u.role === 'ADMIN' ? 'سحب الأدمن' : 'منح أدمن'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(u.id, !u.isActive)}
                          disabled={actioningUserId === u.id}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg disabled:opacity-50 transition ${u.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          {u.isActive ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => { setDeleteConfirmUser(u); setDeleteInput('') }}
                          disabled={actioningUserId === u.id}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">لا توجد نتائج</div>}
          </div>

          {/* Pagination */}
          {usersTotal > 20 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage === 1}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                السابق
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">صفحة {usersPage}</span>
              <button onClick={() => setUsersPage(p => p + 1)} disabled={usersPage * 20 >= usersTotal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                التالي
              </button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" dir="rtl">
                <h3 className="text-base font-bold text-gray-900 mb-2">تأكيد حذف المستخدم</h3>
                <p className="text-sm text-gray-500 mb-4">
                  هذا الإجراء لا يمكن التراجع عنه. اكتب اسم المستخدم <span className="font-semibold text-gray-800">@{deleteConfirmUser.username}</span> للتأكيد:
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder={deleteConfirmUser.username}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteUser(deleteConfirmUser.id)}
                    disabled={deleteInput !== deleteConfirmUser.username || actioningUserId === deleteConfirmUser.id}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition"
                  >
                    {actioningUserId === deleteConfirmUser.id ? 'جارٍ الحذف…' : 'حذف نهائي'}
                  </button>
                  <button
                    onClick={() => { setDeleteConfirmUser(null); setDeleteInput('') }}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Articles ── */}
      {tab === 'articles' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2 flex-wrap items-center">
            {(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_EDIT'] as const).map((s) => (
              <button key={s} onClick={() => setArtFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  artFilter === s
                    ? s === 'PENDING'    ? 'bg-amber-100 text-amber-700'
                    : s === 'APPROVED'   ? 'bg-green-100 text-green-700'
                    : s === 'REJECTED'   ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s === 'PENDING' ? '⏳ معلقة' : s === 'APPROVED' ? '✅ مقبولة' : s === 'REJECTED' ? '❌ مرفوضة' : '✏️ تحتاج تعديل'}
              </button>
            ))}
            {artMsg && (
              <span className={`text-sm px-3 py-1.5 rounded-xl border ${
                artMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border-green-100'
                : artMsg.startsWith('❌') ? 'bg-red-50 text-red-700 border-red-100'
                : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>{artMsg}</span>
            )}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              لا توجد مقالات في هذه الحالة
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((a, idx) => (
                <div key={a.id ?? idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  {/* Article header */}
                  <div className="flex items-start gap-3">
                    {a.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.coverImage} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base leading-snug">{a.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: a.author.avatarColor }}>
                          {(a.author.fullName || a.author.username).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500">{a.author.fullName || a.author.username}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full shrink-0">{a.category}</span>
                  </div>

                  {/* Content preview */}
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                    {a.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250)}…
                  </p>

                  {/* AI Review result */}
                  {aiReview[a.id] && (
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-violet-700 mb-1">🤖 تقييم AI</p>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{aiReview[a.id]}</p>
                    </div>
                  )}

                  {/* Note input for rejection/needs-edit */}
                  {artFilter === 'PENDING' && (
                    <input
                      type="text"
                      value={artNote[a.id] || ''}
                      onChange={(e) => setArtNote(prev => ({ ...prev, [a.id]: e.target.value }))}
                      placeholder="ملاحظة للكاتب (اختياري عند الرفض أو طلب التعديل)..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Share Toggle */}
                    <button
                      onClick={() => handleShareToggle(a.id, !a.canShare)}
                      disabled={artActionId === a.id}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                        a.canShare ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {a.canShare ? '🔓 متاح للشير' : '🔒 الشير معطل'}
                    </button>

                    {artFilter === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAIReview(a)}
                          disabled={reviewingId === a.id}
                          className="px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-medium rounded-lg disabled:opacity-50 transition"
                        >
                          {reviewingId === a.id ? '⏳ جارٍ التقييم…' : '🤖 تقييم AI'}
                        </button>
                        <button
                          onClick={() => handleArticleDecision(a.id, 'APPROVED')}
                          disabled={artActionId === a.id}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition"
                        >
                          ✅ قبول
                        </button>
                        <button
                          onClick={() => handleArticleDecision(a.id, 'NEEDS_EDIT')}
                          disabled={artActionId === a.id}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition"
                        >
                          ✏️ يحتاج تعديل
                        </button>
                        <button
                          onClick={() => handleArticleDecision(a.id, 'REJECTED')}
                          disabled={artActionId === a.id}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition"
                        >
                          ❌ رفض
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Database Explorer ── */}
      {tab === 'database' && (
        <div className="space-y-4">
          {/* Table Selector */}
          <div className="flex gap-2 flex-wrap">
            {DB_TABLES.map(t => (
              <button
                key={t.key}
                onClick={() => { setDbTable(t.key); setDbPage(1); setDbSearch('') }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  dbTable === t.key ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* Search + status */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={dbSearch}
              onChange={e => { setDbSearch(e.target.value); setDbPage(1) }}
              placeholder="بحث..."
              className="flex-1 max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <span className="text-sm text-gray-500">{dbTotal.toLocaleString('ar-SA')} سجل</span>
            {dbMsg && (
              <span className={`text-sm px-3 py-1.5 rounded-xl border ${
                dbMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>{dbMsg}</span>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            {dbLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : dbRows.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">لا توجد بيانات</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {TABLE_DISPLAY_COLS[dbTable].map(col => (
                      <th key={col} className="text-right px-3 py-3 font-medium text-gray-600 whitespace-nowrap">
                        {COL_LABELS[col] ?? col}
                      </th>
                    ))}
                    <th className="text-right px-3 py-3 font-medium text-gray-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dbRows.map((row, idx) => {
                    const pkField = dbTable === 'Setting' ? 'key' : 'id'
                    const pkValue = row[pkField]
                    const rowId = pkValue !== undefined && pkValue !== null ? String(pkValue) : undefined
                    return (
                      <tr key={rowId ?? idx} className="hover:bg-gray-50 transition-colors">
                        {TABLE_DISPLAY_COLS[dbTable].map(col => {
                          const val = row[col]
                          let display: string
                          if (val === null || val === undefined) display = '—'
                          else if (typeof val === 'boolean') display = val ? '✅' : '❌'
                          else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/))
                            display = new Date(val).toLocaleDateString('ar-SA')
                          else display = String(val).slice(0, 60)
                          return (
                            <td key={col} className="px-3 py-3 text-gray-700 max-w-[180px] truncate" title={String(val ?? '')}>
                              {display}
                            </td>
                          )
                        })}
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { setDbEditRow(row); setDbEditData(Object.fromEntries(dbEditable.map(f => [f, row[f]]))) }}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => setDbDeleteId(rowId ?? null)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {dbTotal > 20 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setDbPage(p => Math.max(1, p - 1))} disabled={dbPage === 1}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                السابق
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                صفحة {dbPage} / {Math.ceil(dbTotal / 20)}
              </span>
              <button onClick={() => setDbPage(p => p + 1)} disabled={dbPage * 20 >= dbTotal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                التالي
              </button>
            </div>
          )}

          {/* Edit Modal */}
          {dbEditRow && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-gray-900">تعديل سجل — {dbTable}</h3>
                  <button onClick={() => { setDbEditRow(null); setDbEditData({}) }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>

                {/* Read-only info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
                  {TABLE_DISPLAY_COLS[dbTable].filter(c => !dbEditable.includes(c)).map(col => (
                    <div key={col} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 w-28 shrink-0">{COL_LABELS[col] ?? col}</span>
                      <span className="text-gray-700 font-mono truncate">{String(dbEditRow[col] ?? '—').slice(0, 80)}</span>
                    </div>
                  ))}
                </div>

                {/* Editable fields */}
                <div className="space-y-3">
                  {dbEditable.map(field => {
                    const val = dbEditData[field]
                    // Boolean field → toggle
                    if (typeof val === 'boolean' || (val === undefined && typeof dbEditRow[field] === 'boolean')) {
                      const bval = val === undefined ? Boolean(dbEditRow[field]) : Boolean(val)
                      return (
                        <div key={field} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                          <span className="text-sm font-medium text-gray-700">{COL_LABELS[field] ?? field}</span>
                          <button
                            type="button"
                            onClick={() => setDbEditData(d => ({ ...d, [field]: !bval }))}
                            className={`relative w-10 h-5 rounded-full transition-colors ${bval ? 'bg-indigo-500' : 'bg-gray-200'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${bval ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0'}`} />
                          </button>
                        </div>
                      )
                    }
                    // Enum-like fields → select
                    const enumOptions: Record<string, string[]> = {
                      role: ['USER', 'ADMIN'],
                      visibility: ['PRIVATE', 'PUBLIC', 'FOR_SALE'],
                      reviewStatus: ['APPROVED', 'PENDING', 'REJECTED', 'NEEDS_EDIT'],
                      status: ['PENDING', 'APPROVED', 'REJECTED'],
                      category: ['GENERAL', 'TECHNOLOGY', 'SCIENCE', 'LITERATURE', 'PHILOSOPHY', 'HISTORY', 'ART', 'BUSINESS'],
                    }
                    if (enumOptions[field]) {
                      return (
                        <div key={field} className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">{COL_LABELS[field] ?? field}</label>
                          <select
                            value={String(val ?? dbEditRow[field] ?? '')}
                            onChange={e => setDbEditData(d => ({ ...d, [field]: e.target.value }))}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          >
                            {enumOptions[field].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      )
                    }
                    // Default: text input
                    return (
                      <div key={field} className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">{COL_LABELS[field] ?? field}</label>
                        <input
                          type="text"
                          value={val === null || val === undefined ? '' : String(val)}
                          onChange={e => setDbEditData(d => ({ ...d, [field]: e.target.value || null }))}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-2 mt-5">
                  <button
                    onClick={handleDbSave}
                    disabled={dbSaving}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition"
                  >
                    {dbSaving ? '⏳ جارٍ الحفظ…' : 'حفظ التغييرات'}
                  </button>
                  <button
                    onClick={() => { setDbEditRow(null); setDbEditData({}) }}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {dbDeleteId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" dir="rtl">
                <h3 className="text-base font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
                <p className="text-sm text-gray-500 mb-5">
                  سيتم حذف السجل <span className="font-mono font-semibold text-gray-800 text-xs">{dbDeleteId}</span> من جدول <strong>{dbTable}</strong> بشكل نهائي.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDbDelete(dbDeleteId)}
                    disabled={dbSaving}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition"
                  >
                    {dbSaving ? '⏳ جارٍ الحذف…' : 'حذف نهائي'}
                  </button>
                  <button
                    onClick={() => setDbDeleteId(null)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Settings ── */}
      {tab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-800">إعدادات الموقع</h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">اسم الموقع</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings(s => ({ ...s, site_name: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">وصف الموقع</label>
              <input
                type="text"
                value={settings.site_description}
                onChange={(e) => setSettings(s => ({ ...s, site_description: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">رقم واتساب الأدمن</label>
              <input
                type="text"
                value={settings.admin_whatsapp}
                onChange={(e) => setSettings(s => ({ ...s, admin_whatsapp: e.target.value }))}
                placeholder="966XXXXXXXXX"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 font-mono"
                dir="ltr"
              />
              <p className="text-xs text-gray-400">الصيغة: رمز الدولة + الرقم بدون + (مثال: 966501234567)</p>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-800">مراجعة المقالات قبل النشر</p>
                <p className="text-xs text-gray-400 mt-0.5">تتطلب موافقة الأدمن قبل ظهور المقالات العامة</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, require_approval: s.require_approval === 'true' ? 'false' : 'true' }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.require_approval === 'true' ? 'bg-red-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.require_approval === 'true' ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-800">السماح بالتسجيل</p>
                <p className="text-xs text-gray-400 mt-0.5">السماح للمستخدمين الجدد بإنشاء حسابات</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, allow_register: s.allow_register === 'true' ? 'false' : 'true' }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.allow_register === 'true' ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.allow_register === 'true' ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0'}`} />
              </button>
            </div>

            <h2 className="text-base font-semibold text-gray-800 border-t border-gray-100 pt-5 mt-2 flex items-center gap-2">
              <span>🤖</span> إعدادات الذكاء الاصطناعي (Gemini)
            </h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">مفتاح Gemini API Key</label>
              <input
                type="password"
                value={settings.gemini_api_key || ''}
                onChange={(e) => setSettings(s => ({ ...s, gemini_api_key: e.target.value }))}
                placeholder="AIzaSy..."
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
                dir="ltr"
              />
              <p className="text-[11px] text-gray-400">إذا تُرك فارغاً سيتم استخدام المتغير الأساسي من السيرفر (GEMINI_API_KEY).</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">اختيار النموذج المفضل (Model)</label>
              <select
                value={settings.gemini_model || 'gemini-1.5-flash'}
                onChange={(e) => setSettings(s => ({ ...s, gemini_model: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono text-gray-700"
                dir="ltr"
              >
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (خفيف وسريع جداً)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (سريع ومستقر)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (أحدث المتاح)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (أكثر دقة واحترافية)</option>
                <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (تجريبي سريع)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  setTestAiMsg('⏳ جاري اختبار الاتصال...')
                  try {
                    const r = await fetch('/api/admin/test-ai', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ key: settings.gemini_api_key || '', model: settings.gemini_model || 'gemini-1.5-flash' })
                    })
                    const j = await r.json()
                    setTestAiMsg(j.success ? '✅ متصل بنجاح - الموديل يستجيب' : '❌ ' + (j.error || 'فشل الاتصال باجهة جوجل'))
                  } catch (e) {
                    setTestAiMsg('❌ تعذر الاتصال بالخادم')
                  }
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium rounded-xl transition flex items-center gap-2"
              >
                <span>🔍</span> اختبار الاتصال
              </button>
              {testAiMsg && <span className={`text-sm font-medium ${testAiMsg.includes('✅') ? 'text-green-600' : testAiMsg.includes('⏳') ? 'text-blue-600' : 'text-red-500'}`}>{testAiMsg}</span>}
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition"
              >
                {settingsSaving ? '⏳ جارٍ الحفظ…' : 'حفظ الإعدادات'}
              </button>
              {settingsMsg && (
                <span className={`text-sm px-3 py-1.5 rounded-xl border ${
                  settingsMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}>{settingsMsg}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
