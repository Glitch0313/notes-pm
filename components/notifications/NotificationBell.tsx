'use client'

import { useState, useEffect, useRef } from 'react'
import NotificationPanel from './NotificationPanel'

export default function NotificationBell({ align }: { align?: 'left' | 'right' | 'center' }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const json = await res.json()
      if (json.success) {
        setUnreadCount(json.data.unreadCount)
      }
    } catch {
      // silent fail
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    if (!isOpen) {
      // Reset count optimistically when opening
      setUnreadCount(0)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        aria-label="الإشعارات"
        className="relative p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {/* Bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          onClose={() => setIsOpen(false)}
          onMarkAllRead={() => setUnreadCount(0)}
          align={align}
        />
      )}
    </div>
  )
}
