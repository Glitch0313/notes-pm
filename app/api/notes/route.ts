// app/api/notes/route.ts — GET (list) & POST (create)

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import type { NoteInput, NoteDTO, Category } from '@/types'

// ─── Helper: map Prisma note to NoteDTO ──────────────────────────────────────

function toNoteDTO(note: any): NoteDTO {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    category: note.category,
    tags: note.tags ? JSON.parse(note.tags) : [],
    coverColor: note.coverColor,
    visibility: note.visibility,
    price: note.price !== null ? Number(note.price) : null,
    downloads: note.downloads,
    isPinned: note.isPinned,
    isPublic: note.isPublic,
    coverImage: note.coverImage ?? null,
    reviewStatus: note.reviewStatus,
    reviewNote: note.reviewNote ?? null,
    canShare: note.canShare,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    author: {
      id: note.author.id,
      username: note.author.username,
      fullName: note.author.fullName,
      avatarColor: note.author.avatarColor,
    },
  }
}

// ─── GET /api/notes ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit

  // Build where clause — admin sees all notes, others see only their own
  const where: any = user.role === 'ADMIN' ? {} : { authorId: user.userId }

  if (category) {
    where.category = category as Category
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ]
  }

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarColor: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.note.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      notes: notes.map(toNoteDTO),
      total,
      page,
      limit,
    },
  })
}

// ─── POST /api/notes ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  let body: NoteInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const { title, content, category, tags, coverColor, coverImage, visibility, price } = body

  // Validate required fields
  if (!title?.trim()) {
    return NextResponse.json({ success: false, error: 'العنوان مطلوب' }, { status: 400 })
  }
  if (!content?.trim()) {
    return NextResponse.json({ success: false, error: 'المحتوى مطلوب' }, { status: 400 })
  }
  if (!visibility) {
    return NextResponse.json({ success: false, error: 'حالة الرؤية مطلوبة' }, { status: 400 })
  }

  // Validate price for FOR_SALE
  if (visibility === 'FOR_SALE') {
    if (!price || Number(price) <= 0) {
      return NextResponse.json(
        { success: false, error: 'السعر يجب أن يكون أكبر من صفر' },
        { status: 400 }
      )
    }
  }

  // Determine isPublic
  const isPublic = visibility === 'PUBLIC' || visibility === 'FOR_SALE'

  // Determine reviewStatus based on admin setting
  let reviewStatus: 'APPROVED' | 'PENDING' = 'APPROVED'
  if (isPublic && user.role !== 'ADMIN') {
    const setting = await prisma.setting.findUnique({ where: { key: 'require_approval' } })
    if (setting?.value === 'true') reviewStatus = 'PENDING'
  }

  try {
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || 'GENERAL',
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
        coverColor: coverColor || '#6366f1',
        coverImage: coverImage ?? null,
        visibility,
        price: visibility === 'FOR_SALE' && price ? price : null,
        isPublic,
        reviewStatus,
        authorId: user.userId,
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarColor: true } },
      },
    })

    // Create confirmation notification
    await createNotification(user.userId, 'SUCCESS', `تم حفظ المذكرة "${note.title}" بنجاح`)

    return NextResponse.json({ success: true, data: { note: toNoteDTO(note) } }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating note:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
