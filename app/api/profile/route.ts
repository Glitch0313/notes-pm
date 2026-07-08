// app/api/profile/route.ts — GET & PUT user profile

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import type { PaymentInfo, ProfileInput, UserDTO } from '@/types'

function toUserDTO(u: any): UserDTO {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    bio: u.bio,
    avatarColor: u.avatarColor,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    paymentInfo: (u.paymentInfo as PaymentInfo | null) ?? null,
  }
}

// ─── GET /api/profile ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { user: toUserDTO(dbUser) } })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}

// ─── PUT /api/profile ─────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  let body: ProfileInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const { fullName, bio, avatarColor, paymentInfo } = body

  // ─── التحقق من paymentInfo ────────────────────────────────────────────────
  if (paymentInfo !== undefined && paymentInfo !== null) {
    const requiredFields: (keyof PaymentInfo)[] = ['bankName', 'accountNumber', 'accountHolder']
    for (const field of requiredFields) {
      if (!paymentInfo[field] || String(paymentInfo[field]).trim() === '') {
        return NextResponse.json(
          { success: false, error: `حقل ${field} مطلوب` },
          { status: 400 }
        )
      }
    }
  }

  // ─── بناء بيانات التحديث ──────────────────────────────────────────────────
  const updateData: Record<string, unknown> = {
    ...(fullName !== undefined && { fullName: fullName?.trim() || null }),
    ...(bio !== undefined && { bio: bio?.trim() || null }),
    ...(avatarColor !== undefined && { avatarColor }),
  }

  if (paymentInfo === null) {
    // مسح بيانات الدفع
    updateData.paymentInfo = null
  } else if (paymentInfo !== undefined) {
    // حفظ بيانات الدفع بعد التحقق
    updateData.paymentInfo = {
      bankName: paymentInfo.bankName.trim(),
      accountNumber: paymentInfo.accountNumber.trim(),
      accountHolder: paymentInfo.accountHolder.trim(),
    }
  }
  // إذا لم يُرسل paymentInfo → لا تغيير (لا نضيفه لـ updateData)

  try {
    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
    })
    return NextResponse.json({ success: true, data: { user: toUserDTO(updated) } })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
