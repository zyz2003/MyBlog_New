/**
 * Tests for auth.service.ts
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  login,
  logout,
  isTokenBlacklisted,
  generateToken,
  clearTokenBlacklist,
  setDatabaseInstance,
  resetDatabaseInstance,
  register,
} from '../../../server/services/auth.service'
import { users } from '@my-blog/database/schema'
import { getTestDatabase, resetTestDatabase } from '../../db'
import { HTTPError } from '../../../server/utils/error'
import { eq } from 'drizzle-orm'

describe('auth.service', () => {
  beforeEach(async () => {
    await resetTestDatabase()
    clearTokenBlacklist()
    resetDatabaseInstance()
    // Set test database instance
    setDatabaseInstance(getTestDatabase())
  })

  describe('hashPassword', () => {
    it('returns bcrypt hash (not plaintext)', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)

      // Hash should be different from plaintext
      expect(hash).not.toBe(password)
      // Hash should be a valid bcrypt hash (starts with $2)
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/)
      // Hash length should be 60 characters for bcrypt
      expect(hash.length).toBe(60)
    })

    it('generates different hashes for same password', async () => {
      const password = 'testpassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      // Bcrypt uses random salt, so hashes should be different
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('returns false for incorrect password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword('wrongpassword', hash)
      expect(isValid).toBe(false)
    })

    it('returns false for empty password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('generates valid JWT token', async () => {
      const user = {
        id: '123',
        username: 'testuser',
        role: 'admin',
        email: 'test@example.com',
      }

      const token = await generateToken(user)

      // Token should be a non-empty string
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')

      // Token should have 3 parts (header.payload.signature)
      const parts = token.split('.')
      expect(parts.length).toBe(3)
    })

    it('generates token without email when not provided', async () => {
      const user = {
        id: '123',
        username: 'testuser',
        role: 'author',
      }

      const token = await generateToken(user)
      expect(token).toBeTruthy()
    })
  })

  describe('isTokenBlacklisted', () => {
    it('returns false for non-blacklisted token', () => {
      expect(isTokenBlacklisted('some-token')).toBe(false)
    })

    it('returns true for blacklisted token', () => {
      clearTokenBlacklist()
      logout('test-token')
      expect(isTokenBlacklisted('test-token')).toBe(true)
    })
  })

  describe('login', () => {
    it('returns { token, user } for valid credentials', async () => {
      // Insert test user
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

      // Perform login
      const result = await login('testuser', password)

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(result.user.username).toBe('testuser')
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.role).toBe('admin')
      expect(result.user.id).toBe('test-user-id')
      // Password should never be returned
      expect(result.user).not.toHaveProperty('passwordHash')
    })

    it('throws 401 for non-existent user', async () => {
      await expect(login('nonexistent', 'password')).rejects.toThrow(HTTPError)
      await expect(login('nonexistent', 'password')).rejects.toThrow('Invalid username or password')
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

      await expect(login('testuser', 'wrongpassword')).rejects.toThrow(HTTPError)
      await expect(login('testuser', 'wrongpassword')).rejects.toThrow(
        'Invalid username or password'
      )
    })

    it('throws 401 for banned user', async () => {
      const testDb = getTestDatabase()
      const passwordHash = await hashPassword('password123')

      await testDb.insert(users).values({
        id: 'test-user-id',
        username: 'banneduser',
        email: 'banned@example.com',
        passwordHash,
        role: 'author',
        status: 'banned',
      })

      await expect(login('banneduser', 'password123')).rejects.toThrow(HTTPError)
      await expect(login('banneduser', 'password123')).rejects.toThrow('Account is disabled')
    })
  })

  describe('logout', () => {
    it('blacklists the token session', async () => {
      const token = 'test-token-123'

      await logout(token)

      expect(isTokenBlacklisted(token)).toBe(true)
    })

    it('can handle multiple logout calls', async () => {
      const token = 'test-token-456'

      await logout(token)
      await logout(token)

      expect(isTokenBlacklisted(token)).toBe(true)
    })
  })

  describe('register', () => {
    it('creates new user with valid credentials', async () => {
      const result = await register('newuser', 'password123', 'new@example.com')

      expect(result).toHaveProperty('id')
      expect(result.username).toBe('newuser')
      expect(result.email).toBe('new@example.com')
      expect(result.role).toBe('author')
      expect(result).not.toHaveProperty('passwordHash')

      // Verify user was created in database
      const testDb = getTestDatabase()
      const userInDb = await testDb.select().from(users).where(eq(users.username, 'newuser')).get()
      expect(userInDb).toBeDefined()
      expect(userInDb?.email).toBe('new@example.com')
    })

    it('hashes password before storing', async () => {
      await register('testuser', 'password123', 'test@example.com')

      const testDb = getTestDatabase()
      const userInDb = await testDb.select().from(users).where(eq(users.username, 'testuser')).get()

      expect(userInDb).toBeDefined()
      expect(userInDb?.passwordHash).not.toBe('password123')
      expect(userInDb?.passwordHash).toMatch(/^\$2[aby]\$\d+\$/)
    })

    it('throws 409 for duplicate username', async () => {
      const testDb = getTestDatabase()

      // Create existing user
      await testDb.insert(users).values({
        id: 'existing-user',
        username: 'existinguser',
        email: 'existing@example.com',
        passwordHash: await hashPassword('password123'),
        role: 'author',
        status: 'active',
      })

      await expect(
        register('existinguser', 'password456', 'different@example.com')
      ).rejects.toThrow(HTTPError)
      await expect(
        register('existinguser', 'password456', 'different@example.com')
      ).rejects.toThrow('Username already exists')
    })

    it('throws 409 for duplicate email', async () => {
      const testDb = getTestDatabase()

      // Create existing user
      await testDb.insert(users).values({
        id: 'existing-user',
        username: 'uniqueuser',
        email: 'existing@example.com',
        passwordHash: await hashPassword('password123'),
        role: 'author',
        status: 'active',
      })

      await expect(
        register('differentuser', 'password456', 'existing@example.com')
      ).rejects.toThrow(HTTPError)
      await expect(
        register('differentuser', 'password456', 'existing@example.com')
      ).rejects.toThrow('Email already exists')
    })

    it('sets default role to author', async () => {
      const result = await register('newuser2', 'password123', 'new2@example.com')

      expect(result.role).toBe('author')

      const testDb = getTestDatabase()
      const userInDb = await testDb.select().from(users).where(eq(users.username, 'newuser2')).get()

      expect(userInDb?.role).toBe('author')
    })

    it('sets default status to active', async () => {
      await register('newuser3', 'password123', 'new3@example.com')

      const testDb = getTestDatabase()
      const userInDb = await testDb.select().from(users).where(eq(users.username, 'newuser3')).get()

      expect(userInDb?.status).toBe('active')
    })
  })
})
