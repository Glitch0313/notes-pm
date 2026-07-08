'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import MarketplaceCard from '@/components/marketplace/MarketplaceCard'
import PurchaseModal from '@/components/marketplace/PurchaseModal'
import type { NoteDTO, PurchaseStatus } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL:    'bg-white/5 text-slate-300 border-white/10',
  TECHNOLOGY: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SCIENCE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LITERATURE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PHILOSOPHY: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  HISTORY:    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ART:        'bg-pink-500/10 text-pink-400 border-pink-500/20',
  BUSINESS:   'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}

function LockedNoteCard({ note }: { note: NoteDTO }) {
  const catColor = CATEGORY_COLORS[note.category] ?? 'bg-white/5 text-slate-300 border-white/10'
  return (
    <div className="relative flex flex-col rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02] group" dir="rtl">
      {note.coverImage ? (
        <div className="h-32 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={note.coverImage} alt="" className="w-full h-full object-cover blur-sm group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className="h-1.5 w-full" style={{ backgroundColor: note.coverColor }} />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08080c]/60 backdrop-blur-[3px]">
        <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <Link href="/login" className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all">
          سجّل للوصول
        </Link>
      </div>
      <div className="p-4 pt-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-300 text-sm leading-snug line-clamp-2 flex-1">{note.title}</h3>
          <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${catColor}`} />
        </div>
        <p className="text-xs text-slate-600 mt-1">{note.author.fullName || note.author.username}</p>
      </div>
    </div>
  )
}

const CATEGORIES = [
  { value: '', label: 'جميع التصنيفات' },
  { value: 'GENERAL', label: 'عام' },
  { value: 'TECHNOLOGY', label: 'تقنية' },
  { value: 'SCIENCE', label: 'علوم' },
  { value: 'LITERATURE', label: 'أدب' },
  { value: 'PHILOSOPHY', label: 'فلسفة' },
  { value: 'HISTORY', label: 'تاريخ' },
  { value: 'ART', label: 'فن' },
  { value: 'BUSINESS', label: 'أعمال' },
]

type PurchaseMap = Record<string, PurchaseStatus>
const LIMIT = 12

export default function MarketplacePage() {
  const [notes, setNotes]             = useState<NoteDTO[]>([])
  const [total, setTotal]             = useState(0)
  const [hasMore, setHasMore]         = useState(true)
  const pageRef                       = useRef(1)
  const [loading, setLoading]         = useState(false)
  const [initialDone, setInitialDone] = useState(false)
  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('')
  const [isLoggedIn, setIsLoggedIn]   = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [purchaseNote, setPurchaseNote]   = useState<NoteDTO | null>(null)
  const [purchaseMap, setPurchaseMap]     = useState<PurchaseMap>({})
  const sentinelRef  = useRef<HTMLDivElement | null>(null)
  const searchTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeSearch = useRef(search)
  const activeCat    = useRef(category)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        setIsLoggedIn(data.authenticated === true)
        if (data.authenticated) {
          setCurrentUserId(data.userId ?? null)
          fetch('/api/marketplace/my-purchases')
            .then((r) => r.json())
            .then((d) => {
              if (d.success) {
                const map: PurchaseMap = {}
                d.data.purchases.forEach((p: { noteId: string; status: PurchaseStatus }) => { map[p.noteId] = p.status })
                setPurchaseMap(map)
              }
            })
        }
      })
      .catch(() => {})
  }, [])

  const fetchPage = useCallback(async (q: string, cat: string, pg: number, reset = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ search: q, category: cat, page: String(pg), limit: String(LIMIT) })
      const res  = await fetch(`/api/marketplace?${params}`)
      const json = await res.json()
      if (json.success) {
        const fetched: NoteDTO[] = json.data.notes
        setTotal(json.data.total)
        setNotes((prev) => (reset ? fetched : [...prev, ...fetched]))
        setHasMore((pg - 1) * LIMIT + fetched.length < json.data.total)
      }
    } catch {} finally {
      setLoading(false)
      setInitialDone(true)
    }
  }, [])

  useEffect(() => {
    activeSearch.current = ''
    activeCat.current    = ''
    fetchPage('', '', 1, true)
  }, [fetchPage])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const next = pageRef.current + 1
          pageRef.current = next
          fetchPage(activeSearch.current, activeCat.current, next)
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, fetchPage])

  function resetAndFetch(q: string, cat: string) {
    activeSearch.current = q
    activeCat.current    = cat
    pageRef.current      = 1
    setNotes([])
    setHasMore(true)
    setInitialDone(false)
    fetchPage(q, cat, 1, true)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => resetAndFetch(value, activeCat.current), 400)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    resetAndFetch(activeSearch.current, value)
  }

  const handleDownload = async (note: NoteDTO) => {
    try {
      const res = await fetch(`/api/pdf/${note.id}`)
      if (!res.ok) { const j = await res.json(); alert(j.error || 'فشل التحميل'); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${note.title}.html`; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('حدث خطأ أثناء التحميل') }
  }

  const handlePurchaseConfirm = async (): Promise<{ whatsappUrl: string; alreadyExists?: boolean }> => {
    if (!purchaseNote) throw new Error('لا توجد مذكرة محددة')
    const res  = await fetch('/api/marketplace/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId: purchaseNote.id }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'فشل إنشاء الطلب')
    setPurchaseMap((prev) => ({ ...prev, [purchaseNote.id]: 'PENDING' }))
    return { whatsappUrl: json.data.whatsappUrl, alreadyExists: json.data.alreadyExists }
  }

  return (
    <div className="min-h-screen bg-[#08080c] text-slate-200" dir="rtl">

      {/* ── Page Header ── */}
      <div className="sticky top-[56px] sm:top-[64px] z-40 bg-[#08080c]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100">السوق العام</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {initialDone ? (total > 0 ? `${total} مذكرة متاحة` : 'لا توجد مذكرات') : '…'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text" value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="ابحث في المذكرات…"
                  className="w-full sm:w-60 pr-9 pl-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={category} onChange={(e) => handleCategoryChange(e.target.value)}
                className="py-2 px-3 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-[#0e0e18]">{c.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Guest banner */}
        {!isLoggedIn && (
          <div className="mb-6 relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="absolute inset-0 bg-gradient-to-l from-violet-500/5 to-transparent pointer-events-none" />
            <p className="relative text-sm text-slate-300 font-medium">
              <span className="text-indigo-400">👋</span> سجّل دخولك للوصول الكامل للمذكرات وتحميلها
            </p>
            <div className="relative flex gap-2 shrink-0">
              <Link href="/register" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-colors">إنشاء حساب</Link>
              <Link href="/login" className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold transition-colors">تسجيل الدخول</Link>
            </div>
          </div>
        )}

        {/* Skeleton */}
        {!initialDone && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-pulse">
                <div className="h-1.5 bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-white/[0.06] rounded-full w-3/4" />
                  <div className="h-3 bg-white/[0.06] rounded-full w-full" />
                  <div className="h-3 bg-white/[0.06] rounded-full w-2/3" />
                  <div className="h-8 bg-white/[0.04] rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {initialDone && notes.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-base font-medium">لا توجد مذكرات</p>
            <p className="text-slate-600 text-sm mt-1">جرّب تغيير معايير البحث</p>
          </div>
        )}

        {/* Notes grid */}
        {notes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note) =>
              !isLoggedIn ? (
                <LockedNoteCard key={note.id} note={note} />
              ) : (
                <MarketplaceCard
                  key={note.id}
                  note={note}
                  isLoggedIn={isLoggedIn}
                  isOwnNote={currentUserId === note.author.id}
                  purchaseStatus={purchaseMap[note.id] ?? null}
                  onDownload={handleDownload}
                  onPurchase={(n) => setPurchaseNote(n)}
                />
              )
            )}
          </div>
        )}

        <div ref={sentinelRef} className="h-10" />

        {loading && initialDone && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && notes.length > 0 && (
          <p className="text-center text-sm text-slate-600 py-6">
            تم عرض جميع المذكرات ({total})
          </p>
        )}
      </div>

      {purchaseNote && (
        <PurchaseModal
          note={purchaseNote}
          onConfirm={handlePurchaseConfirm}
          onCancel={() => setPurchaseNote(null)}
        />
      )}
    </div>
  )
}
