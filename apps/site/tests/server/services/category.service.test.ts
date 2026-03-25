/**
 * Category Service Tests
 *
 * Tests for category.service.ts covering:
 * - listCategories with hierarchy support
 * - createCategory with parent validation
 * - updateCategory
 * - deleteCategory (children become top-level)
 * - getCategoryById
 *
 * Database: Uses isolated test database to avoid cross-file interference
 * Schema: Table structures defined in packages/database/src/schema/categories.ts
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import {
  createIsolatedTestDatabase,
  initializeTestDatabase,
  clearAllData,
  seedTestData,
} from '../../../tests/db'
import { hashPassword } from '../../../server/services/auth.service'
import { categories } from '@my-blog/database'

// Import category service
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  setDatabaseInstance,
  resetDatabaseInstance,
} from '../../../server/services/category.service'

// Isolated database for this test file
let testDb: ReturnType<typeof createIsolatedTestDatabase>['db']
let cleanup: () => Promise<void>

/**
 * Initialize isolated test database before all tests
 */
beforeAll(async () => {
  const isolated = await createIsolatedTestDatabase()
  testDb = isolated.db
  cleanup = isolated.cleanup
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

describe('Category Service', () => {
  describe('listCategories', () => {
    it('returns all categories with hierarchy tree structure', async () => {
      // Clear seeded data first to have full control
      await clearAllData(testDb)

      // Create parent category
      await testDb.insert(categories).values({
        id: 'cat-parent',
        name: 'Parent Category',
        slug: 'parent-category',
        description: 'Parent description',
      })

      // Create child categories
      await testDb.insert(categories).values([
        {
          id: 'cat-child-1',
          name: 'Child 1',
          slug: 'child-1',
          parentId: 'cat-parent',
        },
        {
          id: 'cat-child-2',
          name: 'Child 2',
          slug: 'child-2',
          parentId: 'cat-parent',
        },
      ])

      const result = await listCategories()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1) // One root category

      const rootCategory = result[0]
      expect(rootCategory.name).toBe('Parent Category')
      expect(rootCategory.children).toBeDefined()
      expect(Array.isArray(rootCategory.children)).toBe(true)
      expect(rootCategory.children.length).toBe(2)
      expect(rootCategory.children.map((c) => c.name)).toContain('Child 1')
      expect(rootCategory.children.map((c) => c.name)).toContain('Child 2')
    })

    it('returns flat list when no hierarchy exists', async () => {
      // Clear seeded data first
      await clearAllData(testDb)

      await testDb.insert(categories).values([
        { id: 'cat-1', name: 'Category 1', slug: 'category-1' },
        { id: 'cat-2', name: 'Category 2', slug: 'category-2' },
        { id: 'cat-3', name: 'Category 3', slug: 'category-3' },
      ])

      const result = await listCategories()

      expect(result.length).toBe(3)
      result.forEach((cat) => {
        expect(cat.children).toEqual([])
      })
    })

    it('returns empty array when no categories exist', async () => {
      // Clear the seeded category data first
      await clearAllData(testDb)

      const result = await listCategories()

      expect(result).toEqual([])
    })

    it('handles multi-level hierarchy correctly', async () => {
      // Clear seeded data first
      await clearAllData(testDb)

      // Create grandparent
      await testDb.insert(categories).values({
        id: 'cat-grandparent',
        name: 'Grandparent',
        slug: 'grandparent',
      })

      // Create parent
      await testDb.insert(categories).values({
        id: 'cat-parent2',
        name: 'Parent',
        slug: 'parent',
        parentId: 'cat-grandparent',
      })

      // Create child
      await testDb.insert(categories).values({
        id: 'cat-child3',
        name: 'Child',
        slug: 'child',
        parentId: 'cat-parent2',
      })

      const result = await listCategories()

      expect(result.length).toBe(1)
      const grandparent = result[0]
      expect(grandparent.name).toBe('Grandparent')
      expect(grandparent.children.length).toBe(1)
      expect(grandparent.children[0].name).toBe('Parent')
      expect(grandparent.children[0].children.length).toBe(1)
      expect(grandparent.children[0].children[0].name).toBe('Child')
    })
  })

  describe('createCategory', () => {
    it('creates a category without parent', async () => {
      const categoryData = {
        name: 'New Category',
        slug: 'new-category',
        description: 'Test description',
      }

      const result = await createCategory(categoryData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.name).toBe('New Category')
      expect(result.slug).toBe('new-category')
      expect(result.description).toBe('Test description')
      expect(result.parentId).toBeNull()
    })

    it('creates a category with valid parent', async () => {
      // Create parent first
      const parent = await testDb
        .insert(categories)
        .values({
          id: 'cat-parent-create',
          name: 'Parent',
          slug: 'parent-create',
        })
        .returning()

      const categoryData = {
        name: 'Child Category',
        slug: 'child-category',
        parentId: parent[0].id,
      }

      const result = await createCategory(categoryData)

      expect(result).toBeDefined()
      expect(result.name).toBe('Child Category')
      expect(result.parentId).toBe('cat-parent-create')
    })

    it('throws error when creating category with invalid parent ID', async () => {
      const categoryData = {
        name: 'Invalid Child',
        slug: 'invalid-child',
        parentId: 'non-existent-parent-id',
      }

      await expect(createCategory(categoryData)).rejects.toThrow()
    })

    it('throws error when slug already exists', async () => {
      await testDb.insert(categories).values({
        id: 'cat-existing',
        name: 'Existing',
        slug: 'existing-slug',
      })

      const categoryData = {
        name: 'Duplicate',
        slug: 'existing-slug',
      }

      await expect(createCategory(categoryData)).rejects.toThrow()
    })
  })

  describe('updateCategory', () => {
    it('updates category name and description', async () => {
      await testDb.insert(categories).values({
        id: 'cat-update',
        name: 'Original Name',
        slug: 'original-slug',
        description: 'Original description',
      })

      const result = await updateCategory('cat-update', {
        name: 'Updated Name',
        description: 'Updated description',
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('Updated Name')
      expect(result.description).toBe('Updated description')
    })

    it('updates category parent', async () => {
      // Create two categories
      await testDb.insert(categories).values([
        { id: 'cat-new-parent', name: 'New Parent', slug: 'new-parent' },
        { id: 'cat-to-update', name: 'To Update', slug: 'to-update' },
      ])

      const result = await updateCategory('cat-to-update', {
        parentId: 'cat-new-parent',
      })

      expect(result).toBeDefined()
      expect(result.parentId).toBe('cat-new-parent')
    })

    it('throws 404 when updating non-existent category', async () => {
      await expect(updateCategory('non-existent-id', { name: 'Test' })).rejects.toThrow()
    })

    it('throws error when updating to invalid parent', async () => {
      await testDb.insert(categories).values({
        id: 'cat-update2',
        name: 'Test',
        slug: 'test',
      })

      await expect(
        updateCategory('cat-update2', { parentId: 'non-existent-parent' })
      ).rejects.toThrow()
    })
  })

  describe('deleteCategory', () => {
    it('deletes category and sets children to top-level (parentId = null)', async () => {
      // Clear seeded data first to avoid foreign key issues
      await clearAllData(testDb)

      // Create parent with children
      await testDb.insert(categories).values([
        {
          id: 'cat-delete-parent',
          name: 'To Delete',
          slug: 'to-delete',
        },
        {
          id: 'cat-child-delete',
          name: 'Child',
          slug: 'child-to-delete',
          parentId: 'cat-delete-parent',
        },
      ])

      await deleteCategory('cat-delete-parent')

      // Parent should be deleted
      const parent = await getCategoryById('cat-delete-parent')
      expect(parent).toBeNull()

      // Child should still exist with parentId = null
      const child = await getCategoryById('cat-child-delete')
      expect(child).toBeDefined()
      expect(child!.parentId).toBeNull()
    })

    it('deletes category with no children', async () => {
      await testDb.insert(categories).values({
        id: 'cat-single',
        name: 'Single',
        slug: 'single',
      })

      await deleteCategory('cat-single')

      const result = await getCategoryById('cat-single')
      expect(result).toBeNull()
    })

    it('throws 404 when deleting non-existent category', async () => {
      await expect(deleteCategory('non-existent-id')).rejects.toThrow()
    })
  })

  describe('getCategoryById', () => {
    it('returns category by ID', async () => {
      await testDb.insert(categories).values({
        id: 'cat-get',
        name: 'Get Test',
        slug: 'get-test',
        description: 'Get description',
      })

      const result = await getCategoryById('cat-get')

      expect(result).toBeDefined()
      expect(result!.id).toBe('cat-get')
      expect(result!.name).toBe('Get Test')
      expect(result!.description).toBe('Get description')
    })

    it('returns null for non-existent category', async () => {
      const result = await getCategoryById('non-existent-id')

      expect(result).toBeNull()
    })

    it('returns category with parent reference', async () => {
      await testDb.insert(categories).values([
        { id: 'cat-parent-get', name: 'Parent', slug: 'parent-get' },
        {
          id: 'cat-child-get',
          name: 'Child',
          slug: 'child-get',
          parentId: 'cat-parent-get',
        },
      ])

      const result = await getCategoryById('cat-child-get')

      expect(result).toBeDefined()
      expect(result!.name).toBe('Child')
      expect(result!.parentId).toBe('cat-parent-get')
    })
  })
})
