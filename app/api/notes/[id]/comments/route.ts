// GET/POST /api/notes/[id]/comments — list and create comments on a public note

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, getClientKey } from '@/lib/rate-limit'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.comment.findMany({
      where: { noteId: params.id },
      include: {
        user: { select: { id: true, username: true, fullName: true, avatarColor: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: comments })
  } catch (error) {
    console.error('[comments GET]', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })

  // 10 comments per minute per user
  const rl = rateLimit(`${user.userId}:comment`, { limit: 10, windowSec: 60 })
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'محاولات كثيرة، انتظر قليلاً' }, { status: 429 })
  }

  try {
    const { content } = await request.json()

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'محتوى التعليق مطلوب' }, { status: 400 })
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ success: false, error: 'التعليق طويل جداً (1000 حرف كحد أقصى)' }, { status: 400 })
    }

    const note = await prisma.note.findUnique({ where: { id: params.id } })
    if (!note || !note.isPublic) {
      return NextResponse.json({ success: false, error: 'المذكرة غير موجودة' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: { content: content.trim(), userId: user.userId, noteId: params.id },
      include: {
        user: { select: { id: true, username: true, fullName: true, avatarColor: true } },
      },
    })

    return NextResponse.json({ success: true, data: comment }, { status: 201 })
  } catch (error) {
    console.error('[comments POST]', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })

  try {
    const { commentId } = await request.json()

    const comment = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!comment) return NextResponse.json({ success: false, error: 'التعليق غير موجود' }, { status: 404 })

    if (comment.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    await prisma.comment.delete({ where: { id: commentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[comments DELETE]', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي' }, { status: 500 })
  }
}
