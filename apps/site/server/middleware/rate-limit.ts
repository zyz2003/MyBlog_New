import { getRequestURL, getRequestIP } from 'h3'
import { errorResponse, RateLimitErrors } from '../utils/response'

/**
 * Rate limiting middleware — applies ONLY to POST /api/auth/login.
 *
 * Tracks requests per IP using an in-memory Map with a sliding window.
 * Allows 5 requests per 60-second window per IP. Returns 429 when exceeded.
 */

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5
const MAX_TRACKED_IPS = 10000 // Prevent memory exhaustion under attack

// In-memory store: key -> { count, resetAt }
const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup expired entries every 5 minutes (unref so it doesn't block shutdown)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
  // Evict oldest entries if store exceeds limit
  if (store.size > MAX_TRACKED_IPS) {
    const entries = [...store.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)
    const toDelete = entries.slice(0, store.size - MAX_TRACKED_IPS)
    for (const [key] of toDelete) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000).unref()

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const method = event.method

  // Only rate-limit POST /api/auth/login
  if (method !== 'POST' || path !== '/api/auth/login') return

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `${ip}:${path}`
  const now = Date.now()

  let entry = store.get(key)
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    store.set(key, entry)
  }

  entry.count++

  if (entry.count > MAX_REQUESTS) {
    throw createError({
      statusCode: 429,
      data: errorResponse(
        RateLimitErrors.TOO_MANY_REQUESTS.code,
        RateLimitErrors.TOO_MANY_REQUESTS.message,
      ),
    })
  }
})
