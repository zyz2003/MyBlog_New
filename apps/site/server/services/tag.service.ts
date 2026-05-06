import { eq, ne, and, desc } from 'drizzle-orm'
import { db } from '../utils/db'
import { tags } from '../db/schema'
import { BusinessErrors } from '../utils/response'

/** Tag create input */
export interface TagCreateInput {
  name: string
  slug: string
  color?: string
}

/** Tag update input */
export interface TagUpdateInput {
  name?: string
  slug?: string
  color?: string | null
}

export class TagService {
  /** Create a new tag */
  static async create(input: TagCreateInput): Promise<typeof tags.$inferSelect> {
    // Check slug uniqueness
    const [existingSlug] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, input.slug))
      .limit(1)

    if (existingSlug) {
      throw createError({
        statusCode: 409,
        data: { code: BusinessErrors.DUPLICATE_SLUG.code, message: BusinessErrors.DUPLICATE_SLUG.message },
      })
    }

    const [created] = await db
      .insert(tags)
      .values({
        name: input.name,
        slug: input.slug,
        color: input.color ?? null,
      })
      .returning()

    return created
  }

  /** Get tag by slug */
  static async getBySlug(slug: string): Promise<typeof tags.$inferSelect | null> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1)
    return tag ?? null
  }

  /** List all tags */
  static async list(): Promise<typeof tags.$inferSelect[]> {
    return db
      .select()
      .from(tags)
      .orderBy(desc(tags.createdAt))
  }

  /** Update a tag */
  static async update(id: number, input: TagUpdateInput): Promise<typeof tags.$inferSelect | null> {
    // Check exists
    const [existing] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1)

    if (!existing) return null

    // Check slug uniqueness if changed
    if (input.slug && input.slug !== existing.slug) {
      const [slugConflict] = await db
        .select({ id: tags.id })
        .from(tags)
        .where(and(eq(tags.slug, input.slug), ne(tags.id, id)))
        .limit(1)

      if (slugConflict) {
        throw createError({
          statusCode: 409,
          data: { code: BusinessErrors.DUPLICATE_SLUG.code, message: BusinessErrors.DUPLICATE_SLUG.message },
        })
      }
    }

    // Build update values
    const updateValues: Record<string, unknown> = {}
    if (input.name !== undefined) updateValues.name = input.name
    if (input.slug !== undefined) updateValues.slug = input.slug
    if (input.color !== undefined) updateValues.color = input.color

    if (Object.keys(updateValues).length === 0) return existing

    const [updated] = await db
      .update(tags)
      .set(updateValues)
      .where(eq(tags.id, id))
      .returning()

    return updated
  }

  /** Delete a tag (post_tags rows cascade-delete via FK) */
  static async delete(id: number): Promise<boolean> {
    const [existing] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1)

    if (!existing) return false

    await db.delete(tags).where(eq(tags.id, id))

    return true
  }
}
