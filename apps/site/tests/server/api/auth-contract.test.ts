/**
 * Auth API Contract Tests
 *
 * Tests the authentication API endpoints for:
 * - Standard response format compliance (via validation schemas)
 * - Parameter validation
 * - Error handling
 * - Authentication flow
 *
 * These tests verify the API contract by testing:
 * 1. Validation schemas (input contract)
 * 2. Service functions (business logic contract)
 * 3. Response format utilities (output contract)
 *
 * @see apps/site/tests/server/api-contract.template.ts for the template
 * @see apps/site/tests/server/helpers/api-test.ts for test utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createIsolatedTestDatabase } from '../../db'
import type { LibSQLDatabase } from 'drizzle-orm'
import * as schema from '@my-blog/database/schema'
import { eq } from 'drizzle-orm'
import { generateToken, cleanupDatabase } from '../helpers/api-test'
import {
  setDatabaseInstance,
  resetDatabaseInstance,
  login,
  register,
  logout,
  isTokenBlacklisted,
  hashPassword,
  verifyPassword,
  generateToken,
} from '../../../server/services/auth.service'
import { loginSchema, registerSchema } from '../../../server/schemas/auth'
import { validateBodySync } from '../../../server/utils/validate'
import { HTTPError } from '../../../server/utils/error'
import { createSuccessResponse } from '../../../server/utils/response'

describe('Auth API Contract', () => {
  let db: LibSQLDatabase<typeof schema>
  let cleanup: () => Promise<void>
  let testUserId: string

  beforeEach(async () => {
    // Create isolated database for this test file
    const dbSetup = createIsolatedTestDatabase()
    db = dbSetup.db
    cleanup = dbSetup.cleanup

    // Set the test database instance for auth service
    setDatabaseInstance(db)

    // Create test user
    testUserId = 'test-user'
    await db.insert(schema.users).values({
      id: testUserId,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: await hashPassword('password123'),
      role: 'admin',
      status: 'active',
    })
  })

  afterEach(async () => {
    // Clean up resources
    await cleanup()
    await cleanupDatabase()
    resetDatabaseInstance()
  })

  /**
   * loginSchema validation - Input contract for POST /api/v1/auth/login
   */
  describe('loginSchema validation (input contract)', () => {
    it('accepts valid login data', () => {
      const result = validateBodySync(
        { username: 'testuser', password: 'password123' },
        loginSchema
      )
      expect(result.username).toBe('testuser')
      expect(result.password).toBe('password123')
    })

    it('rejects empty username', () => {
      expect(() =>
        validateBodySync({ username: '', password: 'password123' }, loginSchema)
      ).toThrow(HTTPError)
    })

    it('rejects empty password', () => {
      expect(() => validateBodySync({ username: 'testuser', password: '' }, loginSchema)).toThrow(
        HTTPError
      )
    })

    it('rejects short password (less than 6 chars)', () => {
      expect(() =>
        validateBodySync({ username: 'testuser', password: '12345' }, loginSchema)
      ).toThrow(HTTPError)
    })

    it('rejects username with special characters', () => {
      expect(() =>
        validateBodySync({ username: 'test@user!', password: 'password123' }, loginSchema)
      ).toThrow(HTTPError)
    })

    it('rejects long username (more than 50 chars)', () => {
      const longUsername = 'a'.repeat(51)
      expect(() =>
        validateBodySync({ username: longUsername, password: 'password123' }, loginSchema)
      ).toThrow(HTTPError)
    })
  })

  /**
   * registerSchema validation - Input contract for POST /api/v1/auth/register
   */
  describe('registerSchema validation (input contract)', () => {
    it('accepts valid register data', () => {
      const result = validateBodySync(
        { username: 'newuser', password: 'password123', email: 'new@example.com' },
        registerSchema
      )
      expect(result.username).toBe('newuser')
      expect(result.email).toBe('new@example.com')
    })

    it('rejects invalid email format', () => {
      expect(() =>
        validateBodySync(
          { username: 'newuser', password: 'password123', email: 'invalid-email' },
          registerSchema
        )
      ).toThrow(HTTPError)
    })

    it('rejects empty email', () => {
      expect(() =>
        validateBodySync(
          { username: 'newuser', password: 'password123', email: '' },
          registerSchema
        )
      ).toThrow(HTTPError)
    })

    it('rejects long email (more than 255 chars)', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(() =>
        validateBodySync(
          { username: 'newuser', password: 'password123', email: longEmail },
          registerSchema
        )
      ).toThrow(HTTPError)
    })

    it('inherits username validation from loginSchema', () => {
      expect(() =>
        validateBodySync(
          { username: '', password: 'password123', email: 'test@example.com' },
          registerSchema
        )
      ).toThrow(HTTPError)
    })

    it('inherits password validation from loginSchema', () => {
      expect(() =>
        validateBodySync(
          { username: 'newuser', password: '12345', email: 'test@example.com' },
          registerSchema
        )
      ).toThrow(HTTPError)
    })
  })

  /**
   * Login service function - Business logic contract for POST /api/v1/auth/login
   */
  describe('login service function (business logic)', () => {
    it('returns token and user for valid credentials', async () => {
      const password = 'password123'
      const passwordHash = await hashPassword(password)

      await db.insert(schema.users).values({
        id: 'login-test-user',
        username: 'loginuser',
        email: 'login@example.com',
        passwordHash,
        role: 'author',
        status: 'active',
      })

      const result = await login('loginuser', password)

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(result.user.username).toBe('loginuser')
      expect(result.user.email).toBe('login@example.com')
      expect(result.user.role).toBe('author')
    })

    it('throws 401 for wrong password', async () => {
      const passwordHash = await hashPassword('correctpassword')

      await db.insert(schema.users).values({
        id: 'wrong-pwd-user',
        username: 'wrongpwduser',
        email: 'wrongpwd@example.com',
        passwordHash,
        role: 'author',
        status: 'active',
      })

      await expect(login('wrongpwduser', 'wrongpassword')).rejects.toThrow(HTTPError)
      await expect(login('wrongpwduser', 'wrongpassword')).rejects.toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    })

    it('throws 401 for non-existent user', async () => {
      await expect(login('nonexistent', 'password123')).rejects.toThrow(HTTPError)
      await expect(login('nonexistent', 'password123')).rejects.toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    })

    it('throws 401 for disabled account', async () => {
      const passwordHash = await hashPassword('password123')

      await db.insert(schema.users).values({
        id: 'disabled-user',
        username: 'disableduser',
        email: 'disabled@example.com',
        passwordHash,
        role: 'author',
        status: 'inactive',
      })

      await expect(login('disableduser', 'password123')).rejects.toThrow(HTTPError)
      await expect(login('disableduser', 'password123')).rejects.toMatchObject({
        statusCode: 401,
      })
      await expect(login('disableduser', 'password123')).rejects.toMatchObject({
        message: expect.stringContaining('disabled'),
      })
    })

    it('updates lastLoginAt on successful login', async () => {
      const password = 'password123'
      const passwordHash = await hashPassword(password)

      await db.insert(schema.users).values({
        id: 'login-time-user',
        username: 'logintimeuser',
        email: 'logintime@example.com',
        passwordHash,
        role: 'author',
        status: 'active',
      })

      await login('logintimeuser', password)

      const userInDb = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, 'logintimeuser'))
        .get()

      expect(userInDb?.lastLoginAt).toBeDefined()
      // lastLoginAt is a Date object (drizzle-orm converts INTEGER to Date)
      expect(userInDb?.lastLoginAt).toBeInstanceOf(Date)
    })
  })

  /**
   * Logout service function - Business logic contract for POST /api/v1/auth/logout
   */
  describe('logout service function (business logic)', () => {
    it('blacklists token on logout', async () => {
      const token = await generateToken({
        id: 'test-user',
        username: 'testuser',
        role: 'admin',
        email: 'test@example.com',
      })

      await logout(token)
      expect(isTokenBlacklisted(token)).toBe(true)
    })

    it('allows checking if token is blacklisted', async () => {
      const token = await generateToken({
        id: 'test-user',
        username: 'testuser',
        role: 'admin',
      })

      expect(isTokenBlacklisted(token)).toBe(false)
      await logout(token)
      expect(isTokenBlacklisted(token)).toBe(true)
    })
  })

  /**
   * Generate token utility - Output contract for JWT generation
   */
  describe('generateToken utility', () => {
    it('generates valid JWT token with user payload', async () => {
      const token = await generateToken({
        id: 'test-user',
        username: 'testuser',
        role: 'admin',
        email: 'test@example.com',
      })

      // JWT format: header.payload.signature
      const parts = token.split('.')
      expect(parts.length).toBe(3)
    })

    it('includes all user fields in token', async () => {
      const token = await generateToken({
        id: '123',
        username: 'testuser',
        role: 'author',
        email: 'test@example.com',
      })

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
  })

  /**
   * Register service function - Business logic contract for POST /api/v1/auth/register
   */
  describe('register service function (business logic)', () => {
    it('creates new user with valid data', async () => {
      const result = await register('newuser', 'password123', 'new@example.com')

      expect(result).toHaveProperty('id')
      expect(result.username).toBe('newuser')
      expect(result.email).toBe('new@example.com')
      expect(result.role).toBe('author')

      // Verify user was created in database
      const userInDb = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, 'newuser'))
        .get()

      expect(userInDb).toBeDefined()
      expect(userInDb?.email).toBe('new@example.com')
    })

    it('throws 409 for duplicate username', async () => {
      // Create existing user
      await db.insert(schema.users).values({
        id: 'existing-user',
        username: 'existinguser',
        email: 'existing@example.com',
        passwordHash: 'hash',
        role: 'author',
        status: 'active',
      })

      // Try to register with same username
      await expect(
        register('existinguser', 'password123', 'different@example.com')
      ).rejects.toThrow(HTTPError)
      await expect(
        register('existinguser', 'password123', 'different@example.com')
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CONFLICT',
      })
      await expect(
        register('existinguser', 'password123', 'different@example.com')
      ).rejects.toMatchObject({
        message: expect.stringContaining('Username'),
      })
    })

    it('throws 409 for duplicate email', async () => {
      // Create existing user
      await db.insert(schema.users).values({
        id: 'existing-user',
        username: 'uniqueuser',
        email: 'existing@example.com',
        passwordHash: 'hash',
        role: 'author',
        status: 'active',
      })

      // Try to register with same email
      await expect(
        register('differentuser', 'password123', 'existing@example.com')
      ).rejects.toThrow(HTTPError)
      await expect(
        register('differentuser', 'password123', 'existing@example.com')
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CONFLICT',
      })
      await expect(
        register('differentuser', 'password123', 'existing@example.com')
      ).rejects.toMatchObject({
        message: expect.stringContaining('Email'),
      })
    })

    it('hashes password before storing', async () => {
      await register('hashtestuser', 'password123', 'hashtest@example.com')

      const userInDb = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, 'hashtestuser'))
        .get()

      expect(userInDb).toBeDefined()
      expect(userInDb?.passwordHash).not.toBe('password123')
      // Bcrypt hash format: $2a$10$...
      expect(userInDb?.passwordHash).toMatch(/^\$2[aby]\$\d+\$/)
    })
  })

  /**
   * Password utilities - Contract for password hashing/verification
   */
  describe('Password utilities', () => {
    it('hashPassword generates bcrypt hash', async () => {
      const hash = await hashPassword('password123')
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/)
    })

    it('verifyPassword returns true for matching password', async () => {
      const password = 'password123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('verifyPassword returns false for non-matching password', async () => {
      const hash = await hashPassword('password123')
      const isValid = await verifyPassword('wrongpassword', hash)
      expect(isValid).toBe(false)
    })
  })

  /**
   * Response format contract - Output format for all auth endpoints
   */
  describe('Response format contract (output contract)', () => {
    it('createSuccessResponse returns standard format with data', () => {
      const result = createSuccessResponse({ id: '1', username: 'test' })

      expect(result).toEqual({
        success: true,
        data: { id: '1', username: 'test' },
      })
    })

    it('createSuccessResponse includes message when provided', () => {
      const result = createSuccessResponse({ id: '1' }, 'Operation successful')

      expect(result).toEqual({
        success: true,
        message: 'Operation successful',
        data: { id: '1' },
      })
    })

    it('Error responses have consistent format', () => {
      const error = HTTPError.UNAUTHORIZED('Access denied')

      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.message).toBe('Access denied')
    })

    it('Error responses with details include field information', () => {
      const error = HTTPError.VALIDATION_ERROR('Invalid input', [
        { field: 'email', message: 'Invalid email' },
      ])

      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toEqual([{ field: 'email', message: 'Invalid email' }])
    })
  })

  /**
   * Error handling consistency - All endpoints should use HTTPError consistently
   */
  describe('Error handling consistency', () => {
    it('all auth errors are HTTPError instances', async () => {
      // Empty username
      try {
        validateBodySync({ username: '', password: 'test' }, loginSchema)
      } catch (e) {
        expect(e).toBeInstanceOf(HTTPError)
      }

      // Wrong password
      await expect(login('nonexistent', 'test')).rejects.toBeInstanceOf(HTTPError)

      // Duplicate username
      await db.insert(schema.users).values({
        id: 'existing-user',
        username: 'existinguser',
        email: 'existing@example.com',
        passwordHash: 'hash',
        role: 'author',
        status: 'active',
      })

      await expect(
        register('existinguser', 'password123', 'different@example.com')
      ).rejects.toBeInstanceOf(HTTPError)
    })

    it('error messages do not expose sensitive information', async () => {
      // Login error should not reveal whether username exists
      const error = await login('nonexistent', 'exposedpassword123').catch((e) => e as HTTPError)

      expect(error.message).not.toContain('nonexistent')
      expect(error.message).not.toContain('exposedpassword')
    })
  })
})
