// POST /api/auth/forgot-password — send password reset email

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, getClientKey } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // 3 requests per 15 minutes per IP
  const rl = rateLimit(getClientKey(request, 'forgot-password'), { limit: 3, windowSec: 900 })
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'محاولات كثيرة، يرجى الانتظار 15 دقيقة' },
      { status: 429 }
    )
  }

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Always return success to prevent email enumeration
    if (!user || !user.isActive) {
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد مسجلاً، ستصلك رسالة قريباً',
      })
    }

    // Invalidate previous tokens for this user
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    await prisma.passwordReset.create({
      data: { token, expiresAt, userId: user.id },
    })

    try {
      await sendPasswordResetEmail(user.email, token)
    } catch (emailErr) {
      // Email failed but token is saved — log and continue gracefully
      console.error('[forgot-password] email send failed:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد مسجلاً، ستصلك رسالة قريباً',
    })
  } catch (error) {
    console.error('[forgot-password]', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
