'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { NoteDTO, PurchaseStatus } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'عام', TECHNOLOGY: 'تقنية', SCIENCE: 'علوم',
  LITERATURE: 'أدب', PHILOSOPHY: 'فلسفة', HISTORY: 'تاريخ',
  ART: 'فن', BUSINESS: 'أعمال',
}

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

interface MarketplaceCardProps {
  note: NoteDTO
  isLoggedIn: boolean
  isOwnNote?: boolean
  purchaseStatus?: PurchaseStatus | null
  onDownload?: (note: NoteDTO) => void
  onPurchase?: (note: NoteDTO) => void
}

export default function MarketplaceCard({ note, isLoggedIn, isOwnNote, purchaseStatus, onDownload, onPurchase }: MarketplaceCardProps) {
  const [tooltip, setTooltip] = useState(false)

  const authorName    = note.author.fullName || note.author.username
  const plainExcerpt  = note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const excerpt       = plainExcerpt.length > 120 ? plainExcerpt.slice(0, 120) + '…' : plainExcerpt
  const categoryLabel = CATEGORY_LABELS[note.category] ?? note.category
  const catColor      = CATEGORY_COLORS[note.category] ?? 'bg-white/5 text-slate-300 border-white/10'
  const isForSale     = note.visibility === 'FOR_SALE'

  const handleActionClick = (action: () => void) => {
    if (!isLoggedIn) { setTooltip(true); setTimeout(() => setTooltip(false), 2500); return }
    action()
  }

  const isPending  = purchaseStatus === 'PENDING'
  const isApproved = purchaseStatus === 'APPROVED'

  function renderActionButton() {
    if (!isForSale) {
      return (
        <button
          onClick={() => handleActionClick(() => onDownload?.(note))}
          disabled={!isLoggedIn}
          className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            isLoggedIn
              ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40'
              : 'bg-white/[0.03] text-slate-600 border border-white/[0.05] cursor-not-allowed'
          }`}
        >
          تحميل HTML
        </button>
      )
    }

    if (isApproved) {
      return (
        <button
          onClick={() => handleActionClick(() => onDownload?.(note))}
          className="w-full py-2 px-4 rounded-xl text-sm font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          تحميل HTML
        </button>
      )
    }

    if (isPending) {
      return (
        <button disabled className="w-full py-2 px-4 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
          في انتظار التأكيد
        </button>
      )
    }

    if (isOwnNote) {
      return (
        <div className="w-full py-2 px-4 rounded-xl text-sm text-center bg-white/[0.03] text-slate-500 border border-white/[0.06]">
          مذكرتك — {note.price?.toString()} ج.م
        </div>
      )
    }

    return (
      <button
        onClick={() => handleActionClick(() => onPurchase?.(note))}
        disabled={!isLoggedIn}
        className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all ${
          isLoggedIn
            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:border-amber-500/40'
            : 'bg-white/[0.03] text-slate-600 border border-white/[0.05] cursor-not-allowed'
        }`}
      >
        💬 الدفع عبر واتساب — {note.price?.toString()} ج.م
      </button>
    )
  }

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.07)] transition-all duration-300 group" dir="rtl">
      {note.coverImage ? (
        <div className="h-32 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={note.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="h-px w-full opacity-60" style={{ backgroundColor: note.coverColor }} />
        </div>
      ) : (
        <div className="h-1.5 w-full" style={{ backgroundColor: note.coverColor }} />
      )}

      <div className="flex flex-col flex-1">
        <Link href={`/notes/${note.id}`} className="flex flex-col gap-2.5 p-4 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 flex-1 group-hover:text-indigo-400 transition-colors">{note.title}</h3>
            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${catColor}`}>{categoryLabel}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{excerpt}</p>
        </Link>

        <div className="px-4 pb-4 flex flex-col gap-3">
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] bg-white/[0.04] text-slate-500 border border-white/[0.06] px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
              {note.tags.length > 3 && <span className="text-[10px] text-slate-600">+{note.tags.length - 3}</span>}
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.05]">
            <span className="text-slate-400 font-medium">{authorName}</span>
            <span className="flex items-center gap-1 text-slate-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {note.downloads}
            </span>
          </div>

          <div className="relative">
            {renderActionButton()}
            {tooltip && (
              <div className="absolute bottom-full mb-2 right-0 left-0 flex justify-center pointer-events-none z-10">
                <span className="bg-[#1a1a2e] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-1.5 whitespace-nowrap shadow-xl">سجّل دخولك أولاً</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
