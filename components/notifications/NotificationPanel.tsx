'use client'

import { useState, useEffect } from 'react'
import type { NotificationDTO, NotificationType } from '@/types'

interface Props {
  onClose: () => void
  onMarkAllRead: () => void
  align?: 'left' | 'right' | 'center'
}

function getIcon(type: NotificationType): string {
  switch (type) {
    case 'SUCCESS':  return '✅'
    case 'INFO':     return 'ℹ️'
    case 'ERROR':    return '❌'
    case 'WARNING':  return '⚠️'
    case 'PURCHASE': return '💰'
    default:         return 'ℹ️'
  }
}

function getTypeStyle(type: NotificationType): string {
  switch (type) {
    case 'SUCCESS':  return 'bg-green-500/10 border-green-500/50'
    case 'INFO':     return 'bg-blue-500/10 border-blue-500/50'
    case 'ERROR':    return 'bg-red-500/10 border-red-500/50'
    case 'WARNING':  return 'bg-yellow-500/10 border-yellow-500/50'
    case 'PURCHASE': return 'bg-purple-500/10 border-purple-500/50'
    default:         return 'bg-slate-500/10 border-slate-500/50'
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('ar-SA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationPanel({ onClose, onMarkAllRead, align = 'right' }: Props) {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (!res.ok) return
        const json = await res.json()
        if (json.success) {
          setNotifications(json.data.notifications)
        }
      } finally {
        setLoading(false)
      }

      // Mark all as read
      try {
        await fetch('/api/notifications', { method: 'PATCH' })
        onMarkAllRead()
      } catch {
        // silent fail
      }
    }

    load()
  }, [onMarkAllRead])

  return (
    <div
      dir="rtl"
      className={`absolute top-full mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 z-50 overflow-hidden ring-1 ring-white/10 ${
        align === 'left' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-l from-indigo-950/30 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-100 tracking-wide">مركز الإشعارات</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="text-slate-400 hover:text-white transition-all p-1.5 rounded-lg hover:bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 animate-pulse">جاري التحميل...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-3xl">
              🔔
            </div>
            <p className="text-sm font-medium">لا توجد إشعارات حالياً</p>
            <p className="text-xs mt-1 opacity-60">سنخبرك بكل جديد هنا</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/50">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex gap-4 px-5 py-4 transition-all duration-300 hover:bg-slate-800/40 group relative overflow-hidden ${
                  !n.isRead ? 'bg-indigo-500/5' : 'opacity-80'
                }`}
              >
                {!n.isRead && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500" />
                )}
                <span className="text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                  {getIcon(n.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-200 leading-relaxed font-medium group-hover:text-white transition-colors">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[11px] text-slate-500">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            {notifications.length} إشعار متوفر
          </p>
          <button className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest font-bold">
            تنظيف الكل
          </button>
        </div>
      )}
    </div>
  )
}
