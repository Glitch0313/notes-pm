'use client'

import { useState } from 'react'

type RegularAction = 'summarize' | 'improve' | 'suggest_tags' | 'suggest_title' | 'expand' | 'translate'

interface AutofillResult {
  title: string
  content: string
  tags: string[]
  category: string
  coverImage?: string
}

interface AIAssistantProps {
  content: string
  title?: string
  onApplyContent?: (result: string) => void
  onApplyTags?: (tags: string[]) => void
  onApplyTitle?: (title: string) => void
  onAutoFill?: (data: AutofillResult) => void
  onLoadingChange?: (loading: boolean) => void
}

const ACTIONS: { key: RegularAction; label: string; icon: string; desc: string }[] = [
  { key: 'improve',       label: 'تحسين الكتابة',    icon: '✨', desc: 'تحسين أسلوب النص' },
  { key: 'summarize',     label: 'تلخيص',            icon: '📝', desc: 'تلخيص المحتوى' },
  { key: 'expand',        label: 'توسيع',             icon: '🔭', desc: 'إثراء النص بتفاصيل' },
  { key: 'suggest_tags',  label: 'اقتراح وسوم',       icon: '🏷️', desc: 'وسوم ذكية للمذكرة' },
  { key: 'suggest_title', label: 'اقتراح عنوان',      icon: '💡', desc: 'عنوان جذاب' },
  { key: 'translate',     label: 'ترجمة للإنجليزية',  icon: '🌐', desc: 'ترجمة احترافية' },
]

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function AIAssistant({
  content,
  title,
  onApplyContent,
  onApplyTags,
  onApplyTitle,
  onAutoFill,
  onLoadingChange,
}: AIAssistantProps) {
  const [isOpen, setIsOpen]     = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [result, setResult]     = useState<{ action: RegularAction; text: string } | null>(null)
  const [error, setError]       = useState('')
  // autofill state
  const [topic, setTopic]       = useState('')
  const [autofillPreview, setAutofillPreview] = useState<AutofillResult | null>(null)

  const plainText = stripHtml(content || '')
  const hasContent = plainText.length >= 10

  // ── Regular action ────────────────────────────────────────────────────────
  async function runAction(action: RegularAction) {
    const needsContent = action !== 'suggest_title'
    if (needsContent && !hasContent) {
      setError('اكتب محتوى في المذكرة أولاً ثم استخدم المساعد')
      return
    }
    setLoadingAction(action)
    setResult(null)
    setAutofillPreview(null)
    setError('')
    onLoadingChange?.(true)
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content, title }),
      })
      const json = await res.json()
      if (!json.success) { setError(json.error || 'حدث خطأ'); return }
      setResult({ action, text: json.data.result })
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setLoadingAction(null)
      onLoadingChange?.(false)
    }
  }

  function applyResult() {
    if (!result) return
    if (result.action === 'suggest_tags' && onApplyTags) {
      const tags = result.text.split(/[,،]/).map((t) => t.trim().replace(/^#/, '')).filter(Boolean)
      onApplyTags(tags)
    } else if (result.action === 'suggest_title' && onApplyTitle) {
      onApplyTitle(result.text)
    } else if (onApplyContent) {
      onApplyContent(`<p>${result.text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`)
    }
    setResult(null)
    setIsOpen(false)
  }

  // ── Autofill ──────────────────────────────────────────────────────────────
  async function runAutofill() {
    setLoadingAction('autofill')
    setResult(null)
    setAutofillPreview(null)
    setError('')
    onLoadingChange?.(true)
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'autofill', topic: topic.trim() || undefined }),
      })
      const json = await res.json()
      if (!json.success) { setError(json.error || 'حدث خطأ'); return }
      const af = json.data.autofill
      const imageQuery = af.imageQuery?.trim()

      let coverImage: string | undefined
      if (imageQuery) {
        try {
          const imgRes = await fetch(`/api/image-search?q=${encodeURIComponent(imageQuery)}`)
          const imgJson = await imgRes.json()
          if (imgJson.success) coverImage = imgJson.url
        } catch { /* silent */ }
      }

      setAutofillPreview({
        ...af,
        coverImage,
      })
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setLoadingAction(null)
      onLoadingChange?.(false)
    }
  }

  function applyAutofill() {
    if (!autofillPreview || !onAutoFill) return
    onAutoFill(autofillPreview)
    setAutofillPreview(null)
    setTopic('')
    setIsOpen(false)
  }

  const isLoading = loadingAction !== null

  return (
    <div className="relative" dir="rtl">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setResult(null); setAutofillPreview(null); setError('') }}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-l from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm"
      >
        <span>🤖</span>
        <span>مساعد AI</span>
        <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-40 w-84 bg-slate-950 text-slate-100 rounded-2xl shadow-2xl shadow-black/60 border border-slate-700 overflow-hidden" style={{ width: '22rem' }}>

          {/* ── Autofill section ── */}
          <div className="p-3 border-b border-slate-700/80 bg-gradient-to-l from-violet-950/80 to-indigo-950/70">
            <p className="text-xs font-semibold text-violet-200 mb-2 flex items-center gap-1.5">
              <span>⚡</span> ملء تلقائي للمذكرة
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runAutofill() } }}
                placeholder="اكتب موضوعاً (اختياري)..."
                className="flex-1 text-xs px-3 py-2 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={runAutofill}
                disabled={isLoading}
                className="px-3 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition whitespace-nowrap"
              >
                {loadingAction === 'autofill' ? '⏳' : '✨ ملء'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">سيملأ العنوان والمحتوى والوسوم والتصنيف دفعة واحدة</p>
          </div>

          {/* ── Regular actions ── */}
          <div className="p-3 border-b border-slate-700/80 bg-slate-950">
            <p className="text-xs font-semibold text-slate-300 mb-2">أدوات الكتابة</p>
            <div className="grid grid-cols-2 gap-2">
              {ACTIONS.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => runAction(action.key)}
                  disabled={isLoading}
                  className="flex min-h-[74px] flex-col items-start justify-between gap-1 p-2.5 rounded-xl border border-slate-700 bg-slate-900/70 hover:border-indigo-400/60 hover:bg-slate-800 transition text-right disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm">{loadingAction === action.key ? '⏳' : action.icon}</span>
                  <span className="text-xs font-medium text-slate-100">{action.label}</span>
                  <span className="text-[10px] text-slate-400">{action.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mx-3 my-2 px-3 py-2 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-200">
              {error}
            </div>
          )}

          {/* ── Autofill preview ── */}
          {autofillPreview && (
            <div className="mx-3 my-2 p-3 bg-violet-950/40 border border-violet-500/30 rounded-xl">
              <p className="text-xs font-semibold text-violet-200 mb-2">📄 المذكرة المقترحة</p>
              <p className="text-xs font-bold text-slate-100 mb-1 line-clamp-2">{autofillPreview.title}</p>
              <p className="text-[11px] text-slate-300 line-clamp-2 mb-2">
                {stripHtml(autofillPreview.content).slice(0, 120)}…
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-1.5 py-0.5 rounded-full">{autofillPreview.category}</span>
                {autofillPreview.tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full">#{t}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyAutofill}
                  className="flex-1 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition"
                >
                  تطبيق على المذكرة
                </button>
                <button
                  type="button"
                  onClick={() => setAutofillPreview(null)}
                  className="flex-1 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg hover:bg-slate-700 transition"
                >
                  تجاهل
                </button>
              </div>
            </div>
          )}

          {/* ── Regular result ── */}
          {result && (
            <div className="mx-3 my-2 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
              <p className="text-xs font-medium text-indigo-200 mb-2">
                {ACTIONS.find((a) => a.key === result.action)?.label}
              </p>
              <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                {result.text}
              </p>
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={applyResult}
                  className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition">
                  تطبيق
                </button>
                <button type="button" onClick={() => setResult(null)}
                  className="flex-1 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg hover:bg-slate-700 transition">
                  تجاهل
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
