import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الوصول مطلوب',
  robots: { index: false, follow: true },
}

export default function AccessRequiredPage() {
  return (
    <div dir="rtl" className="relative min-h-[80vh] flex items-center justify-center bg-[#08080c] px-4 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.14)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-3">
          هذا المحتوى للأعضاء فقط
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          لقراءة هذه المذكرة والوصول إلى كامل المحتوى،
          <br />
          يلزمك تسجيل الدخول أو إنشاء حساب مجاناً.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            إنشاء حساب مجاناً
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white/5 border border-white/10 text-slate-200 font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            تسجيل الدخول
          </Link>
        </div>

        <Link
          href="/"
          className="inline-block mt-6 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
        >
          ← العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
