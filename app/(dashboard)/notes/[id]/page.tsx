'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteDTO } from '@/types'
import NoteShare from '@/components/notes/NoteShare'

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'عام', TECHNOLOGY: 'تقنية', SCIENCE: 'علوم',
  LITERATURE: 'أدب', PHILOSOPHY: 'فلسفة', HISTORY: 'تاريخ',
  ART: 'فن', BUSINESS: 'أعمال',
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function readingTime(html: string) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function wordCount(html: string) {
  return stripHtml(html).split(/\s+/).filter(Boolean).length
}

export default function NoteReadPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [note, setNote] = useState<NoteDTO | null>(null)
  const [isAuthor, setIsAuthor] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [pinning, setPinning] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    fetch(`/api/notes/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setNote(json.data.note)
          setIsAuthor(json.data.isAuthor ?? false)
          setPurchaseStatus(json.data.purchaseStatus ?? null)
        } else {
          setError(json.error || 'تعذّر تحميل المذكرة')
        }
      })
      .catch(() => setError('تعذّر الاتصال بالخادم'))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCurrentUserRole(json.data?.role ?? null)
      })
      .catch(() => {})
  }, [])

  async function handleDownloadPDF() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/pdf/${params.id}`)
      if (!res.ok) { setError('فشل توليد PDF'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${note?.title ?? 'note'}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('تعذّر تحميل الملف')
    } finally {
      setDownloading(false)
    }
  }

  async function handlePurchase() {
    setPurchasing(true)
    try {
      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: params.id }),
      })
      const json = await res.json()
      if (json.success) {
        setPurchaseStatus('PENDING')
        if (json.data?.whatsappUrl) {
          window.open(json.data.whatsappUrl, '_blank')
        }
      } else {
        setError(json.error || 'تعذّر إنشاء طلب الشراء')
      }
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setPurchasing(false)
    }
  }

  async function handleTogglePin() {
    if (!note) return
    setPinning(true)
    try {
      const res = await fetch(`/api/notes/${params.id}/pin`, { method: 'PATCH' })
      const json = await res.json()
      if (json.success) setNote({ ...note, isPinned: json.data.isPinned })
    } catch {
      // silent fail
    } finally {
      setPinning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !note) {
    const isAuthError = error?.includes('تسجيل الدخول') || error?.includes('مصادقة') || error?.includes('401')
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl shadow-sm ${
            isAuthError ? 'bg-indigo-50' : 'bg-red-50'
          }`}>
            {isAuthError ? '🔐' : '😕'}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isAuthError ? 'تسجيل الدخول مطلوب' : 'تعذّر تحميل المذكرة'}
          </h2>

          {/* Message */}
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            {isAuthError
              ? 'يجب تسجيل الدخول أولاً للوصول إلى هذه المذكرة'
              : (error || 'المذكرة غير موجودة أو لا تملك صلاحية الوصول إليها')}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthError && (
              <button
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                تسجيل الدخول
              </button>
            )}
            <button
              onClick={() => router.back()}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isAuthError
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              ← العودة
            </button>
          </div>
        </div>
      </div>
    )
  }

  const wc = wordCount(note.content)
  const rt = readingTime(note.content)

  // ── Access Control Logic ──────────────────────────────────────────────────
  const canViewContent =
    isAuthor ||
    currentUserRole === 'ADMIN' ||
    purchaseStatus === 'APPROVED' ||
    note.visibility !== 'FOR_SALE'

  const canEdit = currentUserRole === 'ADMIN'

  return (
    <div className="max-w-3xl mx-auto pb-12" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← العودة
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePin}
            disabled={pinning}
            title={note.isPinned ? 'إلغاء التثبيت' : 'تثبيت المذكرة'}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all text-sm ${
              note.isPinned
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            📌
          </button>
          {note.canShare && (
            <NoteShare noteId={params.id} title={note.title} />
          )}
          {canEdit && (
            <button
              onClick={() => router.push(`/notes/${params.id}/edit`)}
              className="px-3 py-1.5 border border-white/[0.08] rounded-xl text-sm text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition-all"
            >
              تعديل
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all"
          >
            {downloading
              ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            }
            تصدير HTML
          </button>
        </div>
      </div>

      {/* Cover Image */}
      {note.coverImage ? (
        <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={note.coverImage}
            alt={note.title}
            className="w-full max-h-80 object-cover"
          />
        </div>
      ) : (
        <div
          className="h-2 w-full rounded-full mb-6"
          style={{ backgroundColor: note.coverColor }}
        />
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-snug">{note.title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-500">
        <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {CATEGORY_LABELS[note.category] ?? note.category}
        </span>
        <span>{wc.toLocaleString('ar-SA')} كلمة</span>
        <span>~{rt} دقيقة قراءة</span>
        <span>
          {new Date(note.updatedAt).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </span>
        {note.isPinned && (
          <span className="bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
            📌 مثبتة
          </span>
        )}
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {note.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Content or Purchase Prompt */}
      {canViewContent ? (
        <>
          <div
            className="prose prose-gray max-w-none bg-white rounded-2xl border border-gray-100 p-6 shadow-sm prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto prose-img:max-h-[500px] prose-img:object-contain"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
            {note.downloads > 0 && (
              <p className="mt-4 text-xs text-gray-400 text-left">
                ⬇ {note.downloads.toLocaleString('ar-SA')} تحميل
              </p>
            )}

            {/* Bottom Share Section */}
            {note.canShare && (
              <div className="mt-12 pt-8 border-t border-white/[0.06]">
                <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">هل أعجبك المقال؟ شاركه</p>
                <div className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                  <NoteShare noteId={params.id} title={note.title} direction="up" />
                  <div className="h-6 w-px bg-white/[0.08]" />
                  <span className="text-sm text-slate-500">اضغط الأيقونة لمشاركة المذكرة</span>
                </div>
              </div>
            )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center" dir="rtl">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">هذه مذكرة مدفوعة</h2>
          <p className="text-gray-500 mb-4">
            {note.price
              ? `السعر: ${note.price?.toString()} ج.م`
              : 'يتطلب الوصول شراء هذه المذكرة'}
          </p>
          {purchaseStatus === 'PENDING' && (
            <p className="text-amber-600 text-sm mb-4">
              ⏳ طلب الشراء قيد المراجعة، يرجى الانتظار حتى يتم الاعتماد.
            </p>
          )}
          {purchaseStatus === 'REJECTED' && (
            <p className="text-red-600 text-sm mb-4">
              ❌ تم رفض طلب الشراء. يمكنك التواصل مع الدعم.
            </p>
          )}
          {!purchaseStatus && (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {purchasing ? '⏳ جاري الإرسال...' : 'اشترِ الآن'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
