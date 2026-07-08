// app/api/pdf/[id]/route.ts — تصدير المذكرة كملف HTML قابل للفتح في المتصفح

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'عام', TECHNOLOGY: 'تقنية', SCIENCE: 'علوم',
  LITERATURE: 'أدب', PHILOSOPHY: 'فلسفة', HISTORY: 'تاريخ',
  ART: 'فن', BUSINESS: 'أعمال',
}

function generateHTML(note: {
  title: string
  content: string
  category: string
  tags: string[]
  coverColor: string
  coverImage: string | null
  createdAt: Date
  author: { username: string; fullName: string | null }
}): string {
  const authorName = note.author.fullName || note.author.username
  const categoryLabel = CATEGORY_LABELS[note.category] || note.category
  const createdDate = new Date(note.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const tagsHtml = note.tags.length > 0
    ? note.tags.map(t => `<span class="tag">#${t}</span>`).join('')
    : ''
  const coverSection = note.coverImage
    ? `<div class="cover-img"><img src="${note.coverImage}" alt="غلاف المذكرة" /></div>`
    : `<div class="cover-bar" style="background:${note.coverColor}"></div>`

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${note.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Cairo', sans-serif;
      background: #f8f9fc;
      color: #1f2937;
      line-height: 1.8;
      direction: rtl;
    }

    .page {
      max-width: 800px;
      margin: 40px auto;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 4px 40px rgba(0,0,0,.08);
      overflow: hidden;
    }

    /* ── Header bar ── */
    .site-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 32px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
    }
    .site-name {
      font-size: 15px;
      font-weight: 700;
      color: #6366f1;
      letter-spacing: -.3px;
    }
    .print-btn {
      font-family: 'Cairo', sans-serif;
      background: #6366f1;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 7px 18px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s;
    }
    .print-btn:hover { background: #4f46e5; }

    /* ── Cover ── */
    .cover-bar { height: 6px; width: 100%; }
    .cover-img img {
      width: 100%;
      max-height: 320px;
      object-fit: cover;
      display: block;
    }

    /* ── Meta section ── */
    .meta {
      padding: 36px 40px 28px;
      border-bottom: 1px solid #f3f4f6;
    }
    .title {
      font-size: 30px;
      font-weight: 800;
      color: #111827;
      line-height: 1.4;
      margin-bottom: 16px;
    }
    .info-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 14px;
    }
    .category-badge {
      background: #ede9fe;
      color: #5b21b6;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .sep { color: #d1d5db; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
      background: #f3f4f6;
      color: #374151;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 12px;
    }

    /* ── Content ── */
    .content {
      padding: 36px 40px;
      font-size: 16px;
      color: #374151;
      line-height: 2;
    }

    /* Tiptap / prose styles */
    .content h1 { font-size: 26px; font-weight: 800; color: #111827; margin: 28px 0 12px; }
    .content h2 { font-size: 22px; font-weight: 700; color: #1f2937; margin: 24px 0 10px; }
    .content h3 { font-size: 18px; font-weight: 600; color: #374151; margin: 20px 0 8px; }
    .content p  { margin-bottom: 16px; }
    .content ul, .content ol { padding-right: 24px; margin-bottom: 16px; }
    .content li { margin-bottom: 6px; }
    .content blockquote {
      border-right: 4px solid #6366f1;
      padding: 12px 20px;
      background: #f5f3ff;
      border-radius: 8px;
      margin: 20px 0;
      color: #4b5563;
      font-style: italic;
    }
    .content code {
      background: #f3f4f6;
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 14px;
      direction: ltr;
      display: inline-block;
    }
    .content pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      margin: 20px 0;
      direction: ltr;
      text-align: left;
    }
    .content pre code { background: none; padding: 0; color: inherit; }
    .content img {
      max-width: 100%;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,.08);
      margin: 16px auto;
      display: block;
    }
    .content a { color: #6366f1; text-decoration: underline; }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
    }
    .content th, .content td {
      border: 1px solid #e5e7eb;
      padding: 10px 14px;
      text-align: right;
    }
    .content th { background: #f9fafb; font-weight: 700; }
    .content hr { border: none; border-top: 1px solid #e5e7eb; margin: 28px 0; }

    /* ── Footer ── */
    .page-footer {
      padding: 18px 40px;
      border-top: 1px solid #f3f4f6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #9ca3af;
      background: #fafafa;
    }

    /* ── Print ── */
    @media print {
      body { background: #fff; }
      .page { margin: 0; border-radius: 0; box-shadow: none; }
      .print-btn { display: none; }
    }
    @media (max-width: 640px) {
      .meta, .content { padding: 24px 20px; }
      .title { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="page">

    <header class="site-header">
      <span class="site-name">NoteVaultPro ✦</span>
      <button class="print-btn" onclick="window.print()">طباعة / حفظ PDF</button>
    </header>

    ${coverSection}

    <div class="meta">
      <h1 class="title">${note.title}</h1>
      <div class="info-row">
        <span class="category-badge">${categoryLabel}</span>
        <span class="sep">·</span>
        <span>${authorName}</span>
        <span class="sep">·</span>
        <span>${createdDate}</span>
      </div>
      ${tagsHtml ? `<div class="tags">${tagsHtml}</div>` : ''}
    </div>

    <div class="content">
      ${note.content}
    </div>

    <footer class="page-footer">
      <span>NoteVaultPro</span>
      <span>تم التصدير ${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </footer>

  </div>
</body>
</html>`
}

// ─── GET /api/pdf/[id] ────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const { id } = params

  try {
    const note = await prisma.note.findUnique({
      where: { id },
      include: { author: { select: { id: true, username: true, fullName: true } } },
    })

    if (!note) {
      return NextResponse.json({ success: false, error: 'المذكرة غير موجودة' }, { status: 404 })
    }

    const isOwner = note.authorId === user.userId

    if (note.visibility === 'FOR_SALE' && !isOwner) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const approvedPurchase = await (prisma.purchase.findFirst as any)({
        where: { noteId: id, buyerId: user.userId, status: 'APPROVED' },
      })
      if (!approvedPurchase) {
        return NextResponse.json({ success: false, error: 'يجب شراء هذه المذكرة أولاً' }, { status: 403 })
      }
    } else if (!isOwner && !note.isPublic) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بتحميل هذه المذكرة' }, { status: 403 })
    }

    const tags: string[] = note.tags ? JSON.parse(note.tags) : []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n = note as any
    const html = generateHTML({
      title: n.title,
      content: n.content,
      category: n.category,
      tags,
      coverColor: n.coverColor,
      coverImage: n.coverImage ?? null,
      createdAt: n.createdAt,
      author: { username: n.author.username, fullName: n.author.fullName },
    })

    // زيادة عداد التحميلات
    await prisma.note.update({ where: { id }, data: { downloads: { increment: 1 } } })

    const safeTitle = note.title.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').trim().slice(0, 50)
    const filename = `${safeTitle || 'note'}.html`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    console.error('HTML export error:', error)
    return NextResponse.json({ success: false, error: 'فشل التصدير، يرجى المحاولة مرة أخرى' }, { status: 500 })
  }
}
