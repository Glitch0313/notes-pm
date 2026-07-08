'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NoteEditor from '@/components/notes/NoteEditor'
import type { NoteInput } from '@/types'

export default function NewNotePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(data: NoteInput) {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 1000)
      } else {
        setError(json.error || 'فشل إنشاء المذكرة')
      }
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
          aria-label="رجوع"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مذكرة جديدة</h1>
          <p className="text-sm text-gray-500 mt-0.5">أنشئ مذكرة جديدة وشاركها مع العالم</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
          ✅ تم إنشاء المذكرة بنجاح! جارٍ التوجيه…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <NoteEditor onSubmit={handleSubmit} isLoading={isLoading} submitLabel="إنشاء المذكرة" />
      </div>
    </div>
  )
}
