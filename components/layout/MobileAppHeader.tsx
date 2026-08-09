'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function MobileAppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<{ fullName?: string; username?: string; email?: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        setIsAdmin(data.role === 'ADMIN')
        setUser({ fullName: data.fullName, username: data.username, email: data.email })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const displayName = user?.fullName || user?.username || 'مستخدم'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* Mobile Sticky Glass Header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 flex items-center justify-between" dir="rtl">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-base font-black bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent tracking-tight">
            NoteVaultPro
          </span>
        </Link>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell align="left" />

          {/* Profile Avatar Button (Opens Mobile Drawer) */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="القائمة الجانبية"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[1.5px] shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-full h-full bg-slate-900 rounded-[10.5px] flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over App Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden" dir="rtl">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="absolute top-0 right-0 bottom-0 w-[280px] bg-slate-900 border-l border-slate-800 shadow-2xl p-5 flex flex-col justify-between animate-[slideInRight_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || (isAdmin ? 'أدمن النظام' : 'عضو')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center hover:text-slate-200 active:scale-90 transition-transform"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/dashboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>🏠</span> الرئيسية
                </Link>
                <Link
                  href="/notes/new"
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 active:scale-98 transition-transform"
                >
                  <span>✏️</span> مذكرة جديدة
                </Link>
                <Link
                  href="/marketplace"
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    pathname.startsWith('/marketplace') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>🛒</span> سوق المذكرات
                </Link>
                <Link
                  href="/analytics"
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    pathname.startsWith('/analytics') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>📊</span> الإحصائيات
                </Link>
                <Link
                  href="/profile"
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    pathname.startsWith('/profile') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>👤</span> الملف الشخصي
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold mt-2 transition-all ${
                      pathname.startsWith('/admin')
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <span>🛡️</span> لوحة الأدمن
                  </Link>
                )}
              </div>
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-sm font-semibold transition-all active:scale-95"
              >
                <span>🚪</span> تسجيل الخروج
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
