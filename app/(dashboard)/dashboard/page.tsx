'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import NoteList from '@/components/notes/NoteList'
import type { NoteDTO } from '@/types'

const CATEGORIES = [
  { value: '', label: 'كل التصنيفات' },
  { value: 'GENERAL', label: 'عام' },
  { value: 'TECHNOLOGY', label: 'تقنية' },
  { value: 'SCIENCE', label: 'علوم' },
  { value: 'LITERATURE', label: 'أدب' },
  { value: 'PHILOSOPHY', label: 'فلسفة' },
  { value: 'HISTORY', label: 'تاريخ' },
  { value: 'ART', label: 'فن' },
  { value: 'BUSINESS', label: 'أعمال' },
]

const STAT_CARDS = [
  {
    key: 'total' as const,
    label: 'المذكرات',
    gradient: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'public' as const,
    label: 'المنشورة',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'forSale' as const,
    label: 'للبيع',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'downloads' as const,
    label: 'التحميلات',
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ fullName: string | null; username: string; role?: string; userId?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [notes, setNotes] = useState<NoteDTO[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ public: 0, downloads: 0, forSale: 0 })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const limit = 20

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) { setUser(data); setIsAdmin(data.role === 'ADMIN') }
      })
  }, [])

  const fetchNotes = useCallback(async () => {
    setIsLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(search && { search }), ...(category && { category }) })
      const res  = await fetch(`/api/notes?${params}`)
      const json = await res.json()
      if (json.success) {
        setNotes(json.data.notes); setTotal(json.data.total)
        const allRes  = await fetch('/api/notes?limit=1000')
        const allJson = await allRes.json()
        if (allJson.success) {
          const ns = allJson.data.notes as NoteDTO[]
          setStats({
            public: ns.filter(n => n.visibility === 'PUBLIC' || n.visibility === 'FOR_SALE').length,
            downloads: ns.reduce((acc, n) => acc + (n.downloads || 0), 0),
            forSale: ns.filter(n => n.visibility === 'FOR_SALE').length,
          })
        }
      } else { setError(json.error || 'حدث خطأ') }
    } catch { setError('تعذّر الاتصال بالخادم') } finally { setIsLoading(false) }
  }, [search, category, page])

  useEffect(() => { fetchNotes() }, [fetchNotes])
  useEffect(() => { setPage(1) }, [search, category])

  async function handleDelete(id: string) {
    setIsDeleting(true)
    try {
      const res  = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) { setDeleteId(null); fetchNotes() }
      else setError(json.error || 'فشل الحذف')
    } catch { setError('تعذّر الاتصال بالخادم') } finally { setIsDeleting(false) }
  }

  const statValues: Record<string, number> = { total, public: stats.public, forSale: stats.forSale, downloads: stats.downloads }
  const totalPages = Math.ceil(total / limit)
  const greeting = user?.fullName || user?.username || 'مستخدمنا'

  return (
    <div dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Hero greeting ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-[#0f0c29] via-[#302b63] to-[#24243e] p-8 shadow-xl shadow-indigo-900/20">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-indigo-300 text-sm font-medium mb-1">مرحباً بعودتك 👋</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                {greeting}
              </h1>
              <p className="text-indigo-300/70 text-sm">
                {total === 0 ? 'ابدأ أول مذكرة لك اليوم' : `لديك ${total} مذكرة، استمر في الإبداع`}
              </p>
            </div>
            <button
              onClick={() => router.push('/notes/new')}
              className="flex items-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-2xl text-sm font-bold hover:bg-indigo-50 transition shadow-lg shadow-black/20 shrink-0 self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              مذكرة جديدة
            </button>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <div key={card.key}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.text} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${card.gradient} mt-1`} />
              </div>
              <p className="text-2xl font-black text-gray-900">{statValues[card.key]}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── Notes section ──────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-900">مذكراتي</h2>
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث..."
                  className="w-full sm:w-52 pr-9 pl-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="py-2 px-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-400">جارٍ التحميل...</p>
              </div>
            ) : (
              <NoteList
                notes={notes}
                isAdmin={isAdmin}
                currentUserId={user?.userId as string | undefined}
                onEdit={(id) => router.push(`/notes/${id}/edit`)}
                onDelete={(id) => setDeleteId(id)}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition">
                  السابق
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl">
                  {page} / {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition">
                  التالي
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete modal ───────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-gray-100" dir="rtl">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">حذف المذكرة؟</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              هذه العملية نهائية ولا يمكن التراجع عنها.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                إلغاء
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition">
                {isDeleting ? 'جارٍ الحذف...' : 'احذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
