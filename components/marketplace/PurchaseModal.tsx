'use client'

import { useState } from 'react'
import type { NoteDTO } from '@/types'

interface PurchaseModalProps {
  note: NoteDTO
  onConfirm: () => Promise<{ whatsappUrl: string; alreadyExists?: boolean }>
  onCancel: () => void
}

export default function PurchaseModal({ note, onConfirm, onCancel }: PurchaseModalProps) {
  const [step, setStep]     = useState<'confirm' | 'whatsapp'>('confirm')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const result = await onConfirm()
      setWhatsappUrl(result.whatsappUrl)
      setStep('whatsapp')
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إنشاء الطلب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 'confirm' ? 'تأكيد طلب الشراء' : 'أكمل الدفع عبر واتساب'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="إغلاق">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Note info */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-xs text-gray-400">المذكرة</p>
          <p className="font-semibold text-gray-900">{note.title}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-500">السعر</span>
            <span className="text-xl font-bold text-amber-600">
              {note.price !== null ? `${note.price.toString()} ج.م` : '—'}
            </span>
          </div>
        </div>

        {/* Step 1 — Confirm */}
        {step === 'confirm' && (
          <>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800 flex gap-3">
              <span className="text-lg">💬</span>
              <div>
                <p className="font-semibold mb-1">طريقة الدفع: واتساب</p>
                <p className="text-xs text-green-700 leading-relaxed">
                  بعد الضغط على "إنشاء الطلب"، سيُفتح واتساب مع رسالة جاهزة تحتوي تفاصيل طلبك.
                  أرسلها للأدمن وانتظر التأكيد — سيظهر زر التحميل تلقائياً.
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? '⏳ جارٍ الإنشاء…' : '📋 إنشاء الطلب'}
              </button>
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </>
        )}

        {/* Step 2 — WhatsApp */}
        {step === 'whatsapp' && (
          <>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 flex gap-3">
              <span className="text-lg">⏳</span>
              <div>
                <p className="font-semibold mb-1">تم إنشاء الطلب بنجاح!</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  اضغط الزر أدناه لإرسال تفاصيل الدفع للأدمن عبر واتساب.
                  بعد تأكيد الأدمن، سيظهر زر <strong>تحميل</strong> على المذكرة تلقائياً.
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl font-semibold text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              فتح واتساب وإرسال الطلب
            </a>

            <button
              onClick={onCancel}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              إغلاق
            </button>
          </>
        )}

      </div>
    </div>
  )
}
