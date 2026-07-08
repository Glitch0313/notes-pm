'use client'

import { useEffect, useState } from 'react'

const LINES = [
  '// تحليل المحتوى...',
  'const ideas = await ai.generate()',
  'إعادة صياغة الجمل ✦',
  'تحسين الأسلوب والبنية...',
  '> اقتراح وسوم ذكية',
  'function enhance(text) {',
  '  return ai.rewrite(text)',
  '}',
  'جارٍ المعالجة... ██████░░',
  '✓ اكتمل التحليل',
]

export default function AITypingOverlay({ visible }: { visible: boolean }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState('')
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    if (!visible) {
      setVisibleLines([])
      setCurrentLine('')
      setLineIndex(0)
      setCharIndex(0)
      return
    }

    const line = LINES[lineIndex % LINES.length]

    if (charIndex < line.length) {
      const t = setTimeout(() => {
        setCurrentLine((prev) => prev + line[charIndex])
        setCharIndex((c) => c + 1)
      }, 28)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev.slice(-6), line])
        setCurrentLine('')
        setCharIndex(0)
        setLineIndex((i) => i + 1)
      }, 320)
      return () => clearTimeout(t)
    }
  }, [visible, lineIndex, charIndex])

  if (!visible) return null

  return (
    <div className="absolute inset-0 z-30 rounded-xl overflow-hidden flex flex-col justify-end"
      style={{ background: 'rgba(10,10,20,0.82)', backdropFilter: 'blur(2px)' }}>

      {/* top glow */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.18), transparent)' }} />

      {/* scanning line */}
      <div className="absolute left-0 right-0 h-px animate-scan pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, #818cf8, #a78bfa, #818cf8, transparent)', boxShadow: '0 0 12px 2px #818cf8' }} />

      {/* code lines */}
      <div className="px-5 pb-6 pt-4 font-mono text-xs leading-6 select-none">
        {visibleLines.map((line, i) => (
          <div key={i}
            className="text-indigo-300/70 truncate transition-opacity"
            style={{ opacity: 0.4 + (i / visibleLines.length) * 0.5 }}>
            {line}
          </div>
        ))}
        {/* active typing line */}
        <div className="text-indigo-200 flex items-center gap-1">
          <span>{currentLine}</span>
          <span className="inline-block w-1.5 h-4 bg-violet-400 animate-pulse rounded-sm" />
        </div>
      </div>

      {/* center badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <span className="text-2xl">🤖</span>
            </div>
          </div>
          <div className="bg-black/50 border border-indigo-500/30 rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-indigo-200 text-xs font-medium tracking-wide">مساعد AI يعمل...</span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
