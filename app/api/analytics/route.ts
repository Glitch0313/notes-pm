// app/api/analytics/route.ts — GET user analytics stats

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  try {
    // Run all queries in parallel
    const [
      totalNotes,
      publicNotes,
      forSaleNotes,
      downloadsAgg,
      byCategoryRaw,
      byVisibilityRaw,
      recentNotes,
      topDownloaded,
    ] = await Promise.all([
      // Total notes
      prisma.note.count({ where: { authorId: user.userId } }),

      // Public notes
      prisma.note.count({ where: { authorId: user.userId, visibility: 'PUBLIC' } }),

      // For sale notes
      prisma.note.count({ where: { authorId: user.userId, visibility: 'FOR_SALE' } }),

      // Total downloads
      prisma.note.aggregate({
        where: { authorId: user.userId },
        _sum: { downloads: true },
      }),

      // By category
      prisma.note.groupBy({
        by: ['category'],
        where: { authorId: user.userId },
        _count: { id: true },
      }),

      // By visibility
      prisma.note.groupBy({
        by: ['visibility'],
        where: { authorId: user.userId },
        _count: { id: true },
      }),

      // Notes created in last 14 days (for daily activity)
      prisma.note.findMany({
        where: {
          authorId: user.userId,
          createdAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        },
        select: { createdAt: true },
      }),

      // Top 5 downloaded
      prisma.note.findMany({
        where: { authorId: user.userId },
        orderBy: { downloads: 'desc' },
        take: 5,
        select: { id: true, title: true, downloads: true },
      }),
    ])

    // Build daily activity map for last 14 days
    const dailyMap: Record<string, number> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      dailyMap[key] = 0
    }
    for (const note of recentNotes) {
      const key = note.createdAt.toISOString().slice(0, 10)
      if (key in dailyMap) dailyMap[key]++
    }
    const dailyActivity = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    return NextResponse.json({
      success: true,
      data: {
        totalNotes,
        publicNotes,
        forSaleNotes,
        totalDownloads: downloadsAgg._sum.downloads ?? 0,
        byCategory: byCategoryRaw.map((r) => ({ category: r.category, count: r._count.id })),
        byVisibility: byVisibilityRaw.map((r) => ({ visibility: r.visibility, count: r._count.id })),
        dailyActivity,
        topDownloaded: topDownloaded.map((n) => ({ id: n.id, title: n.title, downloads: n.downloads })),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
