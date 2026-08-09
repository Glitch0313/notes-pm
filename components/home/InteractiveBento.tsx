'use client'

import { useState } from 'react'
import FadeIn from '@/components/ui/FadeIn'

export default function InteractiveBento() {
  const [salesSimPrice, setSalesSimPrice] = useState<number>(35)
  const [salesSimCopies, setSalesSimCopies] = useState<number>(120)

  const calculatedRevenue = salesSimPrice * salesSimCopies

  return (
    <section className="relative py-24 sm:py-32 z-10">
      {/* Radial background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
              <span>⚡ ميزات استثنائية لصنّاع المحتوى</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
              كل ما تحتاجه لبناء، تنظيم، <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 via-purple-400 to-pink-400">
                ومشاركة معرفتك الاحترافية
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              صُممت منصة NoteVaultPro بعناية فائقة لتجمع بين بساطة التدوين وقوة التكنولوجيا الحديثة مع دعم كامل وحقيقي للغة العربية.
            </p>
          </FadeIn>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* CARD 1: RICH EDITOR (Col Span 2) */}
          <FadeIn delay={100} className="md:col-span-2">
            <div className="group relative h-full rounded-3xl bg-white/[0.02] border border-white/[0.08] p-7 sm:p-9 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 8.5-8.5z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">محرر نصوص متطور يدعم العربية بطلاقة</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  تجربة كتابة خالية من المشتتات، تدعم التنسيق المتقدم، قائمة العناوين، الجداول المقتطعة، الأكواد البرمجية الملونة، وإدراج الصور والوسائط بسرعة فائقة.
                </p>
              </div>

              {/* Card visual mockup snippet */}
              <div className="mt-4 p-4 rounded-2xl bg-[#090a10] border border-white/10 text-right space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                  <span className="font-mono text-indigo-400">Heading 1 • نص عريض • كود</span>
                  <span className="text-[11px] text-emerald-400">✓ متوافق مع الاتجاه العربي (RTL)</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-sans">
                  "التفكير المنظم ينبع من بيئة كتابة مرنة وسريعة تتيح للمفكر صياغة رؤيته بدون حدود."
                </p>
              </div>
            </div>
          </FadeIn>

          {/* CARD 2: AI COPILOT (Col Span 1) */}
          <FadeIn delay={200} className="md:col-span-1">
            <div className="group relative h-full rounded-3xl bg-white/[0.02] border border-white/[0.08] p-7 sm:p-9 hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-500 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.9 4.9L19 8l-4.1 1.1L13 14l-1.9-4.9L7 8l4.1-1.1L13 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">مساعد الذكاء الاصطناعي الذكي</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  نوفر لك نموذج ذكاء اصطناعي مدمج لمساعدتك في صياغة الأفكار، تلخيص النصوص طويلة، وإعادة الهيكلة بضغطة زر.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
                <span className="font-bold block mb-1">💡 اقتراح ذكي:</span>
                "تم تلخيص المذكرة في ٣ نقاط رئيسية جاهزة للتصدير"
              </div>
            </div>
          </FadeIn>

          {/* CARD 3: MONETIZATION SIMULATOR (Col Span 1) */}
          <FadeIn delay={300} className="md:col-span-1">
            <div className="group relative h-full rounded-3xl bg-white/[0.02] border border-white/[0.08] p-7 sm:p-9 hover:bg-white/[0.04] hover:border-amber-500/30 transition-all duration-500 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">حاسبة أرباح المذكرات</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  حاسبة تفاعلية تقديرية للدخل المتوقع عند بيع مذكراتك عبر السوق:
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex justify-between text-xs text-slate-300 font-bold">
                  <span>سعر المذكرة: <strong className="text-amber-400">{salesSimPrice} ج.م</strong></span>
                  <span>المبيعات: <strong className="text-amber-400">{salesSimCopies} نسخة</strong></span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={salesSimPrice}
                  onChange={(e) => setSalesSimPrice(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-white/10 h-1.5 rounded-lg cursor-pointer"
                />
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-slate-400">العائد المتوقع:</span>
                  <span className="text-base font-black text-emerald-400">+{calculatedRevenue.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* CARD 4: PDF EXPORT & PRINTING (Col Span 2) */}
          <FadeIn delay={400} className="md:col-span-2">
            <div className="group relative h-full rounded-3xl bg-white/[0.02] border border-white/[0.08] p-7 sm:p-9 hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-500 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">تصدير وثائق PDF بدقة عالية جاهزة للطباعة</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  حول مذكراتك بضغطة زر واحدة إلى مستندات PDF ناصعة الجودة تتطابق تماماً مع إعدادات الخطوط العربية المعاصرة والصفحات الأكاديمية.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 font-bold">
                  <span>تصدير سريع A4 / Letter</span>
                  <span>PDF 100%</span>
                </div>
                <div className="flex-1 w-full p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span>دعم كامل للجداول والصور</span>
                  <span>طباعة مباشرة</span>
                </div>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  )
}
