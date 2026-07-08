// app/api/admin/db/route.ts — Database explorer for admin
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

const ALLOWED_TABLES = ['User', 'Note', 'Notification', 'Purchase', 'Setting'] as const
type TableName = (typeof ALLOWED_TABLES)[number]

// Fields to return per table (no passwordHash)
const TABLE_SELECT: Record<TableName, Record<string, boolean>> = {
  User: {
    id: true, username: true, email: true, fullName: true, role: true,
    isActive: true, avatarColor: true, bio: true, createdAt: true, updatedAt: true,
  },
  Note: {
    id: true, title: true, category: true, visibility: true, reviewStatus: true,
    downloads: true, isPinned: true, isPublic: true, price: true, tags: true,
    coverColor: true, coverImage: true, createdAt: true, updatedAt: true, authorId: true,
  },
  Notification: { id: true, type: true, message: true, isRead: true, createdAt: true, userId: true },
  Purchase: { id: true, price: true, status: true, createdAt: true, buyerId: true, sellerId: true, noteId: true },
  Setting: { key: true, value: true, updatedAt: true },
}

// Allowed editable fields per table
const EDITABLE_FIELDS: Record<TableName, string[]> = {
  User: ['fullName', 'role', 'isActive', 'bio', 'avatarColor'],
  Note: ['title', 'category', 'visibility', 'reviewStatus', 'isPinned', 'isPublic', 'price', 'tags', 'coverColor'],
  Notification: ['message', 'isRead'],
  Purchase: ['status'],
  Setting: ['value'],
}

function isAllowedTable(t: string): t is TableName {
  return ALLOWED_TABLES.includes(t as TableName)
}

function getPrismaModel(table: TableName) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = prisma as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map: Record<TableName, any> = {
    User: p.user,
    Note: p.note,
    Notification: p.notification,
    Purchase: p.purchase,
    Setting: p.setting,
  }
  return map[table]
}

function buildSearchWhere(table: TableName, search: string) {
  if (!search) return {}
  const s = { contains: search }
  const map: Record<TableName, object> = {
    User: { OR: [{ username: s }, { email: s }, { fullName: s }] },
    Note: { OR: [{ title: s }, { tags: s }] },
    Notification: { message: s },
    Purchase: { OR: [{ buyerId: s }, { noteId: s }] },
    Setting: { OR: [{ key: s }, { value: s }] },
  }
  return map[table]
}

function getPkField(table: TableName) {
  return table === 'Setting' ? 'key' : 'id'
}

// ── GET /api/admin/db?table=User&page=1&search=xx&limit=20 ──
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN')
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table') || ''
    if (!isAllowedTable(table))
      return NextResponse.json({ success: false, error: 'جدول غير صالح' }, { status: 400 })

    const page  = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(10, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search') || ''

    const model  = getPrismaModel(table)
    const where  = buildSearchWhere(table, search)
    const select = TABLE_SELECT[table]
    const orderBy = table === 'Setting' ? { key: 'asc' as const } : { createdAt: 'desc' as const }

    const [rows, total] = await Promise.all([
      model.findMany({ where, select, orderBy, skip: (page - 1) * limit, take: limit }),
      model.count({ where }),
    ])

    // Serialize dates & Decimal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized = rows.map((row: any) => {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(row)) {
        if (v instanceof Date) out[k] = (v as Date).toISOString()
        else if (v !== null && v !== undefined && typeof v === 'object' && typeof (v as Record<string, unknown>).toFixed === 'function')
          out[k] = Number(v)
        else out[k] = v
      }
      return out
    })

    return NextResponse.json({
      success: true,
      data: { rows: serialized, total, page, limit, table, editableFields: EDITABLE_FIELDS[table] },
    })
  } catch (err) {
    console.error('[admin/db GET]', err)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// ── PATCH /api/admin/db?table=User&id=xxx ── update row
export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN')
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table') || ''
    const id    = searchParams.get('id') || ''
    if (!isAllowedTable(table) || !id)
      return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })

    const body = await request.json()
    const allowed = EDITABLE_FIELDS[table]
    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) data[key] = body[key]
    }
    if (Object.keys(data).length === 0)
      return NextResponse.json({ success: false, error: 'لا توجد بيانات للتحديث' }, { status: 400 })

    const pkField = getPkField(table)
    const model   = getPrismaModel(table)

    const updated = await model.update({
      where: { [pkField]: id },
      data,
      select: TABLE_SELECT[table],
    })

    return NextResponse.json({ success: true, data: { row: updated } })
  } catch (err) {
    console.error('[admin/db PATCH]', err)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// ── DELETE /api/admin/db?table=User&id=xxx ── delete row
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN')
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table') || ''
    const id    = searchParams.get('id') || ''
    if (!isAllowedTable(table) || !id)
      return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })

    const pkField = getPkField(table)
    const model   = getPrismaModel(table)

    await model.delete({ where: { [pkField]: id } })

    return NextResponse.json({ success: true, data: { deleted: id } })
  } catch (err) {
    console.error('[admin/db DELETE]', err)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
