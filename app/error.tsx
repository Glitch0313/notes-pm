'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#08080c] flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">حدث خطأ غير متوقع</h1>
        <p className="text-slate-400 mb-2 text-sm">نأسف على هذا الخلل. يمكنك المحاولة مجدداً أو العودة للرئيسية.</p>
        {error.digest && (
          <p className="text-xs text-slate-600 mb-6 font-mono">رمز الخطأ: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-white hover:bg-slate-200 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            حاول مجدداً
          </button>
          <a
            href="/dashboard"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  )
}
