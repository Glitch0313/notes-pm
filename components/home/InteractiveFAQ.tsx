'use client'

import { useState } from 'react'
import FadeIn from '@/components/ui/FadeIn'

const FAQS = [
  {
    q: 'هل المنصة مجانية للاستخدام الشخصي؟',
    a: 'نعم! يمكنك التسجيل وإنشاء مذكراتك ومقالاتك الخاصة وتنظيمها مجاناً بالكامل دون أي رسوم تجديد.',
  },
  {
    q: 'كيف يمكنني التربح وبيع مذكراتي عبر السوق؟',
    a: 'عند إنشاء مذكرة، يمكنك تغيير حالتها إلى "للبيع" وتحديد السعر المناسب بالجنيه المصري (أو العملة المحلية). سيتم عرضها في سوق المنصة فوراً ويمكن للزوار شراؤها وتنزيلها.',
  },
  {
    q: 'هل تدعم المنصة التصدير بصيغة PDF باللغة العربية؟',
    a: 'بالتأكيد. تم بناء محرك التصدير خصيصاً لدعم اتجاه اللغة العربية من اليمين إلى اليسار (RTL) والحفاظ على جمالية الخطوط وتنسيق الجداول والصور.',
  },
  {
    q: 'كيف يعمل مساعد الذكاء الاصطناعي NoteVault AI؟',
    a: 'يستند المساعد الذكي إلى أحدث نماذج التوليد اللغوي لمساعدتك على تلخيص النصوص الطويلة، استخراج النقاط الهامة، وصياغة الأفكار بأسلوب احترافي.',
  },
  {
    q: 'هل بياناتي ومذكراتي الشخصية آمنة؟',
    a: 'نحن نولي الأمان أولوية قصوى. جميع مذكراتك الشخصية مصلحة ومحمية، ولا يتم مشاركة أي مذكرة للعامة إلا بإذن صريح منك عند اختيار نشرها.',
  },
]

export default function InteractiveFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative py-20 sm:py-28 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-12 sm:mb-16">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-4">
              <span>❓ الأسئلة الشائعة</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              كل ما تود معرفته عن المنصة
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              إليك إجابات شافية لأبرز التساؤلات حول استخدام NoteVaultPro.
            </p>
          </FadeIn>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <FadeIn key={faq.q} delay={index * 80}>
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-white/[0.04] border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                      : 'bg-white/[0.015] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-right gap-4 font-bold text-white text-base sm:text-lg focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-indigo-600 text-white' : ''
                      }`}
                    >
                      ↓
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-white/5 animate-fade-up">
                      {faq.a}
                    </div>
                  )}
                </div>
              </FadeIn>
            )
          })}
        </div>

      </div>
    </section>
  )
}
