/**
 * Tag Service
 *
 * Provides business logic for tag management including:
 * - List all tags
 * - Create tag with slug
 * - Update tag
 * - Delete tag
 * - Get tag by ID
 */

import { eq, type LibSQLDatabase } from 'drizzle-orm'
import { tags, type Tag as DbTag } from '@my-blog/database'

// Node.js crypto for ID generation
const crypto = await import('crypto')

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
 * Tag type for service operations
 */
export type Tag = DbTag

/**
 * Create tag input
 */
export interface CreateTagInput {
  name: string
  slug: string
  description?: string | null
  color?: string | null
}

/**
 * Update tag input (partial)
 */
export type UpdateTagInput = Partial<CreateTagInput>

/**
 * List all tags
 *
 * @returns Array of all tags sorted by name
 */
export async function listTags(): Promise<Tag[]> {
  const db = await getDatabase()

  // Fetch all tags
  const allTags = await db.select().from(tags).orderBy(tags.name)

  return allTags
}

/**
 * Create a new tag
 * Validates slug uniqueness
 *
 * @param data - Tag data (name, slug, description, color)
 * @returns Created tag
 * @throws HTTPError 409 if slug already exists
 */
export async function createTag(data: CreateTagInput): Promise<Tag> {
  const db = await getDatabase()

  // Generate unique ID
  const newTag = {
    id: crypto.randomUUID(),
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    color: data.color ?? null,
  }

  // Insert the tag
  const result = await db.insert(tags).values(newTag).returning()

  return result[0]
}

/**
 * Update an existing tag
 *
 * @param id - Tag ID to update
 * @param data - Tag data to update (partial)
 * @returns Updated tag
 * @throws HTTPError 404 if tag not found
 */
export async function updateTag(id: string, data: UpdateTagInput): Promise<Tag> {
  const db = await getDatabase()

  // Check if tag exists
  const existingTags = await db.select().from(tags).where(eq(tags.id, id)).limit(1)

  if (existingTags.length === 0) {
    const { HTTPError } = await import('../utils/error')
    throw HTTPError.NOT_FOUND('Tag not found')
  }

  // Build update data - only include provided fields
  const updateData: Partial<typeof tags.$inferInsert> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.description !== undefined) updateData.description = data.description ?? null
  if (data.color !== undefined) updateData.color = data.color ?? null

  // Update the tag
  const result = await db.update(tags).set(updateData).where(eq(tags.id, id)).returning()

  return result[0]
}

/**
 * Delete a tag
 *
 * @param id - Tag ID to delete
 * @throws HTTPError 404 if tag not found
 */
export async function deleteTag(id: string): Promise<void> {
  const db = await getDatabase()

  // Check if tag exists
  const existingTags = await db.select({ id: tags.id }).from(tags).where(eq(tags.id, id)).limit(1)

  if (existingTags.length === 0) {
    const { HTTPError } = await import('../utils/error')
    throw HTTPError.NOT_FOUND('Tag not found')
  }

  // Delete the tag
  await db.delete(tags).where(eq(tags.id, id))
}

/**
 * Get a tag by ID
 *
 * @param id - Tag ID
 * @returns Tag, or null if not found
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const db = await getDatabase()

  const result = await db.select().from(tags).where(eq(tags.id, id)).limit(1)

  if (result.length === 0) {
    return null
  }

  return result[0]
}

/**
 * Reset database instance (useful for testing)
 */
export function resetDatabaseInstance(): void {
  databaseInstance = null
}
