import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer dir="rtl" className="relative bg-[#08080c] border-t border-white/[0.06] mt-auto overflow-hidden">
      {/* Accent glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-md h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[300px] h-[60px] bg-indigo-600/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-black text-base bg-gradient-to-l from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              NoteVaultPro
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            {[
              { href: '/marketplace', label: 'السوق' },
              { href: '/register', label: 'انضم مجاناً' },
              { href: '/login', label: 'تسجيل الدخول' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-600">
            © {year} NoteVaultPro — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  )
}
