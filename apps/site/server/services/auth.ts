import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { hash, compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../utils/db'
import { users } from '../db/schema'

const SALT_ROUNDS = 10
const TOKEN_EXPIRY = '7d' // 7 days per AUTH-02
const REFRESH_THRESHOLD = 24 * 60 * 60 // 1 day in seconds per AUTH-03

/** JWT payload shape stored in token */
export interface AuthJWTPayload extends JWTPayload {
  userId: number
}

/** Password hashing with bcryptjs */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

/** Password verification */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

/** Generate JWT token with 7-day expiry (AUTH-02) */
export async function generateToken(userId: number): Promise<string> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)

  return new SignJWT({ userId } satisfies AuthJWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret)
}

/** Verify JWT token and return payload, or null if invalid/expired */
export async function getTokenPayload(token: string): Promise<AuthJWTPayload | null> {
  try {
    const config = useRuntimeConfig()
    const secret = new TextEncoder().encode(config.jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    return payload as AuthJWTPayload
  }
  catch {
    return null
  }
}

/** Check if token needs refresh (remaining < 1 day) and return new token (AUTH-03) */
export async function refreshTokenIfNeeded(token: string): Promise<string | null> {
  const payload = await getTokenPayload(token)
  if (!payload || !payload.exp) return null

  const now = Math.floor(Date.now() / 1000)
  const remaining = payload.exp - now

  // Refresh if less than 1 day remaining
  if (remaining < REFRESH_THRESHOLD) {
    return generateToken(payload.userId)
  }

  return null
}

/** Verify token and fetch user from database */
export async function getUserFromToken(token: string) {
  const payload = await getTokenPayload(token)
  if (!payload) return null

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)

    if (!user || user.status !== 'active') return null
    return user
  }
  catch {
    return null
  }
}
