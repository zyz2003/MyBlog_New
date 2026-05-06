import { eq, ne, and, asc, count } from 'drizzle-orm'
import { db } from '../utils/db'
import { categories, postCategories } from '../db/schema'
import { BusinessErrors } from '../utils/response'

/** Category create input */
export interface CategoryCreateInput {
  name: string
  slug: string
  description?: string
  parentId?: number | null
  sortOrder?: number
}

/** Category update input */
export interface CategoryUpdateInput {
  name?: string
  slug?: string
  description?: string | null
  parentId?: number | null
  sortOrder?: number
}

/** Category with children (tree node) */
export interface CategoryTreeNode {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
  sortOrder: number
  createdAt: Date
  children: CategoryTreeNode[]
}

export class CategoryService {
  /** Create a new category */
  static async create(input: CategoryCreateInput): Promise<typeof categories.$inferSelect> {
    // Check slug uniqueness
    const [existingSlug] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, input.slug))
      .limit(1)

    if (existingSlug) {
      throw createError({
        statusCode: 409,
        data: { code: BusinessErrors.DUPLICATE_SLUG.code, message: BusinessErrors.DUPLICATE_SLUG.message },
      })
    }

    // Validate parentId exists if provided
    if (input.parentId) {
      const [parent] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, input.parentId))
        .limit(1)

      if (!parent) {
        throw createError({
          statusCode: 400,
          data: { code: BusinessErrors.INVALID_PARENT.code, message: BusinessErrors.INVALID_PARENT.message },
        })
      }
    }

    const [created] = await db
      .insert(categories)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        parentId: input.parentId ?? null,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning()

    return created
  }

  /** Get category by slug */
  static async getBySlug(slug: string): Promise<typeof categories.$inferSelect | null> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)
    return category ?? null
  }

  /** List all categories flat, sorted by sortOrder */
  static async list(): Promise<typeof categories.$inferSelect[]> {
    return db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.id))
  }

  /** Get category tree (nested structure) */
  static async tree(): Promise<CategoryTreeNode[]> {
    const allCategories = await this.list()

    // Build tree in-memory
    const categoryMap = new Map<number, CategoryTreeNode>()
    const roots: CategoryTreeNode[] = []

    // First pass: create all nodes
    for (const cat of allCategories) {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
      })
    }

    // Second pass: wire parent-child
    for (const cat of allCategories) {
      const node = categoryMap.get(cat.id)!
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node)
      }
      else {
        roots.push(node)
      }
    }

    return roots
  }

  /** Update a category */
  static async update(id: number, input: CategoryUpdateInput): Promise<typeof categories.$inferSelect | null> {
    // Check exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    if (!existing) return null

    // Check slug uniqueness if changed
    if (input.slug && input.slug !== existing.slug) {
      const [slugConflict] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.slug, input.slug), ne(categories.id, id)))
        .limit(1)

      if (slugConflict) {
        throw createError({
          statusCode: 409,
          data: { code: BusinessErrors.DUPLICATE_SLUG.code, message: BusinessErrors.DUPLICATE_SLUG.message },
        })
      }
    }

    // Prevent circular reference: parentId cannot be self
    if (input.parentId === id) {
      throw createError({
        statusCode: 400,
        data: { code: BusinessErrors.INVALID_PARENT.code, message: BusinessErrors.INVALID_PARENT.message },
      })
    }

    // Prevent circular reference: parentId cannot be a descendant
    if (input.parentId !== undefined && input.parentId !== null) {
      const isDescendant = await this.isDescendant(id, input.parentId)
      if (isDescendant) {
        throw createError({
          statusCode: 400,
          data: { code: BusinessErrors.INVALID_PARENT.code, message: BusinessErrors.INVALID_PARENT.message },
        })
      }

      // Validate parentId exists
      const [parent] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, input.parentId))
        .limit(1)

      if (!parent) {
        throw createError({
          statusCode: 400,
          data: { code: BusinessErrors.INVALID_PARENT.code, message: BusinessErrors.INVALID_PARENT.message },
        })
      }
    }

    // Build update values
    const updateValues: Record<string, unknown> = {}
    if (input.name !== undefined) updateValues.name = input.name
    if (input.slug !== undefined) updateValues.slug = input.slug
    if (input.description !== undefined) updateValues.description = input.description
    if (input.parentId !== undefined) updateValues.parentId = input.parentId
    if (input.sortOrder !== undefined) updateValues.sortOrder = input.sortOrder

    if (Object.keys(updateValues).length === 0) return existing

    const [updated] = await db
      .update(categories)
      .set(updateValues)
      .where(eq(categories.id, id))
      .returning()

    return updated
  }

  /** Delete a category (fails if has children) */
  static async delete(id: number): Promise<boolean> {
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    if (!existing) return false

    // Check for children
    const [child] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parentId, id))
      .limit(1)

    if (child) {
      throw createError({
        statusCode: 409,
        data: { code: BusinessErrors.CATEGORY_HAS_CHILDREN.code, message: BusinessErrors.CATEGORY_HAS_CHILDREN.message },
      })
    }

    // Delete junction rows first (FK cascade should handle, but be explicit)
    await db.delete(postCategories).where(eq(postCategories.categoryId, id))

    // Delete category
    await db.delete(categories).where(eq(categories.id, id))

    return true
  }

  /** Check if candidateDescendantId is a descendant of ancestorId */
  private static async isDescendant(ancestorId: number, candidateDescendantId: number): Promise<boolean> {
    // Walk up from candidateDescendantId to see if we reach ancestorId
    let currentId: number | null = candidateDescendantId
    const visited = new Set<number>()

    while (currentId !== null) {
      if (visited.has(currentId)) return false // cycle protection
      visited.add(currentId)

      if (currentId === ancestorId) return true

      const [cat] = await db
        .select({ parentId: categories.parentId })
        .from(categories)
        .where(eq(categories.id, currentId))
        .limit(1)

      if (!cat) return false
      currentId = cat.parentId
    }

    return false
  }
}
