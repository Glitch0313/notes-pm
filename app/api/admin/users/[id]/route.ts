// DELETE /api/admin/users/[id] — حذف المستخدم
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { validateAdminAction } from '@/lib/admin-utils'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const requester = getUserFromRequest(request)
  const err = validateAdminAction(requester, params.id)
  if (err) return NextResponse.json({ success: false, error: err.error }, { status: err.status })

  try {
    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (!target) return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })

    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, data: { deletedId: params.id } })
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
