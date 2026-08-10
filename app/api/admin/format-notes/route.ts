// app/api/admin/format-notes/route.ts — تنسيق تلقائي لجميع النوتس

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/** تحويل نص عادي إلى HTML منسق */
function plainToHtml(text: string): string {
  // إذا كان يحتوي على HTML فعلاً — لا تغيير
  if (/<[a-z][\s\S]*>/i.test(text)) return text

  return text
    .split(/\n{2,}/)                          // فصل بالفقرات
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => {
      // سطور تبدأ بـ - أو * → قائمة
      if (/^[-*]\s/.test(para)) {
        const items = para
          .split('\n')
          .filter(Boolean)
          .map((line) => `<li>${line.replace(/^[-*]\s/, '').trim()}</li>`)
          .join('')
        return `<ul>${items}</ul>`
      }
      // سطور تبدأ بـ # → عنوان
      if (/^#+\s/.test(para)) {
        const level = (para.match(/^(#+)/)?.[1].length ?? 1)
        const h = Math.min(level, 3)
        const content = para.replace(/^#+\s/, '').trim()
        return `<h${h}>${content}</h${h}>`
      }
      // فقرة عادية
      return `<p>${para.replace(/\n/g, '<br/>')}</p>`
    })
    .join('')
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
  }

  // جلب كل النوتس التي محتواها نص عادي (لا يحتوي HTML)
  const notes = await prisma.note.findMany({ select: { id: true, content: true } })

  const toUpdate = notes.filter((n: any) => !/<[a-z][\s\S]*>/i.test(n.content))

  if (toUpdate.length === 0) {
    return NextResponse.json({ success: true, data: { formatted: 0, message: 'كل النوتس منسقة بالفعل' } })
  }

  // تحديث دفعي
  await Promise.all(
    toUpdate.map((n: any) =>
      prisma.note.update({
        where: { id: n.id },
        data: { content: plainToHtml(n.content) },
      })
    )
  )

  return NextResponse.json({
    success: true,
    data: { formatted: toUpdate.length, message: `تم تنسيق ${toUpdate.length} مذكرة بنجاح` },
  })
}
