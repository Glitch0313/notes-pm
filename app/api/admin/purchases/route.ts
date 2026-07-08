// app/api/admin/purchases/route.ts — GET pending purchases

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'PENDING'

  const purchases = await prisma.purchase.findMany({
    where: { status: status as any },
    include: {
      buyer: { select: { id: true, username: true, fullName: true, avatarColor: true } },
      note:  { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    success: true,
    data: {
      purchases: purchases.map((p) => ({
        id: p.id,
        noteId: p.noteId,
        noteTitle: p.note.title,
        price: Number(p.price),
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        buyer: p.buyer,
      })),
      total: purchases.length,
    },
  })
}
