'use client'

import { useState } from 'react'

type TabType = 'editor' | 'ai' | 'marketplace' | 'export'

export default function HeroPreview() {
  const [activeTab, setActiveTab] = useState<TabType>('editor')
  const [aiPrompt, setAiPrompt] = useState<string>('قم بتلخيص هذه المذكرة وإبراز النقاط العملية')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiResult, setAiResult] = useState<string>(
    'تتضمن المذكرة ٣ محاور رئيسية: تنظيم الأفكار، استخدام التنسيق الغني، وتحقيق عوائد مالية من خلال سوق المذكرات.'
  )

  const handleRunAi = (prompt: string) => {
    setAiPrompt(prompt)
    setIsGenerating(true)
    setTimeout(() => {
      if (prompt.includes('تلخيص')) {
        setAiResult('الموجز: استراتيجيات كتابة المذكرات التقنية وإعادة هيكلة المعرفة بأسلوب بسيط وجذاب.')
      } else if (prompt.includes('نقاط')) {
        setAiResult('١. تقسيم المحتوى لأقسام منطقية\n٢. استخدام وسوم التصنيف\n٣. التصدير بصيغة PDF عالية الجودة.')
      } else {
        setAiResult('صياغة متميزة: "تعتبر هذه المذكرة دليلاً شاملاً لكل صانع محتوى يسعى لتنظيم معرفته وترجمتها إلى القيمة."')
      }
      setIsGenerating(false)
    }, 600)
  }

  return (
    <div className="relative mt-12 sm:mt-16 max-w-5xl mx-auto px-4">
      {/* Background ambient lighting */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0c0d14]/90 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Top Header / Mac-style Window Controls + Tab Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          
          {/* Window Control Circles & URL */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>notevaultpro.app/workspace</span>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📝 المحرر الذكي</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>✨ مساعد AI</span>
            </button>

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === 'marketplace'
                  ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🛍️ بطاقات السوق</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === 'export'
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📄 تصدير PDF</span>
            </button>
          </div>
        </div>

        {/* Tab View Content */}
        <div className="p-6 sm:p-8 min-h-[320px] flex items-center justify-center">

          {/* TAB 1: SMART EDITOR PREVIEW */}
          {activeTab === 'editor' && (
            <div className="w-full space-y-4 animate-fade-up">
              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs font-bold">عريض B</span>
                  <span className="px-2 py-1 rounded bg-white/5 text-slate-300 text-xs font-bold">مائل I</span>
                  <span className="px-2 py-1 rounded bg-white/5 text-slate-300 text-xs font-bold underline">تحته خط U</span>
                  <div className="h-4 w-px bg-white/10 mx-1" />
                  <span className="px-2 py-1 rounded bg-white/5 text-slate-400 text-xs font-mono">{'</code>'}</span>
                  <span className="px-2 py-1 rounded bg-white/5 text-slate-400 text-xs">قائمة نقطية</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    حفظ تلقائي
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[11px]">342 كلمة</span>
                </div>
              </div>

              {/* Note Paper Canvas */}
              <div className="p-6 rounded-2xl bg-white/[0.015] border border-white/[0.06] space-y-4 text-right">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-white">دليل بناء المعرفة وإدارة المذكرات اليومية 🚀</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    تقنية وحواسيب
                  </span>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  تعد المذكرات وسيلتك الأقوى لتحويل الأفكار العابرة إلى أصول علمية ومعرفية دائمة. عند الكتابة عبر محرر <strong className="text-indigo-400 font-bold">NoteVaultPro</strong>، يمكنك الربط بين المفاهيم بسلاسة ودعم نصوصك بالأكواد البرمجية والجداول.
                </p>
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 text-xs sm:text-sm font-mono leading-relaxed">
                  <span className="text-indigo-400">// مقتطف كود مفاهيمي</span>
                  <br />
                  const note = new Note({'{ title: "أفكاري الإبداعية", category: "TECHNOLOGY", price: 0 }'});
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI COPILOT */}
          {activeTab === 'ai' && (
            <div className="w-full space-y-5 animate-fade-up">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">مساعد الذكاء الاصطناعي NoteVault AI</h4>
                    <p className="text-slate-400 text-xs">اختر أمراً أو اكتب استفسارك لتوليد وتلخيص المحتوى فوراً</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    'قم بتلخيص هذه المذكرة وإبراز النقاط العملية',
                    'استخرج الأفكار الرئيسية في نقاط',
                    'تحسين وتجميل الصياغة اللغوية',
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => handleRunAi(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        aiPrompt === p
                          ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative">
                <div className="flex items-center justify-between mb-3 text-xs text-purple-400 font-bold">
                  <span>النتيجة المولدة بالذكاء الاصطناعي</span>
                  {isGenerating && <span className="animate-pulse">جاري المعالجة...</span>}
                </div>
                <div className={`text-slate-200 text-sm leading-relaxed whitespace-pre-line transition-opacity duration-300 ${isGenerating ? 'opacity-40' : 'opacity-100'}`}>
                  {aiResult}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MARKETPLACE PREVIEW */}
          {activeTab === 'marketplace' && (
            <div className="w-full max-w-xl mx-auto animate-fade-up">
              <div className="group rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:border-amber-500/30 transition-all duration-300 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold mb-2">
                      سوق المذكرات • مدفوع
                    </span>
                    <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      دليل هندسة البرمجيات والتفكير المعماري
                    </h4>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="block text-2xl font-black text-amber-400">49 ج.م</span>
                    <span className="text-[11px] text-slate-400">تنزيل فوري</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  مذكرة شاملة تشرح أنماط التصميم البرمجي الحديثة، مع أمثلة تطبيقية مدعومة بمخططات تفاعلية وأكواد جاهزة.
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
                      م
                    </div>
                    <span>بقلم: <strong>د. محمد علي</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      ★ 4.9 (128 تقييم)
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold hover:bg-amber-600 transition-colors cursor-pointer">
                      شراء المذكرة
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PDF EXPORT PREVIEW */}
          {activeTab === 'export' && (
            <div className="w-full max-w-lg mx-auto animate-fade-up">
              <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <h5 className="text-white font-bold text-sm">تصدير وثيقة احترافية</h5>
                      <span className="text-slate-400 text-xs">دعم كامل للخطوط العربية والتنسيق</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    جاهز للتحميل
                  </span>
                </div>

                {/* Simulated Printed Document Page */}
                <div className="p-5 rounded-xl bg-white text-slate-900 text-right space-y-3 font-sans shadow-inner">
                  <div className="border-b pb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>NoteVaultPro Document Export</span>
                    <span>صفحة ١ من ٣</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">ملخص استراتيجية التفكير المنظومي</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    هذا المستند تم تصديره بدقة متناهية من منصة NoteVaultPro، مع الحفاظ على التباين البصري والمسافات البينية وتوافق الطباعة.
                  </p>
                  <div className="h-2 w-3/4 rounded bg-slate-200" />
                  <div className="h-2 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
