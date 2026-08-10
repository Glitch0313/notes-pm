import Link from 'next/link'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import type { Category } from '@/types'
import FadeIn from '@/components/ui/FadeIn'

import HeroPreview from '@/components/home/HeroPreview'
import InteractiveBento from '@/components/home/InteractiveBento'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import InteractiveFAQ from '@/components/home/InteractiveFAQ'

const CATEGORY_LABELS: Record<Category, string> = {
  GENERAL: 'عام',
  TECHNOLOGY: 'تقنية',
  SCIENCE: 'علوم',
  LITERATURE: 'أدب',
  PHILOSOPHY: 'فلسفة',
  HISTORY: 'تاريخ',
  ART: 'فن',
  BUSINESS: 'أعمال',
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-white/5 text-slate-300 border-white/10',
  TECHNOLOGY: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SCIENCE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LITERATURE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PHILOSOPHY: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  HISTORY: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ART: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  BUSINESS: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}

const STEPS = [
  {
    num: '١',
    title: 'اكتب وألهم',
    desc: 'أنشئ مذكراتك باستخدام المحرر الغني المدمج بمساعد الذكاء الاصطناعي.',
    badge: 'خطوة ١',
  },
  {
    num: '٢',
    title: 'نظّم وانشُر',
    desc: 'نسّق أعمالك بصيغة PDF عالية الجودة وانشرها في سوق المنصة.',
    badge: 'خطوة ٢',
  },
  {
    num: '٣',
    title: 'اربح وتوسّع',
    desc: 'حدد أسعار أعمالك، شاركها مع المجتمع، وابنِ مصدر دخل مستمر.',
    badge: 'خطوة ٣',
  },
]

async function getLandingData() {
  try {
    const [featuredNotes, totalUsers, totalPublicNotes, totalDownloadsAgg] = await Promise.all([
      prisma.note.findMany({
        where: { isPublic: true },
        orderBy: { downloads: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          category: true,
          coverColor: true,
          coverImage: true,
          downloads: true,
          price: true,
          visibility: true,
          author: { select: { username: true, fullName: true, avatarColor: true } },
        },
      }),
      prisma.user.count(),
      prisma.note.count({ where: { isPublic: true } }),
      prisma.note.aggregate({ _sum: { downloads: true } }),
    ])
    return {
      featuredNotes,
      stats: { totalUsers, totalPublicNotes, totalDownloads: totalDownloadsAgg._sum.downloads ?? 0 },
    }
  } catch {
    return { featuredNotes: [], stats: { totalUsers: 0, totalPublicNotes: 0, totalDownloads: 0 } }
  }
}

function getIsLoggedIn(): boolean {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return false
    return verifyToken(token) !== null
  } catch {
    return false
  }
}

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'NoteVaultPro',
      url: siteUrl,
      logo: `${siteUrl}/icon`,
      description: 'منصة عربية متطورة لإدارة المذكرات، تنظيمها، ومشاركتها عبر سوق إبداعي متكامل.',
    },
    {
      '@type': 'WebSite',
      name: 'NoteVaultPro',
      url: siteUrl,
      inLanguage: 'ar',
    },
  ],
}

export default async function HomePage() {
  const { featuredNotes, stats } = await getLandingData()
  const isLoggedIn = getIsLoggedIn()

  return (
    <div
      dir="rtl"
      className="bg-[#050508] min-h-[100svh] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white relative"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════ */}
      <section className="relative pt-20 sm:pt-28 lg:pt-36 pb-16 sm:pb-24 overflow-hidden">
        {/* Ambient Top Light Meshes */}
        <div className="absolute inset-x-0 top-0 h-[650px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.2)_0%,rgba(168,85,247,0.08)_35%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          
          {/* Top Pill Announcement */}
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2.5 mb-6 sm:mb-8 mx-auto bg-white/[0.04] border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 shadow-xl backdrop-blur-md hover:bg-white/[0.08] transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>الجيل الجديد من منصات التدوين وإدارة المذكرات 🚀</span>
            </div>
          </FadeIn>

          {/* Main Headline */}
          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight leading-[1.12] sm:leading-[1.1] text-white">
              صمّم أفكارك. ابنِ معارفك.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 via-violet-400 to-pink-400">
                وشارك إبداعك للعالم
              </span>
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={200}>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-sans">
              منصة عربية متكاملة تمنحك محرراً ذكياً، مساعداً بالذكاء الاصطناعي، وتصدير PDF فاخر، مع سوق يتّيح لك تحويل مذكراتك ومقالاتك إلى مصدر دخل مجزٍ.
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-white rounded-2xl text-slate-950 font-black text-sm hover:bg-slate-100 transition-all duration-300 shadow-[0_12px_32px_-8px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
                  <span>{isLoggedIn ? "الانتقال للوقت الحالي" : "ابدأ رحلتك مجاناً"}</span>
                  <svg className="w-4 h-4 -rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </Link>

              <Link
                href="/marketplace"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-200 font-bold text-sm hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 backdrop-blur-md"
              >
                <span>تصفح سوق المذكرات</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
                </svg>
              </Link>
            </div>

            {/* Quick Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> لا نطلب بطاقة إلكترونية
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> إعداد الحساب في أقل من دقيقة
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> مجاني بالكامل للأبد
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Interactive App Mockup Preview Component */}
        <FadeIn delay={400}>
          <HeroPreview />
        </FadeIn>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════════════════ */}
      <section className="relative py-12 sm:py-16 border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                value: stats.totalUsers > 0 ? `+${stats.totalUsers.toLocaleString('ar-EG')}` : '١٠,٠٠٠+',
                label: 'كاتب ومستخدم نشط',
                accent: 'from-indigo-500 to-violet-500',
              },
              {
                value: stats.totalPublicNotes > 0 ? `+${stats.totalPublicNotes.toLocaleString('ar-EG')}` : '٢,٥٠٠+',
                label: 'مذكرة منشورة في السوق',
                accent: 'from-purple-500 to-pink-500',
              },
              {
                value: stats.totalDownloads > 0 ? `+${stats.totalDownloads.toLocaleString('ar-EG')}` : '٤٥,٠٠٠+',
                label: 'عملية تحميل وتنزيل',
                accent: 'from-amber-500 to-orange-500',
              },
              {
                value: '٩٩.٨٪',
                label: 'نسبة رضا صُنّاع المحتوى',
                accent: 'from-emerald-500 to-teal-500',
              },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 80}>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all text-center group">
                  <span
                    className={`block text-3xl sm:text-4xl font-black bg-gradient-to-r ${s.accent} bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300`}
                  >
                    {s.value}
                  </span>
                  <span className="text-slate-400 text-xs sm:text-sm font-semibold">{s.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          INTERACTIVE BENTO FEATURES
      ════════════════════════════════════════════════════ */}
      <InteractiveBento />

      {/* ════════════════════════════════════════════════════
          STEPS / CREATOR WORKFLOW
      ════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 z-10 border-t border-white/[0.06] bg-slate-950/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold mb-4">
                <span>🗺️ مسارك نحو النجاح</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">ثلاث خطوات سهلة لتبدأ رحلتك</h2>
              <p className="text-slate-400 text-sm sm:text-base">
                مسار مبسط ومصمم لمساعدتك في بناء مذكراتك وتحويل أفكارك لمنتج معرفي.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line background on desktop */}
            <div className="hidden md:block absolute top-1/2 left-16 right-16 h-0.5 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-emerald-500/30 -translate-y-6 pointer-events-none" />

            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 100} className="relative z-10">
                <div className="group h-full p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-300 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-2xl font-black flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-bold mb-3">
                    {step.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURED COMMUNITY NOTES SHOWCASE
      ════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 sm:mb-16 gap-6">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
                <span>✨ أحدث مذكرات المجتمع</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">أعمال مختارة من صنّاع المحتوى</h2>
              <p className="text-slate-400 text-sm sm:text-base">تصفح أبرز المذكرات المقترحة والمنشورة مؤخراً في السوق.</p>
            </FadeIn>

            <FadeIn>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all text-sm font-bold shadow-lg"
              >
                <span>عرض كل الأعمال في السوق</span>
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </FadeIn>
          </div>

          {featuredNotes.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.015]">
              <span className="text-5xl block mb-4">✨</span>
              <h3 className="text-lg font-bold text-white mb-2">كن أول من يثري سوق المذكرات</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                سجل حسابك وانشر مذكرتك الأولى الآن لتظهر هنا في مقدمة أعمال المجتمع.
              </p>
              <Link
                href="/register"
                className="inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-colors"
              >
                إنشاء حساب ونشر مذكرة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNotes.map((note: any, i: number) => {
                const authorName = note.author.fullName || note.author.username
                const categoryLabel = CATEGORY_LABELS[note.category as Category] ?? note.category
                const catColor = CATEGORY_COLORS[note.category] ?? 'bg-white/10 text-slate-300 border-white/10'

                return (
                  <FadeIn key={note.id} delay={i * 80}>
                    <Link
                      href={isLoggedIn ? `/notes/${note.id}` : '/access-required'}
                      className="group block h-full rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 hover:border-indigo-500/30 overflow-hidden relative shadow-lg"
                    >
                      {/* Note Cover */}
                      {note.coverImage ? (
                        <div className="h-44 overflow-hidden relative">
                          <div className="absolute inset-0 bg-slate-950/30 mix-blend-multiply group-hover:opacity-0 transition-opacity z-10" />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={note.coverImage}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      ) : (
                        <div
                          className="h-44 w-full relative overflow-hidden flex items-end p-4"
                          style={{ backgroundColor: note.coverColor || '#1e1b4b' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        </div>
                      )}

                      {/* Content Area */}
                      <div className="p-6 relative">
                        {/* Author Initial Circle Avatar */}
                        <div
                          className="absolute -top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center text-lg text-white font-black shadow-xl border-4 border-[#050508]"
                          style={{ backgroundColor: note.author.avatarColor || '#6366f1' }}
                        >
                          {authorName.charAt(0)}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-4 mt-2">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${catColor}`}>
                            {categoryLabel}
                          </span>

                          {note.visibility === 'FOR_SALE' && note.price ? (
                            <span className="text-[11px] bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/20">
                              {note.price.toString()} ج.م
                            </span>
                          ) : (
                            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                              مجاني
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-white text-lg mb-4 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                          {note.title}
                        </h3>

                        {/* Footer details */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            بقلم <strong className="text-slate-200 font-semibold">{authorName}</strong>
                          </span>

                          {note.downloads > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] text-slate-300 flex items-center gap-1 border border-white/5 font-mono">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              {note.downloads}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TESTIMONIALS SECTION
      ════════════════════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ════════════════════════════════════════════════════
          FAQ ACCORDION SECTION
      ════════════════════════════════════════════════════ */}
      <InteractiveFAQ />

      {/* ════════════════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-t border-white/[0.06] bg-gradient-to-b from-[#050508] to-[#090b14]">
        {/* Radial Lighting Mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6">
              <span>🚀 ابدأ مجاناً اليوم</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              جاهز لتحويل أفكارك <br className="hidden sm:inline" />
              إلى منتج معرفي حقيقي؟
            </h2>
            
            <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              سواء كنت مبرمجاً، كاتباً، طالباً، أو منشئ محتوى؛ تمنحك منصتنا كل الأدوات التي تحتاجها للنجاح والتربح.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="px-9 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-100 transition-all duration-300 shadow-[0_12px_32px_-8px_rgba(255,255,255,0.3)] hover:scale-[1.02] w-full sm:w-auto"
              >
                {isLoggedIn ? "الانتقال للوحة التحكم" : "ابدأ كتابة أول مذكرة مجاناً"}
              </Link>
              
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="px-9 py-4 bg-white/[0.04] border border-white/10 text-white font-bold rounded-2xl hover:bg-white/[0.08] transition-all duration-300 w-full sm:w-auto"
                >
                  تسجيل الدخول لحسابك
                </Link>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  )
}
