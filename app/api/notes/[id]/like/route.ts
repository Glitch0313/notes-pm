// POST/DELETE /api/notes/[id]/like — toggle like on a public note

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })

  const note = await prisma.note.findUnique({ where: { id: params.id } })
  if (!note || !note.isPublic) {
    return NextResponse.json({ success: false, error: 'المذكرة غير موجودة' }, { status: 404 })
  }

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_noteId: { userId: user.userId, noteId: params.id } },
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      const count = await prisma.like.count({ where: { noteId: params.id } })
      return NextResponse.json({ success: true, liked: false, count })
    }

    await prisma.like.create({ data: { userId: user.userId, noteId: params.id } })
    const count = await prisma.like.count({ where: { noteId: params.id } })
    return NextResponse.json({ success: true, liked: true, count })
  } catch (error) {
    console.error('[like]', error)
    return NextResponse.json({ success: false, error: 'خطأ داخلي' }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request)

  const [count, liked] = await Promise.all([
    prisma.like.count({ where: { noteId: params.id } }),
    user
      ? prisma.like.findUnique({ where: { userId_noteId: { userId: user.userId, noteId: params.id } } })
      : Promise.resolve(null),
  ])

  return NextResponse.json({ success: true, count, liked: !!liked })
}
