import { defineEventHandler, setResponseStatus, setHeader } from 'h3'
import { createErrorResponse } from '../utils/response'

/**
 * Rate limit configuration
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

/**
 * In-memory store for request tracking
 * Maps IP -> { count, resetTime }
 * Exported for testing purposes
 */
export const requestStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Get client IP from request
 */
function getClientIP(event: Parameters<typeof defineEventHandler>[0]): string {
  // Check for forwarded headers (proxy/load balancer)
  const forwarded = event.node.req.headers['x-forwarded-for']
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim()
  }

  // Check for real-ip header
  const realIp = event.node.req.headers['x-real-ip']
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp
  }

  // Fallback to socket remote address
  return event.node.req.socket.remoteAddress || '127.0.0.1'
}

/**
 * Rate limiting middleware
 * - Tracks requests per IP using in-memory Map
 * - Allows 100 requests per minute per IP
 * - Returns 429 when limit exceeded
 * - Sets X-RateLimit-Limit and X-RateLimit-Remaining headers
 */
export default defineEventHandler((event) => {
  const ip = getClientIP(event)
  const now = Date.now()

  // Get or create rate limit entry for this IP
  let entry = requestStore.get(ip)

  // Create new entry if none exists or window has expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    }
    requestStore.set(ip, entry)
  } else {
    // Increment count within current window
    entry.count++
  }

  // Calculate remaining requests
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count)

  // Set rate limit headers
  setHeader(event, 'X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
  setHeader(event, 'X-RateLimit-Remaining', String(remaining))
  setHeader(event, 'X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)))

  // Check if limit exceeded
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    setResponseStatus(event, 429)
    setHeader(event, 'Content-Type', 'application/json')

    // Return rate limit error response
    const response = createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please try again later.'
    )

    // Note: In real Nitro middleware, you would throw or end the response here
    // For now, we attach the error to the context for the route handler to check
    event.context.rateLimitExceeded = true
    event.context.rateLimitError = response
  }
})

/**
 * Check if rate limit has been exceeded for this request
 * Call this in your route handlers if you need to handle rate limiting
 */
export function checkRateLimit(event: Parameters<typeof defineEventHandler>[0]): boolean {
  return !!event.context.rateLimitExceeded
}

/**
 * Get the rate limit error response if limit was exceeded
 */
export function getRateLimitError(event: Parameters<typeof defineEventHandler>[0]): unknown {
  return event.context.rateLimitError
}
