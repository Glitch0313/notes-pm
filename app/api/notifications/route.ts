// app/api/notifications/route.ts — GET (list) & PATCH (mark all read)

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import type { NotificationDTO } from '@/types'

// ─── Helper: map Prisma notification to NotificationDTO ──────────────────────

function toNotificationDTO(n: any): NotificationDTO {
  return {
    id: n.id,
    type: n.type,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }
}

// ─── GET /api/notifications ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      notifications: notifications.map(toNotificationDTO),
      unreadCount,
    },
  })
}

// ─── PATCH /api/notifications ─────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: { userId: user.userId, isRead: false },
    data: { isRead: true },
  })

  return NextResponse.json({ success: true, data: { success: true } })
}
