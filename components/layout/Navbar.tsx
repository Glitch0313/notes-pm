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
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-2 md:py-4 px-0 md:px-6'
          : 'py-0 px-0'
      }`}
    >
      <div
        className={`w-full max-w-7xl mx-auto transition-all duration-500 ${
          scrolled
            ? 'bg-[#08080c]/70 backdrop-blur-xl border-b md:border border-indigo-500/20 shadow-[0_8px_32px_rgba(99,102,241,0.12)] md:rounded-2xl px-4 sm:px-6 lg:px-8 glass-border-glow animate-navbar-glow'
            : 'bg-[#08080c] md:bg-transparent border-b border-white/[0.06] px-4 sm:px-6 lg:px-8'
        }`}
      >
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group relative">
            {/* Ambient Logo Glow */}
            <div className="absolute -inset-2 bg-indigo-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/50 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="relative text-base sm:text-[18px] font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-[length:200%_auto] hover:animate-gradient-x bg-clip-text text-transparent tracking-tight transition-all duration-300">
              NoteVaultPro
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-2 py-1.5 backdrop-blur-md">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  className={`relative px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    active
                      ? 'text-white bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] border border-white/[0.08]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-1 right-1/2 translate-x-1/2 w-5 h-[2px] rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 shadow-[0_0_8px_#6366f1]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <NotificationBell align="center" />
                <Link href="/dashboard"
                  className="relative group overflow-hidden flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 border border-white/[0.08]">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="relative z-10">لوحتي</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.15] hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all duration-300">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="relative group">
                  {/* Dynamic Background Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[14px] blur opacity-60 group-hover:opacity-100 transition-all duration-500 animate-gradient-x" />
                  
                  <span className="relative flex items-center gap-1.5 px-5 py-2.5 bg-[#08080c] text-white rounded-xl text-sm font-bold group-hover:bg-[#08080c]/90 transition-colors border border-white/[0.08]">
                    ابدأ مجاناً
                    <svg className="w-3.5 h-3.5 -rotate-180 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <Link href="/register" className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[10px] blur opacity-50" />
                <span className="relative px-3.5 py-1.5 text-xs font-bold bg-[#08080c] text-white rounded-[8px] border border-white/10 flex items-center">
                  ابدأ مجاناً
                </span>
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
        <div className="md:hidden absolute top-[calc(100%+8px)] left-4 right-4 bg-[#08080c]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-[fade-up_0.2s_ease-out_forwards]">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === href
                  ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-100 border border-transparent'
              }`}
            >
              {label}
            </Link>
          ))}
          {!isLoggedIn && (
            <div className="border-t border-white/[0.06] pt-3 mt-1.5 flex flex-col gap-2">
              <Link href="/login"
                className="w-full text-center py-3 text-sm font-semibold text-slate-300 border border-white/[0.08] rounded-xl hover:bg-white/[0.04] transition">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="relative w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-60 animate-gradient-x" />
                <span className="relative block w-full text-center py-3 text-sm font-bold bg-[#08080c] text-white rounded-xl border border-white/[0.08]">
                  ابدأ مجاناً
                </span>
              </Link>
            </div>
          )}
          {isLoggedIn && (
            <div className="border-t border-white/[0.06] pt-3 mt-1.5">
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition">
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
