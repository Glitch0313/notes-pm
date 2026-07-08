'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { AnalyticsDTO } from '@/types'

// Dynamically import charts to avoid SSR issues with recharts
const BarChart = dynamic(() => import('@/components/analytics/BarChart'), { ssr: false })
const PieChart = dynamic(() => import('@/components/analytics/PieChart'), { ssr: false })
const LineChart = dynamic(() => import('@/components/analytics/LineChart'), { ssr: false })

interface StatCardProps {
  label: string
  value: number
  icon: string
  color: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('ar-SA')}</p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchAnalytics() {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analytics')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'فشل تحميل الإحصائيات')
      }
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32" dir="rtl">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center" dir="rtl">
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الإحصائيات والتحليلات</h1>
        <p className="text-sm text-gray-500 mt-0.5">نظرة شاملة على نشاطك الكتابي</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="إجمالي المذكرات" value={data.totalNotes} icon="📝" color="bg-indigo-50" />
        <StatCard label="المذكرات العامة" value={data.publicNotes} icon="🌐" color="bg-green-50" />
        <StatCard label="للبيع" value={data.forSaleNotes} icon="💰" color="bg-amber-50" />
        <StatCard label="إجمالي التحميلات" value={data.totalDownloads} icon="⬇️" color="bg-blue-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">توزيع المذكرات حسب التصنيف</h2>
          {data.byCategory.length > 0 ? (
            <BarChart data={data.byCategory} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">لا توجد بيانات بعد</p>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">توزيع المذكرات حسب الرؤية</h2>
          {data.byVisibility.length > 0 ? (
            <PieChart data={data.byVisibility} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">لا توجد بيانات بعد</p>
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">النشاط اليومي — آخر 14 يوماً</h2>
        <LineChart data={data.dailyActivity} />
      </div>

      {/* Top Downloaded */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">أكثر 5 مذكرات تحميلاً</h2>
        {data.topDownloaded.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">لا توجد تحميلات بعد</p>
        ) : (
          <ol className="space-y-3">
            {data.topDownloaded.map((note, i) => (
              <li key={note.id} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-800 truncate">{note.title}</span>
                <span className="text-sm font-semibold text-indigo-600 flex-shrink-0">
                  {note.downloads.toLocaleString('ar-SA')} ⬇️
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
