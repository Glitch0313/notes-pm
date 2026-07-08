// app/api/admin/settings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

const DEFAULTS: Record<string, string> = {
  site_name:        'NoteVaultPro',
  site_description: 'منصة المذكرات الاحترافية',
  admin_whatsapp:   process.env.ADMIN_WHATSAPP_NUMBER || '',
  require_approval: 'false',
  allow_register:   'true',
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })

  const rows = await prisma.setting.findMany()
  const map: Record<string, string> = { ...DEFAULTS }
  rows.forEach((r: any) => { map[r.key] = r.value })

  return NextResponse.json({ success: true, data: { settings: map } })
}

export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })

  let body: Record<string, string>
  try { body = await request.json() }
  catch { return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 }) }

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  )

  // sync whatsapp to runtime env
  if (body.admin_whatsapp) process.env.ADMIN_WHATSAPP_NUMBER = body.admin_whatsapp

  return NextResponse.json({ success: true, data: { message: 'تم حفظ الإعدادات' } })
}
