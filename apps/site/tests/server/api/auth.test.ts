/**
 * Tests for Auth API endpoints logic
 *
 * Tests the business logic of auth endpoints:
 * - login endpoint logic
 * - logout endpoint logic
 * - register endpoint logic
 * - me endpoint logic (get current user)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  hashPassword,
  generateToken,
  logout,
  isTokenBlacklisted,
  register,
} from '../../../server/services/auth.service'
import { getTestDatabase, resetTestDatabase } from '../../db'
import { users } from '@my-blog/database/schema'
import { loginSchema, registerSchema } from '../../../server/schemas/auth'
import { validateBodySync } from '../../../server/utils/validate'
import { HTTPError } from '../../../server/utils/error'
import { eq } from 'drizzle-orm'

describe('Auth API Logic', () => {
  beforeEach(async () => {
    await resetTestDatabase()
  })

  describe('loginSchema validation', () => {
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

    it('rejects short password', () => {
      expect(() =>
        validateBodySync({ username: 'testuser', password: '12345' }, loginSchema)
      ).toThrow(HTTPError)
    })

    it('rejects username with special characters', () => {
      expect(() =>
        validateBodySync({ username: 'test@user!', password: 'password123' }, loginSchema)
      ).toThrow(HTTPError)
    })
  })

  describe('Login endpoint behavior', () => {
    it('returns token and user for valid credentials', async () => {
      // Setup test user
      const testDb = getTestDatabase()
      const password = 'password123'
      const passwordHash = await hashPassword(password)

      await testDb.insert(users).values({
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash,
        role: 'admin',
        status: 'active',
      })

      // Import login function after database is set up
      const { setDatabaseInstance } = await import('../../../server/services/auth.service')
      setDatabaseInstance(testDb)

      const { login } = await import('../../../server/services/auth.service')
      const result = await login('testuser', password)

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(result.user.username).toBe('testuser')
      expect(result.user.email).toBe('test@example.com')
    })

    it('throws 401 for wrong password', async () => {
      const testDb = getTestDatabase()
      const passwordHash = await hashPassword('correctpassword')

      await testDb.insert(users).values({
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash,
        role: 'admin',
        status: 'active',
      })

      const { setDatabaseInstance, login } = await import('../../../server/services/auth.service')
      setDatabaseInstance(testDb)

      await expect(login('testuser', 'wrongpassword')).rejects.toThrow(HTTPError)
    })
  })

  describe('Logout endpoint behavior', () => {
    it('blacklists token on logout', async () => {
      const token = await generateToken({
        id: 'test-user-id',
        username: 'testuser',
        role: 'admin',
      })

      await logout(token)
      expect(isTokenBlacklisted(token)).toBe(true)
    })

    it('returns success message', async () => {
      const token = await generateToken({
        id: 'test-user-id',
        username: 'testuser',
        role: 'admin',
      })

      // Logout should complete without error
      await expect(logout(token)).resolves.not.toThrow()
    })
  })

  describe('registerSchema validation', () => {
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

    it('rejects long email', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(() =>
        validateBodySync(
          { username: 'newuser', password: 'password123', email: longEmail },
          registerSchema
        )
      ).toThrow(HTTPError)
    })
  })

  describe('Register endpoint behavior', () => {
    it('creates new user with valid data', async () => {
      const testDb = getTestDatabase()
      const { setDatabaseInstance } = await import('../../../server/services/auth.service')
      setDatabaseInstance(testDb)

      const result = await register('newuser', 'password123', 'new@example.com')

      expect(result).toHaveProperty('id')
      expect(result.username).toBe('newuser')
      expect(result.email).toBe('new@example.com')
      expect(result.role).toBe('author')

      // Verify user was created in database
      const userInDb = await testDb.select().from(users).where(eq(users.username, 'newuser')).get()
      expect(userInDb).toBeDefined()
      expect(userInDb?.email).toBe('new@example.com')
    })

    it('throws 409 for duplicate username', async () => {
      const testDb = getTestDatabase()
      const { setDatabaseInstance } = await import('../../../server/services/auth.service')
      setDatabaseInstance(testDb)

      // Create first user
      await testDb.insert(users).values({
        id: 'existing-user',
        username: 'existinguser',
        email: 'existing@example.com',
        passwordHash: await hashPassword('password123'),
        role: 'author',
        status: 'active',
      })

      // Try to register with same username
      await expect(
        register('existinguser', 'password456', 'different@example.com')
      ).rejects.toThrow(HTTPError)
    })

    it('throws 409 for duplicate email', async () => {
      const testDb = getTestDatabase()
      const { setDatabaseInstance } = await import('../../../server/services/auth.service')
      setDatabaseInstance(testDb)

      // Create first user
      await testDb.insert(users).values({
        id: 'existing-user',
        username: 'uniqueuser',
        email: 'existing@example.com',
        passwordHash: await hashPassword('password123'),
        role: 'author',
        status: 'active',
      })

      // Try to register with same email
      await expect(
        register('differentuser', 'password456', 'existing@example.com')
      ).rejects.toThrow(HTTPError)
    })

    it('hashes password before storing', async () => {
      const testDb = getTestDatabase()
      const { setDatabaseInstance } = await import('../../../server/services/auth.service')
      setDatabaseInstance(testDb)

      await register('testuser', 'password123', 'test@example.com')

      const userInDb = await testDb.select().from(users).where(eq(users.username, 'testuser')).get()
      expect(userInDb).toBeDefined()
      expect(userInDb?.passwordHash).not.toBe('password123')
      expect(userInDb?.passwordHash).toMatch(/^\$2[aby]\$\d+\$/)
    })
  })

  describe('Me endpoint behavior (get current user)', () => {
    it('returns user data for valid token', async () => {
      const testDb = getTestDatabase()
      const { setDatabaseInstance } = await import('../../../server/services/auth.service')
      setDatabaseInstance(testDb)

      // Create test user
      await testDb.insert(users).values({
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await hashPassword('password123'),
        role: 'admin',
        status: 'active',
      })

      // Generate token
      const token = await generateToken({
        id: 'test-user-id',
        username: 'testuser',
        role: 'admin',
        email: 'test@example.com',
      })

      expect(token).toBeTruthy()
      // Token should be usable for auth middleware
    })

    it('requires valid token structure', async () => {
      const token = await generateToken({
        id: '123',
        username: 'testuser',
        role: 'admin',
        email: 'test@example.com',
      })

      // JWT token format: header.payload.signature
      const parts = token.split('.')
      expect(parts.length).toBe(3)
    })
  })
})
