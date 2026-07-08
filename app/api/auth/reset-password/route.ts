// POST /api/auth/reset-password — validate token and update password

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'البيانات ناقصة' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      )
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token } })

    if (!reset || reset.used || reset.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'الرابط غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' })
  } catch (error) {
    console.error('[reset-password]', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
