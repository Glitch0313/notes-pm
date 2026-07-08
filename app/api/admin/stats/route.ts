// app/api/admin/stats/route.ts — إحصائيات الأدمن
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
  }

  const [
    totalUsers,
    totalNotes,
    totalPublicNotes,
    totalDownloadsAgg,
    totalPurchases,
    recentUsers,
    recentNotes,
    topAuthors,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.note.count(),
    prisma.note.count({ where: { isPublic: true } }),
    prisma.note.aggregate({ _sum: { downloads: true } }),
    prisma.purchase.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, username: true, fullName: true, email: true, role: true, avatarColor: true, createdAt: true },
    }),
    prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, title: true, visibility: true, downloads: true, createdAt: true,
        author: { select: { username: true, fullName: true } },
      },
    }),
    prisma.user.findMany({
      select: {
        id: true, username: true, fullName: true, avatarColor: true,
        _count: { select: { notes: true } },
      },
      orderBy: { notes: { _count: 'desc' } },
      take: 5,
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      totalUsers,
      totalNotes,
      totalPublicNotes,
      totalDownloads: totalDownloadsAgg._sum.downloads ?? 0,
      totalPurchases,
      recentUsers: recentUsers.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      recentNotes: recentNotes.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      topAuthors,
    },
  })
}
