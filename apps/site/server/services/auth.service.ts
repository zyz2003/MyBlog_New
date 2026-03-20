/**
 * Authentication Service
 *
 * Provides user authentication functionality including:
 * - Password hashing and verification
 * - JWT token generation
 * - Login/logout operations
 * - Token blacklist management
 */

import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { eq, type LibSQLDatabase } from 'drizzle-orm'
import { users } from '@my-blog/database/schema'
import { HTTPError } from '../utils/error'

/**
 * Database instance - uses default db in production, can be overridden for tests
 */
let databaseInstance: LibSQLDatabase | null = null

/**
 * Set the database instance (used for testing)
 */
export function setDatabaseInstance(db: LibSQLDatabase): void {
  databaseInstance = db
}

/**
 * Get the database instance
 */
async function getDatabase(): Promise<LibSQLDatabase> {
  if (databaseInstance) {
    return databaseInstance
  }
  // Lazy load default database
  const { db } = await import('@my-blog/database')
  return db
}

/**
 * JWT Secret - should be set via environment variable in production
 */
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'change-me-in-production')

/**
 * JWT expiry - 30 days
 */
const JWT_EXPIRY = '30d'

/**
 * Bcrypt salt rounds (cost factor)
 */
const BCRYPT_COST = 10

/**
 * In-memory token blacklist for logout functionality
 * In production, consider using Redis for distributed blacklist
 */
const tokenBlacklist = new Set<string>()

/**
 * Hash a password using bcrypt
 *
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST)
}

/**
 * Verify a password against a hash
 *
 * @param password - Plain text password
 * @param hash - Bcrypt hash
 * @returns true if password matches hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * User object for token generation (excludes sensitive fields)
 */
export interface UserObject {
  id: string
  username: string
  email?: string
  role: string
}

/**
 * Login response type
 */
export interface LoginResponse {
  token: string
  user: UserObject
}

/**
 * Authenticate user and return JWT token
 *
 * @param username - User's username
 * @param password - User's password
 * @returns Object with token and user info (without password)
 * @throws HTTPError 401 if credentials are invalid
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  const db = await getDatabase()

  // Find user by username
  const userRecords = await db.select().from(users).where(eq(users.username, username)).limit(1)

  if (userRecords.length === 0) {
    throw HTTPError.UNAUTHORIZED('Invalid username or password')
  }

  const user = userRecords[0]

  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash)

  if (!isValidPassword) {
    throw HTTPError.UNAUTHORIZED('Invalid username or password')
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw HTTPError.UNAUTHORIZED('Account is disabled')
  }

  // Generate JWT token
  const token = await generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })

  // Update last login info
  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))

  // Return user object without sensitive fields
  const userObject: UserObject = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  }

  return {
    token,
    user: userObject,
  }
}

/**
 * Logout user by blacklisting their token
 *
 * @param token - JWT token to blacklist
 */
export async function logout(token: string): Promise<void> {
  // Add token to blacklist
  tokenBlacklist.add(token)

  // In a real application, you might want to:
  // 1. Store blacklist in Redis with TTL matching token expiry
  // 2. Log the logout event
  // 3. Invalidate any active sessions
}

/**
 * Check if a token is blacklisted
 *
 * @param token - JWT token to check
 * @returns true if token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token)
}

/**
 * Generate JWT token for a user
 *
 * @param user - User object with id, username, role, and optional email
 * @returns Signed JWT token string
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

/**
 * Clear the token blacklist (useful for testing)
 */
export function clearTokenBlacklist(): void {
  tokenBlacklist.clear()
}

/**
 * Register a new user
 *
 * @param username - User's username
 * @param password - User's password
 * @param email - User's email
 * @returns Created user object (without password)
 * @throws HTTPError 409 if username already exists
 */
export async function register(
  username: string,
  password: string,
  email: string
): Promise<UserObject> {
  const db = await getDatabase()

  // Check if username already exists
  const existingUsers = await db.select().from(users).where(eq(users.username, username)).limit(1)

  if (existingUsers.length > 0) {
    throw HTTPError.CONFLICT('Username already exists')
  }

  // Check if email already exists
  const existingEmails = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (existingEmails.length > 0) {
    throw HTTPError.CONFLICT('Email already exists')
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const newUser = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    role: 'author' as const,
    status: 'active' as const,
  }

  await db.insert(users).values(newUser).run()

  // Return user object without sensitive fields
  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  }
}

/**
 * Reset database instance (useful for testing)
 */
export function resetDatabaseInstance(): void {
  databaseInstance = null
}
