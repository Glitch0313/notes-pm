// app/api/admin/purchases/[id]/route.ts — PATCH approve/reject

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

type RouteContext = { params: { id: string } }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
  }

  let body: { status: 'APPROVED' | 'REJECTED' }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })
  }

  if (!['APPROVED', 'REJECTED'].includes(body.status)) {
    return NextResponse.json({ success: false, error: 'حالة غير صالحة' }, { status: 400 })
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: params.id },
    include: { note: { select: { title: true } } },
  })

  if (!purchase) {
    return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 })
  }

  const updated = await prisma.purchase.update({
    where: { id: params.id },
    data: { status: body.status },
  })

  // إشعار للمشتري
  const msg = body.status === 'APPROVED'
    ? `✅ تم تأكيد دفعك وأصبح بإمكانك تحميل "${purchase.note.title}"`
    : `❌ تم رفض طلب شراء "${purchase.note.title}" — تواصل مع الدعم`

  await createNotification(purchase.buyerId, body.status === 'APPROVED' ? 'SUCCESS' : 'ERROR', msg)

  return NextResponse.json({ success: true, data: { id: updated.id, status: updated.status } })
}
