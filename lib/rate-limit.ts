// Simple in-memory rate limiter — suitable for single-instance deployments.
// For multi-instance production, replace the Map with a Redis-backed store.

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key)
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /** Number of requests allowed per window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSec * 1000
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const newEntry: Entry = { count: 1, resetAt: now + windowMs }
    store.set(key, newEntry)
    return { success: true, remaining: config.limit - 1, resetAt: newEntry.resetAt }
  }

  entry.count++
  const remaining = Math.max(0, config.limit - entry.count)
  const success = entry.count <= config.limit
  return { success, remaining, resetAt: entry.resetAt }
}

/** Extract a stable client key from a Request (IP or fallback) */
export function getClientKey(request: Request, suffix = ''): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return suffix ? `${ip}:${suffix}` : ip
}
