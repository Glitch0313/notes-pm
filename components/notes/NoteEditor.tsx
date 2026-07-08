'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AIAssistant from './AIAssistant'
import AITypingOverlay from './AITypingOverlay'
import type { NoteInput, Category, Visibility } from '@/types'

const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false })

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'GENERAL', label: 'عام' },
  { value: 'TECHNOLOGY', label: 'تقنية' },
  { value: 'SCIENCE', label: 'علوم' },
  { value: 'LITERATURE', label: 'أدب' },
  { value: 'PHILOSOPHY', label: 'فلسفة' },
  { value: 'HISTORY', label: 'تاريخ' },
  { value: 'ART', label: 'فن' },
  { value: 'BUSINESS', label: 'أعمال' },
]

const COVER_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
]

interface NoteEditorProps {
  initialData?: Partial<NoteInput>
  onSubmit: (data: NoteInput) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export default function NoteEditor({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'حفظ المذكرة',
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [category, setCategory] = useState<Category>(initialData?.category ?? 'GENERAL')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [coverColor, setCoverColor] = useState(initialData?.coverColor ?? '#6366f1')
  const [visibility, setVisibility] = useState<Visibility>(initialData?.visibility ?? 'PRIVATE')
  const [price, setPrice] = useState<string>(
    initialData?.price != null ? String(initialData.price) : ''
  )
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage ?? null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [aiWorking, setAiWorking] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title ?? '')
      setContent(initialData.content ?? '')
      setCategory(initialData.category ?? 'GENERAL')
      setTags(initialData.tags ?? [])
      setCoverColor(initialData.coverColor ?? '#6366f1')
      setVisibility(initialData.visibility ?? 'PRIVATE')
      setPrice(initialData.price != null ? String(initialData.price) : '')
      setCoverImage(initialData.coverImage ?? null)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleImageUpload(file: File) {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.success) setCoverImage(json.data.url)
      else setError(json.error || 'فشل رفع الصورة')
    } catch {
      setError('تعذّر رفع الصورة')
    } finally {
      setUploadingImage(false)
    }
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const plainText = content.replace(/<[^>]*>/g, '').trim()
    if (!title.trim()) { setError('العنوان مطلوب'); return }
    if (!plainText) { setError('المحتوى مطلوب'); return }
    if (visibility === 'FOR_SALE' && (!price || Number(price) <= 0)) {
      setError('السعر يجب أن يكون أكبر من صفر عند اختيار "للبيع"')
      return
    }

    await onSubmit({
      title: title.trim(),
      content,
      category,
      tags,
      coverColor,
      coverImage: coverImage ?? null,
      visibility,
      price: visibility === 'FOR_SALE' ? Number(price) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" dir="rtl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">العنوان *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان المذكرة"
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          required
        />
      </div>

      {/* Content with AI */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">المحتوى *</label>
          <AIAssistant
            content={content}
            title={title}
            onApplyContent={(result) => setContent(result)}
            onApplyTags={(newTags) => setTags(Array.from(new Set([...tags, ...newTags])))}
            onApplyTitle={(newTitle) => setTitle(newTitle)}
            onLoadingChange={setAiWorking}
            onAutoFill={(data) => {
              setTitle(data.title)
              setContent(data.content)
              setTags(data.tags)
              setCategory(data.category as Category)
              if (data.coverImage) setCoverImage(data.coverImage)
            }}
          />
        </div>
        <div className="relative">
          <RichEditor
            content={content}
            onChange={setContent}
          />
          <AITypingOverlay visible={aiWorking} />
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">التصنيف</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">الوسوم</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="أضف وسماً واضغط Enter"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            إضافة
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-indigo-400 hover:text-indigo-700 leading-none"
                  aria-label={`حذف وسم ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cover Image */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">صورة الغلاف (اختياري)</label>
        {coverImage && (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 h-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt="غلاف" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setCoverImage(null)}
              className="absolute top-2 left-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full text-xs flex items-center justify-center transition"
              aria-label="حذف الصورة"
            >×</button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-sm cursor-pointer transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 hover:bg-indigo-50/40'}`}>
            <span>{uploadingImage ? '⏳' : '🖼️'}</span>
            <span className="text-gray-600">{uploadingImage ? 'جارٍ الرفع…' : 'رفع صورة'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={uploadingImage}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }}
            />
          </label>
          {coverImage && (
            <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-lg">✓ تم اختيار صورة</span>
          )}
        </div>
      </div>

      {/* Cover Color */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">لون الغلاف</label>
        <div className="flex flex-wrap gap-2 items-center">
          {COVER_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setCoverColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                coverColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`لون ${color}`}
            />
          ))}
          <input
            type="color"
            value={coverColor}
            onChange={(e) => setCoverColor(e.target.value)}
            className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer"
            title="لون مخصص"
          />
        </div>
      </div>

      {/* Visibility */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">حالة الرؤية</label>
        <div className="flex gap-3 flex-wrap">
          {[
            { value: 'PRIVATE', label: 'خاصة', desc: 'لا يراها أحد غيرك' },
            { value: 'PUBLIC', label: 'عامة', desc: 'مرئية للجميع مجاناً' },
            { value: 'FOR_SALE', label: 'للبيع', desc: 'مرئية بسعر محدد' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 min-w-[120px] flex flex-col gap-0.5 border rounded-xl p-3 cursor-pointer transition-colors ${
                visibility === opt.value
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value as Visibility)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              <span className="text-xs text-gray-500">{opt.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      {visibility === 'FOR_SALE' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">السعر (ج.م) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-40"
            required
          />
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'جارٍ الحفظ…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
