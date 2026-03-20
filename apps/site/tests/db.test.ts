import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getTestDatabase, resetTestDatabase, cleanupTestDatabase } from './db'
import { users } from '@my-blog/database/schema/users'
import { posts } from '@my-blog/database/schema/posts'
import { categories } from '@my-blog/database/schema/categories'
import { eq } from 'drizzle-orm'

describe('Test Database Helpers', () => {
  beforeEach(async () => {
    await resetTestDatabase()
  })

  afterEach(async () => {
    await cleanupTestDatabase()
  })

  describe('getTestDatabase', () => {
    it('should return a database instance', () => {
      const db = getTestDatabase()
      expect(db).toBeDefined()
    })

    it('should return the same instance on subsequent calls', () => {
      const db1 = getTestDatabase()
      const db2 = getTestDatabase()
      expect(db1).toBe(db2)
    })
  })

  describe('resetTestDatabase', () => {
    it('should reset the database between calls', async () => {
      // Insert data into first database instance
      const db1 = getTestDatabase()
      await db1.insert(users).values({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      })

      // Reset the database
      await resetTestDatabase()

      // Get new instance and verify data is gone
      const db2 = getTestDatabase()
      const result = await db2.select().from(users).all()
      expect(result).toHaveLength(0)
    })
  })

  describe('Database Isolation', () => {
    it('should have empty tables after reset', async () => {
      const db = getTestDatabase()

      // Verify all tables are empty after reset
      const userCount = await db.select().from(users).all()
      const postCount = await db.select().from(posts).all()
      const categoryCount = await db.select().from(categories).all()

      expect(userCount).toHaveLength(0)
      expect(postCount).toHaveLength(0)
      expect(categoryCount).toHaveLength(0)
    })

    it('should allow inserting and querying data', async () => {
      const db = getTestDatabase()

      // Insert a test user
      await db.insert(users).values({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      })

      // Query the user
      const result = await db.select().from(users).where(eq(users.id, 'user-1')).get()

      expect(result).toBeDefined()
      expect(result?.username).toBe('testuser')
      expect(result?.email).toBe('test@example.com')
    })
  })
})
