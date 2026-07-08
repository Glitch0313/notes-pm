'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from '@/components/notifications/NotificationBell'

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/marketplace', label: 'السوق' },
]

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setIsLoggedIn(data.authenticated === true))
      .catch(() => setIsLoggedIn(false))
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      dir="rtl"
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#07070b]/90 backdrop-blur-xl border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'bg-[#07070b] border-white/[0.06]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-base sm:text-[17px] font-black bg-gradient-to-l from-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
              NoteVaultPro
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-2 py-1.5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  className={`relative px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-white bg-white/[0.1]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-1.5 right-1/2 translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                <NotificationBell align="center" />
                <Link href="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-l from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 transition-all shadow-lg shadow-indigo-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  لوحتي
                </Link>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/10 rounded-xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[14px] blur opacity-50 group-hover:opacity-80 transition duration-300" />
                  <span className="relative flex items-center gap-1.5 px-5 py-2.5 bg-[#07070b] text-white rounded-xl text-sm font-semibold group-hover:bg-[#0e0e18] transition-colors">
                    ابدأ مجاناً
                    <svg className="w-3.5 h-3.5 -rotate-180 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: compact actions + toggle */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn ? (
              <NotificationBell align="left" />
            ) : (
              <Link href="/register"
                className="px-3.5 py-1.5 text-xs font-bold bg-gradient-to-l from-indigo-500 to-violet-500 text-white rounded-xl hover:opacity-90 transition">
                ابدأ مجاناً
              </Link>
            )}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-all border border-white/[0.08]"
              aria-label="القائمة"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#07070b] px-4 py-4 flex flex-col gap-1.5">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === href
                  ? 'bg-white/[0.1] text-white'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
              }`}
            >
              {label}
            </Link>
          ))}
          {!isLoggedIn && (
            <div className="border-t border-white/[0.06] pt-3 mt-1.5 flex flex-col gap-2">
              <Link href="/login"
                className="w-full text-center py-3 text-sm font-medium text-slate-300 border border-white/[0.1] rounded-xl hover:bg-white/[0.05] transition">
                تسجيل الدخول
              </Link>
              <Link href="/register"
                className="w-full text-center py-3 text-sm font-bold bg-gradient-to-l from-indigo-500 to-violet-500 text-white rounded-xl hover:opacity-90 transition">
                ابدأ مجاناً
              </Link>
            </div>
          )}
          {isLoggedIn && (
            <div className="border-t border-white/[0.06] pt-3 mt-1.5">
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold bg-gradient-to-l from-indigo-500 to-violet-500 text-white rounded-xl hover:opacity-90 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                لوحة التحكم
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
