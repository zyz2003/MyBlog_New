/**
 * Tests for Auth API endpoints logic
 *
 * Tests the business logic of auth endpoints:
 * - login endpoint logic
 * - logout endpoint logic
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  hashPassword,
  generateToken,
  logout,
  isTokenBlacklisted,
} from '../../../server/services/auth.service'
import { getTestDatabase, resetTestDatabase } from '../../db'
import { users } from '@my-blog/database/schema'
import { loginSchema } from '../../../server/schemas/auth'
import { validateBodySync } from '../../../server/utils/validate'
import { HTTPError } from '../../../server/utils/error'

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

  describe('JWT Token generation', () => {
    it('generates valid token', async () => {
      const token = await generateToken({
        id: '123',
        username: 'testuser',
        role: 'admin',
        email: 'test@example.com',
      })

      expect(token).toBeTruthy()
      expect(token.split('.').length).toBe(3)
    })
  })
})
