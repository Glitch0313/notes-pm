// app/api/auth/register/route.ts

import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { rateLimit, getClientKey } from '@/lib/rate-limit'
import type { UserDTO } from '@/types'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  // 3 registrations per hour per IP
  const rl = rateLimit(getClientKey(request, 'register'), { limit: 3, windowSec: 3600 })
  if (!rl.success) {
    return Response.json(
      { success: false, error: 'تجاوزت الحد المسموح به لإنشاء الحسابات، حاول بعد ساعة' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { username, email, password } = body

    // ─── Validation ───────────────────────────────────────────────────────────
    if (!username || !email || !password) {
      return Response.json(
        { success: false, error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    if (typeof username !== 'string' || username.trim().length === 0) {
      return Response.json(
        { success: false, error: 'اسم المستخدم غير صالح' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { success: false, error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 8) {
      return Response.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // ─── Duplicate check ──────────────────────────────────────────────────────
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: email.toLowerCase().trim() },
        ],
      },
    })

    if (existingUser) {
      if (existingUser.username === username.trim()) {
        return Response.json(
          { success: false, error: 'اسم المستخدم مسجّل مسبقاً', code: 'USERNAME_TAKEN' },
          { status: 409 }
        )
      }
      return Response.json(
        { success: false, error: 'البريد الإلكتروني مسجّل مسبقاً', code: 'EMAIL_TAKEN' },
        { status: 409 }
      )
    }

    // ─── Create user ──────────────────────────────────────────────────────────
    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      },
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

    return Response.json({ success: true, data: userDTO }, { status: 201 })
  } catch (error) {
    console.error('[register]', error)
    return Response.json(
      { success: false, error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}
