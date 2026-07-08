// app/api/admin/articles/route.ts — GET articles by reviewStatus

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'PENDING'

  const notes = await prisma.note.findMany({
    where: { reviewStatus: status as any, isPublic: true },
    include: { author: { select: { id: true, username: true, fullName: true, avatarColor: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    success: true,
    data: {
      notes: notes.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        visibility: n.visibility,
        coverImage: n.coverImage,
        reviewStatus: n.reviewStatus,
        reviewNote: n.reviewNote,
        canShare: n.canShare,
        createdAt: n.createdAt.toISOString(),
        author: n.author,
      })),
    },
  })
}
