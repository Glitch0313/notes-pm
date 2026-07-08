// PATCH /api/admin/users/[id]/status — تعطيل/تفعيل الحساب
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { validateAdminAction } from '@/lib/admin-utils'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const requester = getUserFromRequest(request)
  const err = validateAdminAction(requester, params.id)
  if (err) return NextResponse.json({ success: false, error: err.error }, { status: err.status })

  const { isActive } = await request.json()
  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ success: false, error: 'قيمة isActive يجب أن تكون boolean' }, { status: 400 })
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (!target) return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })

    const updated = await prisma.user.update({ where: { id: params.id }, data: { isActive } })
    return NextResponse.json({ success: true, data: { user: { id: updated.id, isActive: updated.isActive } } })
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
