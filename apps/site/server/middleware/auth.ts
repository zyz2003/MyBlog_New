import type { H3Event } from 'h3'
import { defineEventHandler } from 'h3'
import { jwtVerify, SignJWT, type JWTPayload } from 'jose'
import { HTTPError } from '../utils/error'

/**
 * JWT Secret - should be set via environment variable in production
 */
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'change-me-in-production')

/**
 * JWT expiry - 30 days
 */
const JWT_EXPIRY = '30d'

/**
 * Public paths that skip authentication entirely
 */
const PUBLIC_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register']

/**
 * Public prefixes for read operations (GET requests)
 */
const PUBLIC_PREFIXES = ['/api/v1/posts', '/api/v1/categories', '/api/v1/tags', '/api/v1/media']

/**
 * Protected prefixes that always require authentication
 */
const PROTECTED_PREFIXES = ['/api/v1/admin', '/api/v1/users']

/**
 * User context attached to H3Event
 */
export interface UserContext {
  id: string
  username: string
  role: 'admin' | 'author' | 'editor'
  email?: string
}

/**
 * JWT Payload structure
 */
export interface JWTPayload extends JWTPayload {
  id: string
  username: string
  role: string
  email?: string
}

/**
 * Extended H3Event context with user
 */
declare module 'h3' {
  interface H3EventContext {
    user?: UserContext
  }
}

/**
 * Check if a path matches a prefix
 */
function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix))
}

/**
 * Check if a path is public (no auth required)
 */
function isPublicPath(path: string, method: string): boolean {
  // Exact match for public paths
  if (PUBLIC_PATHS.includes(path)) {
    return true
  }

  // GET requests to public prefixes are allowed
  if (method === 'GET' && matchesPrefix(path, PUBLIC_PREFIXES)) {
    return true
  }

  return false
}

/**
 * Check if a path requires authentication
 */
function isProtectedPath(path: string): boolean {
  // Admin routes are always protected
  if (matchesPrefix(path, PROTECTED_PREFIXES)) {
    return true
  }

  // Non-GET requests to public prefixes are protected
  return true
}

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(event: H3Event): string | null {
  const authHeader = event.node.req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7)
}

/**
 * Verify JWT token and return payload
 */
async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    })
    return payload as JWTPayload
  } catch {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Attach user to event context
 */
function attachUser(event: H3Event, payload: JWTPayload): void {
  event.context.user = {
    id: payload.id,
    username: payload.username,
    role: payload.role as UserContext['role'],
    email: payload.email,
  }
}

/**
 * Send 401 Unauthorized response
 */
function unauthorized(event: H3Event, message: string): never {
  event.node.res.statusCode = 401
  event.node.res.setHeader('Content-Type', 'application/json')
  event.node.res.end(
    JSON.stringify({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
    })
  )
  // Never resolves - ends the request
  throw createError({ statusCode: 401, message })
}

/**
 * Create error with h3
 */
function createError({ statusCode, message }: { statusCode: number; message: string }): Error {
  const error = new Error(message) as Error & { statusCode: number }
  error.statusCode = statusCode
  throw error
}

/**
 * Authentication middleware
 * - Protects admin and write routes
 * - Allows public routes without auth
 * - Attaches user to event.context on valid token
 */
export default defineEventHandler(async (event) => {
  const path = event.node.req.url || ''
  const method = event.node.req.method || 'GET'

  // Skip auth for public paths
  if (isPublicPath(path, method)) {
    return
  }

  // Extract and verify token for protected routes
  const token = extractToken(event)

  if (!token) {
    // No token for protected route
    if (isProtectedPath(path)) {
      unauthorized(event, 'Authentication required')
    }
    return
  }

  try {
    const payload = await verifyToken(token)
    attachUser(event, payload)
  } catch {
    if (isProtectedPath(path)) {
      unauthorized(event, 'Invalid or expired token')
    }
    // For non-protected routes, silently ignore invalid token
  }
})

/**
 * Optional authentication helper - attaches user if token is valid, ignores if not
 * Use this for public routes that want to provide personalized content for logged-in users
 *
 * @example
 * export default defineEventHandler(async (event) => {
 *   await optionalAuth(event)
 *   // event.context.user is set if valid token, undefined otherwise
 * })
 */
export async function optionalAuth(event: H3Event): Promise<void> {
  const token = extractToken(event)

  if (!token) {
    return
  }

  try {
    const payload = await verifyToken(token)
    attachUser(event, payload)
  } catch {
    // Silently ignore invalid tokens
  }
}

/**
 * Require authentication - throws 401 if no valid token
 * Use this for explicit auth checks within route handlers
 *
 * @example
 * export default defineEventHandler(async (event) => {
 *   await requireAuth(event)
 *   // Safe to access event.context.user
 * })
 */
export async function requireAuth(event: H3Event): Promise<UserContext> {
  const token = extractToken(event)

  if (!token) {
    throw HTTPError.UNAUTHORIZED('Authentication required')
  }

  try {
    const payload = await verifyToken(token)
    attachUser(event, payload)
    return event.context.user!
  } catch {
    throw HTTPError.INVALID_TOKEN('Invalid or expired token')
  }
}

/**
 * Require specific role - throws 403 if user doesn't have required role
 *
 * @example
 * export default defineEventHandler(async (event) => {
 *   await requireRole(event, 'admin')
 *   // User has admin role
 * })
 */
export async function requireRole(event: H3Event, role: UserContext['role']): Promise<void> {
  const user = await requireAuth(event)

  if (user.role !== role) {
    throw HTTPError.FORBIDDEN(`Role '${role}' required`)
  }
}

/**
 * Require any of the specified roles - throws 403 if user doesn't have any of the roles
 *
 * @example
 * export default defineEventHandler(async (event) => {
 *   await requireAnyRole(event, ['admin', 'author'])
 *   // User has admin or author role
 * })
 */
export async function requireAnyRole(event: H3Event, roles: UserContext['role'][]): Promise<void> {
  const user = await requireAuth(event)

  if (!roles.includes(user.role)) {
    throw HTTPError.FORBIDDEN(`One of roles [${roles.join(', ')}] required`)
  }
}

/**
 * Generate JWT token for a user
 *
 * @example
 * const token = await generateToken({ id: '123', username: 'user', role: 'admin' })
 */
export async function generateToken(user: {
  id: string
  username: string
  role: string
  email?: string
}): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}
