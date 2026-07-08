// app/api/image-search/route.ts — fetch a relevant cover image by query

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || 'knowledge'
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY

  if (unsplashKey) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&w=1200`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` }, next: { revalidate: 0 } }
      )
      if (res.ok) {
        const data = await res.json()
        const url = data?.urls?.regular
        if (url) return NextResponse.json({ success: true, url })
      }
    } catch { /* fall through */ }
  }

  // Fallback: picsum with deterministic seed from query
  const seed = encodeURIComponent(query.slice(0, 30).replace(/\s+/g, ''))
  return NextResponse.json({
    success: true,
    url: `https://picsum.photos/seed/${seed}/1200/400`,
  })
}
