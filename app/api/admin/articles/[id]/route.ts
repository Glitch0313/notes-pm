// app/api/admin/articles/[id]/route.ts — PATCH review article

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

type RouteContext = { params: { id: string } }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })

  let body: { status: 'APPROVED' | 'REJECTED' | 'NEEDS_EDIT'; note?: string }
  try { body = await request.json() }
  catch { return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 }) }

  const { status, note: reviewNote } = body
  if (!['APPROVED', 'REJECTED', 'NEEDS_EDIT'].includes(status))
    return NextResponse.json({ success: false, error: 'حالة غير صالحة' }, { status: 400 })

  const article = await prisma.note.findUnique({ where: { id: params.id } })
  if (!article) return NextResponse.json({ success: false, error: 'المذكرة غير موجودة' }, { status: 404 })

  await prisma.note.update({
    where: { id: params.id },
    data: { reviewStatus: status as any, reviewNote: reviewNote ?? null },
  })

  const msgs: Record<string, string> = {
    APPROVED:   `✅ تم قبول مذكرتك "${article.title}" ونشرها في السوق العام`,
    REJECTED:   `❌ تم رفض مذكرتك "${article.title}"${reviewNote ? ` — السبب: ${reviewNote}` : ''}`,
    NEEDS_EDIT: `✏️ مذكرتك "${article.title}" تحتاج تعديلاً${reviewNote ? `: ${reviewNote}` : ''}`,
  }

  await createNotification(
    article.authorId,
    status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'WARNING',
    msgs[status]
  )

  return NextResponse.json({ success: true, data: { status } })
}
