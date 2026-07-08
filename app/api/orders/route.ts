// app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import type { OrderItem, PurchaseStatus } from '@/types'

// ─── GET /api/orders ──────────────────────────────────────────────────────────
// يُرجع جميع طلبات الشراء الواردة على مذكرات البائع المسجّل

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  try {
    const purchases = await prisma.purchase.findMany({
      where: { sellerId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        note: { select: { title: true } },
        buyer: { select: { username: true, fullName: true } },
      },
    })

    const orders: OrderItem[] = purchases.map((p) => ({
      id: p.id,
      noteTitle: p.note.title,
      buyerUsername: p.buyer.username,
      buyerFullName: p.buyer.fullName,
      price: Number(p.price),
      status: p.status as PurchaseStatus,
      createdAt: p.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data: { orders } })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}

// ─── PATCH /api/orders ────────────────────────────────────────────────────────
// يُغيّر حالة طلب شراء (APPROVED أو REJECTED) مع إنشاء إشعار للمشتري

export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  let body: { purchaseId: string; status: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const { purchaseId, status } = body

  // التحقق من صحة الحالة
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return NextResponse.json(
      { success: false, error: 'الحالة غير صالحة، يجب أن تكون APPROVED أو REJECTED' },
      { status: 400 }
    )
  }

  try {
    // جلب طلب الشراء مع بيانات المذكرة
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { note: { select: { title: true } } },
    })

    if (!purchase) {
      return NextResponse.json({ success: false, error: 'طلب الشراء غير موجود' }, { status: 404 })
    }

    // التحقق من أن المستخدم هو البائع المالك للمذكرة
    if (purchase.sellerId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بهذا الإجراء' },
        { status: 403 }
      )
    }

    const noteTitle = purchase.note.title
    const notificationType = status === 'APPROVED' ? 'SUCCESS' : 'ERROR'
    const notificationMessage =
      status === 'APPROVED'
        ? `تم قبول طلب شراء مذكرة "${noteTitle}" — يمكنك الآن تحميلها`
        : `تم رفض طلب شراء مذكرة "${noteTitle}"`

    // تحديث الحالة وإنشاء الإشعار في نفس الـ transaction
    const [updatedPurchase] = await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchaseId },
        data: { status },
      }),
      prisma.notification.create({
        data: {
          userId: purchase.buyerId,
          type: notificationType,
          message: notificationMessage,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: { purchase: { id: updatedPurchase.id, status: updatedPurchase.status } },
    })
  } catch (error) {
    console.error('Orders PATCH error:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
