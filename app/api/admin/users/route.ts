// app/api/admin/users/route.ts — إدارة المستخدمين
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 20
  const role = searchParams.get('role') || 'ALL'
  const status = searchParams.get('status') || 'ALL'

  // بناء where clause ديناميكياً
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { username: { contains: search } },
      { email: { contains: search } },
      { fullName: { contains: search } },
    ]
  }

  if (role !== 'ALL') {
    where.role = role
  }

  if (status === 'active') {
    where.isActive = true
  } else if (status === 'inactive') {
    where.isActive = false
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, username: true, email: true, fullName: true,
        role: true, isActive: true, avatarColor: true, createdAt: true,
        _count: { select: { notes: true, purchases: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      users: users.map((u: any) => ({ ...u, createdAt: u.createdAt.toISOString() })),
      total, page, limit,
    },
  })
}
