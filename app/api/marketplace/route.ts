// app/api/marketplace/route.ts — GET المذكرات العامة مع بحث وفلترة وpagination

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { NoteDTO, Category } from '@/types'

// ─── Helper: map Prisma note to NoteDTO ──────────────────────────────────────

function toPublicNoteDTO(note: any): NoteDTO {
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

// ─── GET /api/marketplace ─────────────────────────────────────────────────────
// لا يتطلب مصادقة — متاح للزوار والمستخدمين المسجّلين

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit

  // Build where clause — فقط المذكرات العامة
  const where: any = { isPublic: true, reviewStatus: 'APPROVED' }

  if (category) {
    where.category = category as Category
  }

  if (search) {
    // Use Prisma fulltext search (requires fullTextIndex preview feature + MySQL FULLTEXT index)
    where.OR = [
      { title: { search } },
      { content: { search } },
      { title: { contains: search } },
    ]
  }

  try {
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, fullName: true, avatarColor: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.note.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        notes: notes.map(toPublicNoteDTO),
        total,
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Marketplace GET error:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
