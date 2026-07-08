// app/api/marketplace/purchase/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import type { PurchaseDTO, PaymentInfo } from '@/types'

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  let body: { noteId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const { noteId } = body
  if (!noteId) {
    return NextResponse.json({ success: false, error: 'معرّف المذكرة مطلوب' }, { status: 400 })
  }

  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, paymentInfo: true },
        },
      },
    })

    if (!note) return NextResponse.json({ success: false, error: 'المذكرة غير موجودة' }, { status: 404 })
    if (note.authorId === user.userId) return NextResponse.json({ success: false, error: 'لا يمكنك شراء مذكرتك الخاصة' }, { status: 400 })
    if (note.visibility !== 'FOR_SALE') return NextResponse.json({ success: false, error: 'هذه المذكرة غير متاحة للشراء' }, { status: 400 })

    // التحقق من بيانات الدفع للبائع
    if (!note.author.paymentInfo) {
      return NextResponse.json(
        { success: false, error: 'البائع لم يضف بيانات الدفع بعد، الشراء غير متاح حالياً' },
        { status: 422 }
      )
    }

    const paymentInfo = note.author.paymentInfo as unknown as PaymentInfo

    // إذا كان طلب موجود مسبقاً — أرجع حالته مع alreadyExists: true
    const existing = await prisma.purchase.findUnique({
      where: { buyerId_noteId: { buyerId: user.userId, noteId } },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          purchase: {
            id: existing.id,
            noteId,
            noteTitle: note.title,
            price: Number(existing.price),
            status: existing.status,
            createdAt: existing.createdAt.toISOString(),
          } as PurchaseDTO,
          paymentInfo,
          alreadyExists: true,
        },
      })
    }

    // إنشاء طلب شراء جديد بحالة PENDING
    const purchase = await prisma.purchase.create({
      data: {
        buyerId: user.userId,
        sellerId: note.authorId,
        noteId,
        price: note.price ?? 0,
        status: 'PENDING',
      },
    })

    // إشعار للبائع من نوع PURCHASE مع اسم المشتري وعنوان المذكرة
    await createNotification(
      note.authorId,
      'PURCHASE',
      `طلب شراء جديد من @${user.username} لمذكرة "${note.title}"`
    )

    const purchaseDTO: PurchaseDTO = {
      id: purchase.id,
      noteId: purchase.noteId,
      noteTitle: note.title,
      price: Number(purchase.price),
      status: 'PENDING',
      createdAt: purchase.createdAt.toISOString(),
    }

    return NextResponse.json({ success: true, data: { purchase: purchaseDTO, paymentInfo } }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'يوجد طلب شراء مسبق' }, { status: 409 })
    }
    console.error('Purchase error:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
