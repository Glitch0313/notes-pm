'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteDTO } from '@/types'
import NoteShare from './NoteShare'

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'عام', TECHNOLOGY: 'تقنية', SCIENCE: 'علوم',
  LITERATURE: 'أدب', PHILOSOPHY: 'فلسفة', HISTORY: 'تاريخ',
  ART: 'فن', BUSINESS: 'أعمال',
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL:    'bg-gray-100 text-gray-600',
  TECHNOLOGY: 'bg-blue-50 text-blue-600',
  SCIENCE:    'bg-emerald-50 text-emerald-600',
  LITERATURE: 'bg-amber-50 text-amber-600',
  PHILOSOPHY: 'bg-violet-50 text-violet-600',
  HISTORY:    'bg-orange-50 text-orange-600',
  ART:        'bg-pink-50 text-pink-600',
  BUSINESS:   'bg-indigo-50 text-indigo-600',
}

const VISIBILITY_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  PRIVATE: { label: 'خاصة',  dot: 'bg-gray-400',   text: 'text-gray-500' },
  PUBLIC:  { label: 'عامة',  dot: 'bg-emerald-400', text: 'text-emerald-600' },
  FOR_SALE: { label: 'للبيع', dot: 'bg-amber-400',   text: 'text-amber-600' },
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function estimateReadingTime(html: string) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

interface NoteCardProps {
  note: NoteDTO
  isAdmin?: boolean
  currentUserId?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onPinToggle?: (id: string, isPinned: boolean) => void
}

export default function NoteCard({ note, isAdmin, currentUserId, onEdit, onDelete, onPinToggle }: NoteCardProps) {
  const router = useRouter()
  const [isPinned, setIsPinned] = useState(note.isPinned)
  const [pinning, setPinning] = useState(false)

  const plainExcerpt = stripHtml(note.content)
  const excerpt = plainExcerpt.length > 110 ? plainExcerpt.slice(0, 110) + '…' : plainExcerpt
  const vis = VISIBILITY_CONFIG[note.visibility] ?? VISIBILITY_CONFIG.PRIVATE
  const rt = estimateReadingTime(note.content)
  const updatedDate = new Date(note.updatedAt).toLocaleDateString('ar-SA', {
    month: 'short', day: 'numeric',
  })
  const catColor = CATEGORY_COLORS[note.category] ?? 'bg-gray-100 text-gray-600'
  const catLabel = CATEGORY_LABELS[note.category] ?? note.category
  const canEdit = isAdmin || (currentUserId != null && note.author.id === currentUserId)
  const canPin  = canEdit

  async function handlePin(e: React.MouseEvent) {
    e.stopPropagation()
    setPinning(true)
    try {
      const res  = await fetch(`/api/notes/${note.id}/pin`, { method: 'PATCH' })
      const json = await res.json()
      if (json.success) {
        setIsPinned(json.data.isPinned)
        onPinToggle?.(note.id, json.data.isPinned)
      }
    } catch { /* silent */ } finally {
      setPinning(false)
    }
  }

  return (
    <article
      dir="rtl"
      onClick={() => router.push(`/notes/${note.id}`)}
      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Cover */}
      {note.coverImage ? (
        <div className="h-32 w-full overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={note.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="h-1.5 w-full flex-shrink-0 bg-gradient-to-l rounded-t-2xl overflow-hidden"
          style={{ background: `linear-gradient(to left, ${note.coverColor}cc, ${note.coverColor}55)` }} />
      )}

      {/* Pin badge */}
      {isPinned && (
        <span className="absolute top-3 left-3 z-10 text-[10px] bg-amber-400 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
          مثبّت
        </span>
      )}

      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Top row */}
        <div className="flex items-start gap-2">
          <h3 className="flex-1 font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {note.title}
          </h3>
          <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${catColor}`}>
            {catLabel}
          </span>
        </div>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{excerpt}</p>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-gray-50 text-gray-400 border border-gray-100 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">+{note.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Price */}
        {note.visibility === 'FOR_SALE' && note.price !== null && (
          <p className="text-sm font-bold text-amber-600">{note.price?.toString()} ج.م</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-[11px] font-medium ${vis.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${vis.dot}`} />
              {vis.label}
            </span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-400">{rt} د</span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-400">{updatedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {note.canShare && (
              <NoteShare noteId={note.id} title={note.title} direction="up" />
            )}
            {canPin && (
              <button onClick={handlePin} disabled={pinning}
                title={isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isPinned ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
            {onEdit && canEdit && (
              <button onClick={() => onEdit(note.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && canEdit && (
              <button onClick={() => onDelete(note.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
