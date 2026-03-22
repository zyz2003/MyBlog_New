/**
 * Tag Service Tests
 *
 * Tests for tag.service.ts covering:
 * - listTags - returns all tags
 * - createTag - creates tag with slug
 * - updateTag - updates tag
 * - deleteTag - removes tag
 * - getTagById - gets single tag
 *
 * Database: Uses isolated test database to avoid cross-file interference
 * Schema: Table structures defined in packages/database/src/schema/tags.ts
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import {
  createIsolatedTestDatabase,
  initializeTestDatabase,
  clearAllData,
  seedTestData,
} from '../../../tests/db'
import { hashPassword } from '../../../server/services/auth.service'
import { tags } from '@my-blog/database'

// Import tag service
import {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  getTagById,
  setDatabaseInstance,
  resetDatabaseInstance,
} from '../../../server/services/tag.service'

// Isolated database for this test file
const { db: testDb, cleanup } = createIsolatedTestDatabase()

/**
 * Initialize isolated test database before all tests
 */
beforeAll(async () => {
  await initializeTestDatabase(testDb)
  setDatabaseInstance(testDb)
})

/**
 * Clean up isolated database after all tests
 */
afterAll(async () => {
  resetDatabaseInstance()
  await cleanup()
})

/**
 * Clear all data between tests for isolation
 */
beforeEach(async () => {
  await clearAllData(testDb)

  // Insert test user
  const passwordHash = await hashPassword('password123')
  await seedTestData(testDb, passwordHash)
})

describe('Tag Service', () => {
  describe('listTags', () => {
    it('returns all tags sorted by name', async () => {
      // Clear seeded data first
      await clearAllData(testDb)

      // Create test tags
      await testDb.insert(tags).values([
        { id: 'tag-1', name: 'Zebra', slug: 'zebra' },
        { id: 'tag-2', name: 'Apple', slug: 'apple' },
        { id: 'tag-3', name: 'Mango', slug: 'mango' },
      ])

      const result = await listTags()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(3)
      // Should be sorted by name
      expect(result[0].name).toBe('Apple')
      expect(result[1].name).toBe('Mango')
      expect(result[2].name).toBe('Zebra')
    })

    it('returns empty array when no tags exist', async () => {
      // Clear seeded data
      await clearAllData(testDb)

      const result = await listTags()

      expect(result).toEqual([])
    })
  })

  describe('createTag', () => {
    it('creates a tag with name and slug', async () => {
      const tagData = {
        name: 'New Tag',
        slug: 'new-tag',
        description: 'Test description',
        color: '#FF0000',
      }

      const result = await createTag(tagData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.name).toBe('New Tag')
      expect(result.slug).toBe('new-tag')
      expect(result.description).toBe('Test description')
      expect(result.color).toBe('#FF0000')
    })

    it('creates a tag with only required fields', async () => {
      const tagData = {
        name: 'Minimal Tag',
        slug: 'minimal-tag',
      }

      const result = await createTag(tagData)

      expect(result).toBeDefined()
      expect(result.name).toBe('Minimal Tag')
      expect(result.slug).toBe('minimal-tag')
      expect(result.description).toBeNull()
      expect(result.color).toBeNull()
    })

    it('throws error when slug already exists', async () => {
      await testDb.insert(tags).values({
        id: 'tag-existing',
        name: 'Existing',
        slug: 'existing-slug',
      })

      const tagData = {
        name: 'Duplicate',
        slug: 'existing-slug',
      }

      await expect(createTag(tagData)).rejects.toThrow()
    })
  })

  describe('updateTag', () => {
    it('updates tag name and description', async () => {
      await testDb.insert(tags).values({
        id: 'tag-update',
        name: 'Original Name',
        slug: 'original-slug',
        description: 'Original description',
        color: '#000000',
      })

      const result = await updateTag('tag-update', {
        name: 'Updated Name',
        description: 'Updated description',
        color: '#FFFFFF',
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('Updated Name')
      expect(result.description).toBe('Updated description')
      expect(result.color).toBe('#FFFFFF')
    })

    it('updates only provided fields', async () => {
      await testDb.insert(tags).values({
        id: 'tag-partial',
        name: 'Original Name',
        slug: 'original-slug',
        description: 'Original description',
        color: '#000000',
      })

      const result = await updateTag('tag-partial', {
        name: 'Updated Name',
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('Updated Name')
      expect(result.description).toBe('Original description')
      expect(result.color).toBe('#000000')
    })

    it('throws 404 when updating non-existent tag', async () => {
      await expect(updateTag('non-existent-id', { name: 'Test' })).rejects.toThrow()
    })
  })

  describe('deleteTag', () => {
    it('deletes tag successfully', async () => {
      await testDb.insert(tags).values({
        id: 'tag-delete',
        name: 'To Delete',
        slug: 'to-delete',
      })

      await deleteTag('tag-delete')

      const result = await getTagById('tag-delete')
      expect(result).toBeNull()
    })

    it('throws 404 when deleting non-existent tag', async () => {
      await expect(deleteTag('non-existent-id')).rejects.toThrow()
    })
  })

  describe('getTagById', () => {
    it('returns tag by ID', async () => {
      await testDb.insert(tags).values({
        id: 'tag-get',
        name: 'Get Test',
        slug: 'get-test',
        description: 'Get description',
        color: '#123456',
      })

      const result = await getTagById('tag-get')

      expect(result).toBeDefined()
      expect(result!.id).toBe('tag-get')
      expect(result!.name).toBe('Get Test')
      expect(result!.description).toBe('Get description')
      expect(result!.color).toBe('#123456')
    })

    it('returns null for non-existent tag', async () => {
      const result = await getTagById('non-existent-id')

      expect(result).toBeNull()
    })
  })
})
