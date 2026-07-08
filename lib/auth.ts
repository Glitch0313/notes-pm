// lib/auth.ts — JWT helpers وbcrypt helpers

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-notevaultpro-2024'
const COOKIE_NAME = 'nvp_token'

// ─── bcrypt ───────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as JWTPayload
  } catch {
    return null
  }
}

// ─── Request helpers ──────────────────────────────────────────────────────────

export function getUserFromRequest(request: Request): JWTPayload | null {
  // 1. Try cookie
  const cookieHeader = request.headers.get('cookie') || ''
  const cookieMatch = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))

  if (cookieMatch) {
    const token = cookieMatch.split('=').slice(1).join('=')
    const payload = verifyToken(token)
    if (payload) return payload
  }

  // 2. Try Authorization header
  const authHeader = request.headers.get('authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return verifyToken(token)
  }

  return null
}

export { COOKIE_NAME }
