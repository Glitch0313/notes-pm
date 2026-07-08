// app/api/auth/login/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth'
import { rateLimit, getClientKey } from '@/lib/rate-limit'
import type { UserDTO } from '@/types'

export async function POST(request: Request) {
  // 5 attempts per minute per IP
  const rl = rateLimit(getClientKey(request, 'login'), { limit: 5, windowSec: 60 })
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'محاولات كثيرة، يرجى الانتظار دقيقة ثم المحاولة مجدداً' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    const GENERIC_ERROR = 'بيانات الدخول غير صحيحة'

    if (!user) {
      return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'تم تعطيل هذا الحساب، تواصل مع الإدارة' },
        { status: 403 }
      )
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    const userDTO: UserDTO = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      avatarColor: user.avatarColor,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }

    const response = NextResponse.json(
      { success: true, data: { user: userDTO, token } },
      { status: 200 }
    )

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    console.error('[login]', error)
    return NextResponse.json(
      { success: false, error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}
