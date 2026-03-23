/**
 * Category Service
 *
 * Provides business logic for category management including:
 * - List categories with hierarchy (tree structure)
 * - Create category with parent validation
 * - Update category
 * - Delete category (children become top-level)
 * - Get category by ID
 */

import { eq, type LibSQLDatabase } from 'drizzle-orm'
import { categories, type Category as DbCategory } from '@my-blog/database'
import crypto from 'node:crypto'

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
 * Category with children for tree structure
 */
export interface CategoryWithChildren extends Omit<DbCategory, 'parentId'> {
  parentId: string | null
  children: CategoryWithChildren[]
}

/**
 * Create category input
 */
export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string | null
  parentId?: string | null
}

/**
 * Update category input (partial)
 */
export type UpdateCategoryInput = Partial<CreateCategoryInput>

/**
 * List all categories with hierarchy tree structure
 * Builds a tree where each category has a children array
 *
 * @returns Array of root categories (parentId = null) with nested children
 */
export async function listCategories(): Promise<CategoryWithChildren[]> {
  const db = await getDatabase()

  // Fetch all categories
  const allCategories = await db.select().from(categories).orderBy(categories.name)

  if (allCategories.length === 0) {
    return []
  }

  // Build a map for quick lookup
  const categoryMap = new Map<string, CategoryWithChildren>()
  allCategories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
    })
  })

  // Build the tree
  const rootCategories: CategoryWithChildren[] = []

  for (const category of allCategories) {
    const node = categoryMap.get(category.id)!

    if (category.parentId === null) {
      // Root category
      rootCategories.push(node)
    } else {
      // Has parent - add to parent's children
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        // Parent not found (orphaned) - treat as root
        rootCategories.push(node)
      }
    }
  }

  return rootCategories
}

/**
 * Create a new category
 * Validates parent exists if parentId is provided
 *
 * @param data - Category data (name, slug, description, parentId)
 * @returns Created category
 * @throws HTTPError 400 if parent doesn't exist
 * @throws HTTPError 409 if slug already exists
 */
export async function createCategory(data: CreateCategoryInput): Promise<CategoryWithChildren> {
  const db = await getDatabase()

  // Validate parent exists if provided
  if (data.parentId) {
    const parentExists = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, data.parentId))
      .limit(1)

    if (parentExists.length === 0) {
      const { HTTPError } = await import('../utils/error')
      throw HTTPError.BAD_REQUEST('Parent category not found')
    }
  }

  // Generate unique ID
  const newCategory = {
    id: crypto.randomUUID(),
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    parentId: data.parentId ?? null,
  }

  // Insert the category
  const result = await db.insert(categories).values(newCategory).returning()

  return {
    ...result[0],
    children: [],
  }
}

/**
 * Update an existing category
 *
 * @param id - Category ID to update
 * @param data - Category data to update (partial)
 * @returns Updated category
 * @throws HTTPError 404 if category not found
 * @throws HTTPError 400 if new parent doesn't exist
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryInput
): Promise<CategoryWithChildren> {
  const db = await getDatabase()

  // Check if category exists
  const existingCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  if (existingCategories.length === 0) {
    const { HTTPError } = await import('../utils/error')
    throw HTTPError.NOT_FOUND('Category not found')
  }

  // Validate new parent if provided
  if (data.parentId !== undefined && data.parentId !== null) {
    const parentExists = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, data.parentId))
      .limit(1)

    if (parentExists.length === 0) {
      const { HTTPError } = await import('../utils/error')
      throw HTTPError.BAD_REQUEST('Parent category not found')
    }

    // Prevent self-parenting
    if (data.parentId === id) {
      const { HTTPError } = await import('../utils/error')
      throw HTTPError.BAD_REQUEST('Category cannot be its own parent')
    }
  }

  // Build update data - only include provided fields
  const updateData: Partial<typeof categories.$inferInsert> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.description !== undefined) updateData.description = data.description ?? null
  if (data.parentId !== undefined) updateData.parentId = data.parentId ?? null

  // Update the category
  const result = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, id))
    .returning()

  return {
    ...result[0],
    children: [],
  }
}

/**
 * Delete a category
 * Children are set to top-level (parentId = null)
 *
 * @param id - Category ID to delete
 * @throws HTTPError 404 if category not found
 */
export async function deleteCategory(id: string): Promise<void> {
  const db = await getDatabase()

  // Check if category exists
  const existingCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  if (existingCategories.length === 0) {
    const { HTTPError } = await import('../utils/error')
    throw HTTPError.NOT_FOUND('Category not found')
  }

  // Update children to be top-level (parentId = null)
  await db.update(categories).set({ parentId: null }).where(eq(categories.parentId, id))

  // Delete the category
  await db.delete(categories).where(eq(categories.id, id))
}

/**
 * Get a category by ID
 *
 * @param id - Category ID
 * @returns Category with parent reference, or null if not found
 */
export async function getCategoryById(id: string): Promise<CategoryWithChildren | null> {
  const db = await getDatabase()

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1)

  if (result.length === 0) {
    return null
  }

  return {
    ...result[0],
    children: [],
  }
}

/**
 * Reset database instance (useful for testing)
 */
export function resetDatabaseInstance(): void {
  databaseInstance = null
}
