import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'غير مصرح لك' }, { status: 401 })
    }

    const { canShare } = await req.json()
    const { id } = params

    const updated = await prisma.note.update({
      where: { id },
      data: { canShare },
    })

    return NextResponse.json({ success: true, data: { canShare: updated.canShare } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
