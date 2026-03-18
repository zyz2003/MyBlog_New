import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../utils/password'
import { generateId } from '../utils/id'

describe('Seed Utilities', () => {
  describe('generateId', () => {
    it('generates a valid UUID', () => {
      const id = generateId()
      // UUID v4 format check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(id).toMatch(uuidRegex)
    })

    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('password', () => {
    it('hashPassword returns a valid bcrypt hash', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).toHaveLength(60)
      expect(hash).toMatch(/^\$2a\$/)
    })

    it('verifyPassword returns true for correct password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('verifyPassword returns false for incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })

    it('hashes are unique for same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      // bcrypt uses salt, so hashes should be different
      expect(hash1).not.toBe(hash2)
    })
  })
})
