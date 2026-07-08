'use client'

import { useState, useEffect } from 'react'
import type { UserDTO } from '@/types'

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6',
]

type PaymentType = 'bank' | 'vodafone'

export default function ProfilePage() {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarColor, setAvatarColor] = useState('#6366f1')

  // payment
  const [paymentEnabled, setPaymentEnabled] = useState(false)
  const [paymentType, setPaymentType] = useState<PaymentType>('bank')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile')
        const json = await res.json()
        if (json.success) {
          const u: UserDTO = json.data.user
          setUser(u)
          setFullName(u.fullName ?? '')
          setBio(u.bio ?? '')
          setAvatarColor(u.avatarColor)
          if (u.paymentInfo) {
            setPaymentEnabled(true)
            setBankName(u.paymentInfo.bankName)
            setAccountNumber(u.paymentInfo.accountNumber)
            setAccountHolder(u.paymentInfo.accountHolder)
            // detect vodafone: bankName starts with "فودافون" or is numeric phone
            if (u.paymentInfo.bankName.includes('فودافون') || u.paymentInfo.bankName === 'Vodafone Cash') {
              setPaymentType('vodafone')
            } else {
              setPaymentType('bank')
            }
          }
        } else {
          setError(json.error || 'فشل تحميل الملف الشخصي')
        }
      } catch {
        setError('تعذّر الاتصال بالخادم')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          bio,
          avatarColor,
          paymentInfo: paymentEnabled && accountNumber && accountHolder
            ? {
                bankName: paymentType === 'vodafone' ? 'Vodafone Cash' : bankName,
                accountNumber,
                accountHolder,
              }
            : null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setUser(json.data.user)
        setSuccess('تم حفظ الملف الشخصي بنجاح ✓')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(json.error || 'فشل حفظ الملف الشخصي')
      }
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32" dir="rtl">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  const displayName = fullName.trim() || user?.username || ''

  return (
    <div className="max-w-xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-sm text-gray-500 mt-0.5">تخصيص بياناتك الشخصية</p>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md"
          style={{ backgroundColor: avatarColor }}
        >
          {displayName.charAt(0).toUpperCase() || '?'}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="أدخل اسمك الكامل"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Username (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            اسم المستخدم <span className="text-gray-400 font-normal">(للعرض فقط)</span>
          </label>
          <input
            type="text"
            value={user?.username ?? ''}
            readOnly
            className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            البريد الإلكتروني <span className="text-gray-400 font-normal">(للعرض فقط)</span>
          </label>
          <input
            type="email"
            value={user?.email ?? ''}
            readOnly
            className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">النبذة التعريفية</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="اكتب نبذة مختصرة عنك…"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* Avatar Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">لون الأفاتار</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatarColor(color)}
                className={`w-9 h-9 rounded-full transition-transform hover:scale-110 ${
                  avatarColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
                aria-label={`لون ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t border-gray-100 pt-5">
          {/* Header + toggle */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">بيانات الاستلام</h2>
              <p className="text-xs text-gray-400 mt-0.5">يراها المشتري عند طلب شراء مذكرتك</p>
            </div>
            <button
              type="button"
              onClick={() => setPaymentEnabled(!paymentEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                paymentEnabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
              aria-label="تفعيل بيانات الدفع"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  paymentEnabled ? '-translate-x-6' : '-translate-x-1'
                }`}
              />
            </button>
          </div>

          {paymentEnabled && (
            <div className="mt-4 space-y-4">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setPaymentType('bank'); setBankName(''); setAccountNumber(''); setAccountHolder('') }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    paymentType === 'bank'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">🏦</span>
                  حساب بنكي
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentType('vodafone'); setBankName('Vodafone Cash'); setAccountNumber(''); setAccountHolder('') }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    paymentType === 'vodafone'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">📱</span>
                  فودافون كاش
                </button>
              </div>

              {/* Bank fields */}
              {paymentType === 'bank' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">اسم البنك</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="مثال: بنك مصر، CIB، الأهلي"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">رقم الحساب / IBAN</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="EG00 0000 0000 0000 0000 0000 0000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">اسم صاحب الحساب</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="الاسم كما يظهر في البنك"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              )}

              {/* Vodafone fields */}
              {paymentType === 'vodafone' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">رقم فودافون كاش</label>
                    <input
                      type="tel"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      dir="ltr"
                      maxLength={11}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">اسم صاحب المحفظة</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                </div>
              )}

              {/* Status badge */}
              {user?.paymentInfo && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <span>✓</span>
                  <span>بيانات الدفع مفعّلة — المشترون يستطيعون رؤيتها</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            {success}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isSaving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  )
}
