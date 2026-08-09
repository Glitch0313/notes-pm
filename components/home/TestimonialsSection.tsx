'use client'

import FadeIn from '@/components/ui/FadeIn'

const REVIEWS = [
  {
    name: 'أحمد محمود',
    role: 'كاتب تقني ومدون',
    avatarBg: '#6366f1',
    initial: 'أ',
    text: 'منصة NoteVaultPro غيرت نظرتي لتنظيم المقالات والكتب. التصدير لصيغة PDF يدعم الخطوط العربية بنقاء تام وبدون أي تشوه.',
    stars: 5,
    tag: 'مستخدم محترف',
  },
  {
    name: 'سارة العتيبي',
    role: 'باحثة أكاديمية',
    avatarBg: '#ec4899',
    initial: 'س',
    text: 'مساعد الذكاء الاصطناعي يوفر عليّ ساعات من التلخيص وإعادة الهيكلة. تجربة التدوين سلسة ومريحة للعين في الوضع الداكن.',
    stars: 5,
    tag: 'صانعة محتوى',
  },
  {
    name: 'د. طارق خليل',
    role: 'محاضر ومؤلف',
    avatarBg: '#10b981',
    initial: 'ط',
    text: 'تمكنت من نشر ملخصاتي الأكاديمية وتحقيق عائد مالي ممتاز عبر سوق المذكرات. الشفافية وسهولة المعاملات رائعة.',
    stars: 5,
    tag: 'بائع متميز',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-white/[0.06] bg-slate-950/40 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold mb-4">
              <span>💬 آراء وصنّاع الأفكار</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              ماذا يقول مجتمع الكتاب عن المنصة؟
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              انضم لأكثر من ١٠,٠٠٠ مستخدم يبنون مستقبل معارفهم وشاركهم النجاح.
            </p>
          </FadeIn>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, i) => (
            <FadeIn key={review.name} delay={i * 100}>
              <div className="group relative h-full rounded-3xl bg-white/[0.02] border border-white/[0.08] p-7 hover:bg-white/[0.04] hover:border-pink-500/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      {Array.from({ length: review.stars }).map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-bold">
                      {review.tag}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6 font-sans">
                    "{review.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg border border-white/10"
                    style={{ backgroundColor: review.avatarBg }}
                  >
                    {review.initial}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{review.name}</h4>
                    <span className="text-slate-400 text-xs">{review.role}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  )
}
