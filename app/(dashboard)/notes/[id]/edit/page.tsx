'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import NoteEditor from '@/components/notes/NoteEditor'
import type { NoteInput, NoteDTO } from '@/types'

export default function EditNotePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [note, setNote] = useState<NoteDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`/api/notes/${id}`)
        const json = await res.json()
        if (json.success) {
          setNote(json.data.note)
        } else {
          setError(json.error || 'المذكرة غير موجودة')
        }
      } catch {
        setError('تعذّر الاتصال بالخادم')
      } finally {
        setIsFetching(false)
      }
    }
    fetchNote()
  }, [id])

  async function handleSubmit(data: NoteInput) {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 1000)
      } else {
        setError(json.error || 'فشل تعديل المذكرة')
      }
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center py-20" dir="rtl">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20" dir="rtl">
        <p className="text-gray-500">{error || 'المذكرة غير موجودة'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 text-indigo-600 text-sm hover:underline"
        >
          العودة للداشبورد
        </button>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">تعديل المذكرة</h1>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{note.title}</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
          ✅ تم تحديث المذكرة بنجاح! جارٍ التوجيه…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <NoteEditor
          initialData={{
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags,
            coverColor: note.coverColor,
            coverImage: note.coverImage ?? null,
            visibility: note.visibility,
            price: note.price,
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="حفظ التعديلات"
        />
      </div>
    </div>
  )
}
