// app/api/notes/[id]/route.ts — GET, PUT, DELETE

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import type { NoteInput, NoteDTO } from '@/types'

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

type RouteContext = { params: { id: string } }

// ─── GET /api/notes/:id ───────────────────────────────────────────────────────

export async function GET(request: NextRequest, { params }: RouteContext) {
  const user = getUserFromRequest(request)
  
  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true, fullName: true, avatarColor: true } },
    },
  })

  if (!note) {
    return NextResponse.json({ success: false, error: 'المذكرة غير موجودة' }, { status: 404 })
  }

  // ── Access Control ─────────────────────────────────────────────────────────
  const isAuthor = user?.userId === note.authorId
  const isPublic = note.visibility === 'PUBLIC' || note.visibility === 'FOR_SALE'

  if (!isAuthor && !isPublic) {
    return NextResponse.json({ success: false, error: 'ليس لديك صلاحية لعرض هذه المذكرة' }, { status: 403 })
  }

  // ── Purchase Check (for FOR_SALE notes) ──────────────────────────
  let purchaseStatus: string | null = null
  if (user && note.visibility === 'FOR_SALE' && !isAuthor) {
    const purchase = await prisma.purchase.findUnique({
      where: { buyerId_noteId: { buyerId: user.userId, noteId: note.id } }
    })
    purchaseStatus = purchase?.status || null
  }

  return NextResponse.json({ 
    success: true, 
    data: { 
      note: toNoteDTO(note),
      isAuthor,
      purchaseStatus
    } 
  })
}

// ─── PUT /api/notes/:id ───────────────────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const isAdmin = user.role === 'ADMIN'

  // Admin can edit any note; others can only edit their own
  const existing = await prisma.note.findFirst({
    where: isAdmin ? { id: params.id } : { id: params.id, authorId: user.userId },
  })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'المذكرة غير موجودة أو ليس لديك صلاحية' }, { status: 404 })
  }

  let body: Partial<NoteInput>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const { title, content, category, tags, coverColor, coverImage, visibility, price } = body

  // Validate price for FOR_SALE
  const newVisibility = visibility ?? existing.visibility
  if (newVisibility === 'FOR_SALE') {
    const newPrice = price !== undefined ? price : (existing.price ? Number(existing.price) : null)
    if (!newPrice || Number(newPrice) <= 0) {
      return NextResponse.json(
        { success: false, error: 'السعر يجب أن يكون أكبر من صفر' },
        { status: 400 }
      )
    }
  }

  const isPublic =
    newVisibility === 'PUBLIC' || newVisibility === 'FOR_SALE'

  try {
    const updated = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: tags.length > 0 ? JSON.stringify(tags) : null }),
        ...(coverColor !== undefined && { coverColor }),
        ...(coverImage !== undefined && { coverImage: coverImage ?? null }),
        ...(visibility !== undefined && { visibility, isPublic }),
        ...(price !== undefined && { price: newVisibility === 'FOR_SALE' ? price : null }),
        // updatedAt is handled automatically by Prisma @updatedAt
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarColor: true } },
      },
    })

    return NextResponse.json({ success: true, data: { note: toNoteDTO(updated) } })
  } catch (error: any) {
    console.error('Error updating note:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}

// ─── DELETE /api/notes/:id ────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const isAdmin = user.role === 'ADMIN'

  const existing = await prisma.note.findFirst({
    where: isAdmin ? { id: params.id } : { id: params.id, authorId: user.userId },
  })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'المذكرة غير موجودة أو ليس لديك صلاحية' }, { status: 404 })
  }

  try {
    // Cascade delete is handled automatically by Prisma schema (onDelete: Cascade)
    await prisma.note.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, data: { message: 'تم حذف المذكرة بنجاح' } })
  } catch (error: any) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
