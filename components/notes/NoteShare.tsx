'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface NoteShareProps {
  noteId: string
  title: string
  direction?: 'up' | 'down'
}

export default function NoteShare({ noteId, title, direction = 'down' }: NoteShareProps) {
  const [isOpen, setIsOpen]   = useState(false)
  const [copied, setCopied]   = useState(false)
  const [pos, setPos]         = useState({ top: 0, right: 0 })
  const [mounted, setMounted] = useState(false)
  const btnRef  = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/notes/${noteId}`

  useEffect(() => { setMounted(true) }, [])

  const calcPos = () => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({
      top:   direction === 'up' ? r.top - 8 : r.bottom + 8,
      right: window.innerWidth - r.right,
    })
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOpen) calcPos()
    setIsOpen((v) => !v)
  }

  useEffect(() => {
    if (!isOpen) return
    const onOutside = (e: MouseEvent) => {
      const t = e.target as Node
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) setIsOpen(false)
    }
    const onScroll = () => setIsOpen(false)
    document.addEventListener('mousedown', onOutside)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [isOpen])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const shareOnSocial = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const text = encodeURIComponent(`تحقق من هذا المقال: ${title}`)
    const enc  = encodeURIComponent(shareUrl)
    const urls: Record<string, string> = {
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${enc}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      whatsapp: `https://wa.me/?text=${text}%20${enc}`,
    }
    window.open(urls[platform], '_blank')
    setIsOpen(false)
  }

  /* ── Dropdown rendered via portal so it's never clipped by parent stacking contexts ── */
  const dropdown = mounted && isOpen ? createPortal(
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        right:    pos.right,
        top:      pos.top,
        transform: direction === 'up' ? 'translateY(-100%)' : 'none',
        zIndex:   9999,
      }}
      className="w-52 bg-[#0d0d16] border border-white/[0.09] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.75)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.06]">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">مشاركة</p>
      </div>

      <div className="py-1.5">
        {/* Copy link */}
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-indigo-500/10 transition-colors group"
        >
          <span className={`w-7 h-7 flex items-center justify-center rounded-xl transition-colors ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-white/[0.05] text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
          }`}>
            {copied ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </span>
          <span className={`text-[13px] font-medium transition-colors ${
            copied ? 'text-emerald-400' : 'text-slate-300 group-hover:text-indigo-300'
          }`}>
            {copied ? 'تم النسخ!' : 'نسخ الرابط'}
          </span>
        </button>

        <div className="h-px bg-white/[0.05] mx-3 my-1" />

        {/* Twitter / X */}
        <button
          onClick={() => shareOnSocial('twitter')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-sky-500/10 transition-colors group"
        >
          <span className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/[0.05] text-slate-400 group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </span>
          <span className="text-[13px] font-medium text-slate-300 group-hover:text-sky-400 transition-colors">تويتر (X)</span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => shareOnSocial('whatsapp')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-emerald-500/10 transition-colors group"
        >
          <span className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/[0.05] text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </span>
          <span className="text-[13px] font-medium text-slate-300 group-hover:text-emerald-400 transition-colors">واتساب</span>
        </button>

        {/* Facebook */}
        <button
          onClick={() => shareOnSocial('facebook')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-blue-500/10 transition-colors group"
        >
          <span className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/[0.05] text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </span>
          <span className="text-[13px] font-medium text-slate-300 group-hover:text-blue-400 transition-colors">فيسبوك</span>
        </button>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleToggle}
        title="مشاركة"
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${
          isOpen
            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
            : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border-white/[0.08] hover:border-indigo-500/20'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
      {dropdown}
    </div>
  )
}
