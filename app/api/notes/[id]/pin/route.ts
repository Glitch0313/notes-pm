// app/api/notes/[id]/pin/route.ts — Toggle pin status

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

type RouteContext = { params: { id: string } }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const note = await prisma.note.findUnique({
    where: { id: params.id },
  })

  if (!note) {
    return NextResponse.json({ success: false, error: 'المذكرة غير موجودة' }, { status: 404 })
  }

  // Only author or admin can pin
  if (note.authorId !== user.userId && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'ليس لديك صلاحية' }, { status: 403 })
  }

  const updated = await prisma.note.update({
    where: { id: params.id },
    data: { isPinned: !note.isPinned },
  })

  return NextResponse.json({
    success: true,
    data: { isPinned: updated.isPinned },
  })
}
