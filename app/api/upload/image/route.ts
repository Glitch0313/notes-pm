// app/api/upload/image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ success: false, error: 'لم يتم اختيار صورة' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ success: false, error: 'نوع الملف غير مدعوم — JPG، PNG، WebP، GIF فقط' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ success: false, error: 'حجم الصورة يتجاوز 5MB' }, { status: 400 })

  const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads')

  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  return NextResponse.json({ success: true, data: { url: `/uploads/${filename}` } })
}
