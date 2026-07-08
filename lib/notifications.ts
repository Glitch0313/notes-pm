// lib/notifications.ts — Notification creation helpers

import prisma from '@/lib/prisma'
import type { NotificationType } from '@/types'

/**
 * ينشئ إشعاراً جديداً للمستخدم في قاعدة البيانات
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type,
      message,
    },
  })
}
