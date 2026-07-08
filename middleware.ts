// middleware.ts — Route protection

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'nvp_token'
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-notevaultpro-2024'
)

// API routes that require auth
const PROTECTED_API_PREFIXES = [
  '/api/notes',
  '/api/analytics',
  '/api/profile',
  '/api/notifications',
]

// Page routes that require auth
const PROTECTED_PAGE_PREFIXES = ['/dashboard', '/notes', '/analytics', '/profile', '/admin']

function getToken(request: NextRequest): string | null {
  // 1. Cookie
  const cookie = request.cookies.get(COOKIE_NAME)?.value
  if (cookie) return cookie

  // 2. Authorization header
  const auth = request.headers.get('authorization') || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p))
  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((p) => pathname.startsWith(p))

  if (!isProtectedApi && !isProtectedPage) {
    return NextResponse.next()
  }

  const token = getToken(request)
  let valid = false

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      valid = true
    } catch {
      valid = false
    }
  }

  if (!valid) {
    if (isProtectedApi) {
      return Response.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      )
    }
    // Page redirect
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/notes',
    '/notes/:path*',
    '/analytics',
    '/analytics/:path*',
    '/profile',
    '/profile/:path*',
    '/admin',
    '/admin/:path*',
    '/api/notes/:path*',
    '/api/analytics/:path*',
    '/api/profile/:path*',
    '/api/notifications/:path*',
    '/api/pdf/:path*',
    '/api/orders/:path*',
  ],
}
