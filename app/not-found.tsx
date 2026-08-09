import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#08080c] flex flex-col items-center justify-center p-4 overflow-hidden" dir="rtl">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.14)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
      <div className="relative z-10 text-center max-w-md">
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-violet-400 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">الصفحة غير موجودة</h1>
        <p className="text-slate-400 mb-8 text-sm">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-white hover:bg-slate-200 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            الرئيسية
          </Link>
          <Link
            href="/marketplace"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            تصفح المذكرات
          </Link>
        </div>
      </div>
    </div>
  )
}
