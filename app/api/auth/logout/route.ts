// app/api/auth/logout/route.ts

import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  })
  return response
}
