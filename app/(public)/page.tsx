import Link from 'next/link'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import type { Category } from '@/types'
import FadeIn from '@/components/ui/FadeIn'

const CATEGORY_LABELS: Record<Category, string> = {
  GENERAL: 'عام', TECHNOLOGY: 'تقنية', SCIENCE: 'علوم',
  LITERATURE: 'أدب', PHILOSOPHY: 'فلسفة', HISTORY: 'تاريخ',
  ART: 'فن', BUSINESS: 'أعمال',
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL:    'bg-white/5 text-slate-300 border-white/10',
  TECHNOLOGY: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SCIENCE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LITERATURE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PHILOSOPHY: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  HISTORY:    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ART:        'bg-pink-500/10 text-pink-400 border-pink-500/20',
  BUSINESS:   'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}

const MARQUEE_TAGS = [
  { icon: '✍️', label: 'كتابة إبداعية' },
  { icon: '🧠', label: 'تنظيم المعرفة' },
  { icon: '💡', label: 'أفكار ملهمة' },
  { icon: '📊', label: 'تحليلات ذكية' },
  { icon: '🌍', label: 'مجتمع عربي' },
  { icon: '🪄', label: 'ذكاء اصطناعي' },
  { icon: '💰', label: 'دخل من الكتابة' },
  { icon: '📚', label: 'مكتبة شخصية' },
  { icon: '🔐', label: 'خصوصية تامة' },
  { icon: '⚡', label: 'سرعة فائقة' },
]

const BENTO_FEATURES = [
  { icon: '🪄', title: 'محرر تفاعلي فائق', desc: 'تجربة كتابة ساحرة تدعم التنسيق الغني وإدراج الصور والمقتطفات البرمجية لتنظيم أفكارك.', colSpan: 'md:col-span-2', gradient: 'from-indigo-500/10 to-transparent' },
  { icon: '✨', title: 'مساعد الذكاء الاصطناعي', desc: 'لخّص نصوصك، حسّن صياغتك، ووسّع أفكارك فورياً باستخدام الذكاء الاصطناعي المدمج.', colSpan: 'md:col-span-1', gradient: 'from-violet-500/10 to-transparent' },
  { icon: '🛍️', title: 'سوق إبداعي متكامل', desc: 'انشر مذكراتك ليقرأها العالم، أو حدد سعراً وابدأ بالاستفادة مادياً من إبداعاتك.', colSpan: 'md:col-span-1', gradient: 'from-amber-500/10 to-transparent' },
  { icon: '📄', title: 'تصدير نقي وداعم للعربية', desc: 'صدّر أي مذكرة كملف PDF عالي الجودة بضغطة زر لدعم الطباعة والمشاركة بسرعة.', colSpan: 'md:col-span-2', gradient: 'from-emerald-500/10 to-transparent' },
]

const STEPS = [
  { num: '١', title: 'انضمام سريع',   desc: 'حسابك جاهز في أقل من دقيقة.' },
  { num: '٢', title: 'كتابة بشغف', desc: 'اكتب وألهم باستخدام أدواتنا الذكية.' },
  { num: '٣', title: 'مشاركة ونجاح',   desc: 'شارك مذكراتك أو افتح مصدر دخل جديد.' },
]

async function getLandingData() {
  try {
    const [featuredNotes, totalUsers, totalPublicNotes, totalDownloadsAgg] = await Promise.all([
      prisma.note.findMany({
        where: { isPublic: true },
        orderBy: { downloads: 'desc' },
        take: 6,
        select: {
          id: true, title: true, category: true, coverColor: true, coverImage: true,
          downloads: true, price: true, visibility: true,
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

export default async function HomePage() {
  const { featuredNotes, stats } = await getLandingData()
  const isLoggedIn = getIsLoggedIn()

  return (
    <div dir="rtl" className="bg-[#08080c] min-h-[100svh] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      
      {/* ════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════ */}
      <section className="relative pt-16 sm:pt-24 lg:pt-40 pb-16 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[85vh] sm:min-h-[90vh]">
        {/* Abstract glowing blobs */}
        <div className="absolute top-0 left-1/2 w-full max-w-[1000px] -translate-x-1/2 aspect-square bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] -translate-y-1/2 bg-violet-600/20 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] -translate-y-1/2 bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        
        {/* ── Orbital System (Planets & Rings) ── */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0" aria-hidden>
          {/* Inner Ring */}
          <div className="absolute w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-full border border-white/[0.04] animate-orbit-slow">
            <div className="absolute top-0 left-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,1)]" />
          </div>

          {/* Middle Ring */}
          <div className="absolute w-[440px] sm:w-[500px] h-[440px] sm:h-[500px] rounded-full border border-white/[0.03] animate-orbit-reverse-slow">
            <div className="absolute top-1/2 right-0 w-3 h-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,1)]" />
            <div className="absolute bottom-[15%] left-[15%] w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,1)]" />
          </div>

          {/* Outer Ring with Tags */}
          <div className="absolute w-[600px] sm:w-[720px] h-[600px] sm:h-[720px] rounded-full border border-white/[0.02] animate-orbit-slow" style={{ animationDuration: '35s' }}>
            {['تقنية', 'كتابة', 'إبداع', 'أعمال'].map((label, i) => {
              const deg = i * 90
              const rad = (deg * Math.PI) / 180
              const x = 50 + 50 * Math.cos(rad)
              const y = 50 + 50 * Math.sin(rad)
              return (
                <div key={label} className="absolute w-0 h-0" style={{ left: `${x}%`, top: `${y}%` }}>
                  <span className="absolute whitespace-nowrap bg-[#08080c]/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-300 shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
                        style={{ animation: `counter-spin 35s linear infinite` }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tech Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIwdi0yMHptLTIwIDBoMjB2MjBIMFYyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-50 pointer-events-none mask-image-[linear-gradient(to_bottom,white,transparent)]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, white 10%, transparent 90%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 mx-auto bg-white/5 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>المنصة الرائدة بالعربية الآن متاحة للجميع</span>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 sm:mb-6 tracking-tight leading-[1.15] sm:leading-[1.1]">
              نظّم <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">أفكارك</span>،
              <br />
              وشارك <span className="text-white">إبداعك</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-sm sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light">
              أدوات متطورة لكتابة احترافية، تنظيم ذكي، وسوق متكامل يسمح لك بنشر إبداعاتك وتحويلها إلى مصدر دخل. 
              تجربة جديدة لمشاركة المعرفة.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                <button className="relative w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-950 rounded-2xl text-white font-bold text-sm transition-all hover:bg-slate-900">
                  <span>ابدأ رحلتك مجاناً</span>
                  <svg className="w-4 h-4 translate-y-[1px] -rotate-180 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </Link>
              
              <Link href="/marketplace" className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm">
                <span>تصفح مذكرات المجتمع</span>
                <span className="text-lg opacity-80 group-hover:opacity-100">🌍</span>
              </Link>
            </div>
          </FadeIn>
        </div>


      </section>

      {/* ════════════════════════════════════════════════════
          MARQUEE TICKER
      ════════════════════════════════════════════════════ */}
      <div className="relative py-5 overflow-hidden border-y border-white/[0.04] bg-white/[0.01]">
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#08080c] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#08080c] to-transparent z-10 pointer-events-none" />
        <div className="flex gap-0 animate-marquee w-max" aria-hidden>
          {[...MARQUEE_TAGS, ...MARQUEE_TAGS].map((tag, i) => (
            <span key={i} className="flex items-center gap-2 text-slate-500 text-sm font-medium whitespace-nowrap px-6">
              <span className="text-base">{tag.icon}</span>
              {tag.label}
              <span className="text-slate-700 mr-6">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          STEPS / WORKFLOW
      ════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-24 z-10 border-t border-white/5 bg-slate-950/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 relative">
             {/* Gradient connection line - desktop only */}
             <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
             {/* Vertical connection line - mobile only */}
             <div className="md:hidden absolute top-[56px] bottom-[56px] left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent"></div>

             {STEPS.map((step, i) => (
               <FadeIn key={step.num} delay={i * 100} direction="up" className="flex-1 w-full relative z-10">
                 <div className="flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-[#0a0a0e] border border-indigo-500/30 flex items-center justify-center text-lg sm:text-xl text-indigo-400 font-bold md:mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                      {step.num}
                    </div>
                    <div className="text-right md:text-center">
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1 sm:mb-2">{step.title}</h3>
                      <p className="text-slate-400 text-sm">{step.desc}</p>
                    </div>
                 </div>
               </FadeIn>
             ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          BENTO FEATURES
      ════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-32 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
             <FadeIn>
              <h2 className="text-2xl sm:text-5xl font-black text-white mb-4 sm:mb-6">ميزات تفوق التوقعات</h2>
              <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                صممنا المنصة بعناية لتوفر لك تجربة استثنائية من مسودة مذكرتك الأولى وحتى تحقيق أرباح من نشرها.
              </p>
             </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-[220px] md:auto-rows-[250px]">
            {BENTO_FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 100} direction="up" className={feature.colSpan}>
                <div className={`group relative h-full rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-500 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/10`}>
                  {/* Subtle background gradient from bottom */}
                  <div className={`absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-tl ${feature.gradient} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700`}></div>
                  
                  <div className="relative z-10 p-8 flex flex-col h-full justify-end">
                    <div className="text-4xl mb-6">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS (Neon Glass Panels)
      ════════════════════════════════════════════════════ */}
       <section className="py-16 sm:py-20 relative border-y border-white/5 bg-gradient-to-b from-transparent to-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-4 relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                value: stats.totalUsers, label: 'كاتب ومستخدم', theme: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20'
              },
              {
                value: stats.totalPublicNotes, label: 'مذكرة منشورة', theme: 'from-violet-400 to-fuchsia-500', shadow: 'shadow-fuchsia-500/20'
              },
              {
                value: stats.totalDownloads, label: 'عملية تحميل', theme: 'from-blue-400 to-indigo-500', shadow: 'shadow-indigo-500/20'
              },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 150} direction="up">
                <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  <div className="bg-[#0b0b12] rounded-3xl p-8 text-center relative z-10 border border-white/5 h-full">
                    <span className={`block text-5xl font-black tabular-nums bg-gradient-to-br ${s.theme} text-transparent bg-clip-text mb-3`}>
                      {s.value > 0 ? '+' : ''}{s.value.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-slate-400 font-medium text-sm">{s.label}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURED NOTES
      ════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-32 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 sm:mb-16 gap-4 sm:gap-6">
            <FadeIn>
              <h2 className="text-2xl sm:text-5xl font-black text-white mb-2 sm:mb-4">أعمال ملهمة من المجتمع</h2>
              <p className="text-slate-400 text-sm">استكشف أفضل المذكرات والمقالات التي تم إنشاؤها عبر المنصة.</p>
            </FadeIn>
            <FadeIn>
              <Link href="/marketplace" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors text-sm font-semibold">
                عرض كل الأعمال
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
              </Link>
            </FadeIn>
          </div>

          {featuredNotes.length === 0 ? (
            <div className="p-16 text-center border dashed border-white/10 rounded-3xl bg-white/[0.02]">
               <span className="text-4xl block mb-4">✨</span>
               <p className="text-slate-400 font-medium">كن أول من ينشر مذكرة لتعرض هنا أمام الآلاف.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNotes.map((note, i) => {
                const authorName    = note.author.fullName || note.author.username
                const categoryLabel = CATEGORY_LABELS[note.category as Category] ?? note.category
                const catColor      = CATEGORY_COLORS[note.category] ?? 'bg-white/10 text-slate-300 border-white/10'
                
                return (
                  <FadeIn key={note.id} delay={i * 100} direction="up">
                    <Link
                      href={isLoggedIn ? `/notes/${note.id}` : '/access-required'}
                      className="group block h-full rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all hover:border-indigo-500/30 overflow-hidden relative"
                    >
                      {note.coverImage ? (
                        <div className="h-40 overflow-hidden relative">
                          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply group-hover:opacity-0 transition-opacity z-10"></div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={note.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      ) : (
                        <div className="h-40 w-full relative overflow-hidden" style={{ backgroundColor: note.coverColor }}>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                      )}
                      
                      <div className="p-6 relative">
                        {/* Avatar bubble hovering over cover border */}
                         <div className="absolute -top-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center text-lg text-white font-bold shadow-xl border-4 border-[#0e0e13]"
                              style={{ backgroundColor: note.author.avatarColor || '#6366f1' }}>
                              {authorName.charAt(0)}
                         </div>

                        <div className="flex items-center gap-2 mb-4 mt-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${catColor}`}>
                            {categoryLabel}
                          </span>
                          {note.visibility === 'FOR_SALE' && note.price && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
                              {note.price.toString()} ج.م
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-100 text-lg mb-4 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                          {note.title}
                        </h3>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs text-slate-400 flex items-center gap-1.5">
                            بواسطة <strong className="text-slate-300 font-medium">{authorName}</strong>
                          </span>
                          {note.downloads > 0 && (
                            <span className="px-2 py-1 rounded-md bg-white/5 text-[11px] text-slate-400 flex items-center gap-1 border border-white/5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          CTA SECTION
      ════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-32 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-indigo-500/[0.02]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_70%)] rounded-full"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <FadeIn direction="up">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6">تبنّى أسلوباً جديداً</h2>
              <p className="text-slate-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
                سواء كنت مدوناً، مفكراً، أو منشئ محتوى؛ منصتنا هي بوابتك لعرض أفكارك بأفضل صورة مكنة.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/register"
                  className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-auto">
                  ابدأ كتابة أول مذكرة
                </Link>
                <Link href="/login"
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-2xl hover:bg-white/10 transition-colors w-full sm:w-auto">
                  تسجيل الدخول لحسابك
                </Link>
              </div>
            </FadeIn>
        </div>
      </section>

    </div>
  )
}
