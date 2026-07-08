// app/api/marketplace/my-purchases/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })

  const purchases = await prisma.purchase.findMany({
    where: { buyerId: user.userId },
    select: { noteId: true, status: true },
  })

  return NextResponse.json({ success: true, data: { purchases } })
}
