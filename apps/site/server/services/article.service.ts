import { eq, and, ne, like, sql, count, desc, isNull } from 'drizzle-orm'
import { db } from '../utils/db'
import { posts, postCategories, postTags, categories, tags, users } from '../db/schema'
import { BusinessErrors } from '../utils/response'

/** Article create input */
export interface ArticleCreateInput {
  title: string
  slug: string
  content?: string
  excerpt?: string
  coverImage?: string
  status?: 'draft' | 'published' | 'scheduled'
  publishedAt?: Date | null
  scheduledAt?: Date | null
  seoTitle?: string
  seoDescription?: string
  isTop?: boolean
  allowComment?: boolean
  password?: string
  categoryIds?: number[]
  tagIds?: number[]
  primaryCategoryId?: number
}

/** Article update input */
export interface ArticleUpdateInput {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  coverImage?: string
  status?: 'draft' | 'published' | 'scheduled'
  publishedAt?: Date | null
  scheduledAt?: Date | null
  seoTitle?: string
  seoDescription?: string
  isTop?: boolean
  allowComment?: boolean
  password?: string | null
  categoryIds?: number[]
  tagIds?: number[]
  primaryCategoryId?: number
}

/** Article list query params */
export interface ArticleListQuery {
  page?: number
  pageSize?: number
  status?: string
  categoryId?: number
  tagId?: number
  keyword?: string
}

/** Paginated list result */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Article with relations */
export interface ArticleWithRelations {
  id: number
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  coverImage: string | null
  status: string
  publishedAt: Date | null
  scheduledAt: Date | null
  viewCount: number
  likeCount: number
  commentCount: number
  seoTitle: string | null
  seoDescription: string | null
  isTop: boolean
  allowComment: boolean
  password: string | null
  authorId: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  author?: { id: number; username: string; displayName: string | null; avatar: string | null }
  categories?: Array<{ id: number; name: string; slug: string; isPrimary: boolean }>
  tags?: Array<{ id: number; name: string; slug: string; color: string | null }>
}

export class ArticleService {
  /** Create a new article */
  static async create(input: ArticleCreateInput, authorId: number): Promise<ArticleWithRelations> {
    // Check slug uniqueness
    const [existingSlug] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, input.slug))
      .limit(1)

    if (existingSlug) {
      throw createError({
        statusCode: 409,
        data: { code: BusinessErrors.DUPLICATE_SLUG.code, message: BusinessErrors.DUPLICATE_SLUG.message },
      })
    }

    // Insert post
    const [created] = await db
      .insert(posts)
      .values({
        title: input.title,
        slug: input.slug,
        content: input.content ?? null,
        excerpt: input.excerpt ?? null,
        coverImage: input.coverImage ?? null,
        status: input.status ?? 'draft',
        publishedAt: input.publishedAt ?? null,
        scheduledAt: input.scheduledAt ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        isTop: input.isTop ?? false,
        allowComment: input.allowComment ?? true,
        password: input.password ?? null,
        authorId,
      })
      .returning()

    // Insert category relations
    if (input.categoryIds && input.categoryIds.length > 0) {
      await db.insert(postCategories).values(
        input.categoryIds.map((categoryId) => ({
          postId: created.id,
          categoryId,
          isPrimary: categoryId === input.primaryCategoryId,
        })),
      )
    }

    // Insert tag relations
    if (input.tagIds && input.tagIds.length > 0) {
      await db.insert(postTags).values(
        input.tagIds.map((tagId) => ({
          postId: created.id,
          tagId,
        })),
      )
    }

    return this.getById(created.id) as Promise<ArticleWithRelations>
  }

  /** List articles with pagination and filtering */
  static async list(query: ArticleListQuery): Promise<PaginatedResult<ArticleWithRelations>> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 10
    const offset = (page - 1) * pageSize

    // Build conditions
    const conditions = [isNull(posts.deletedAt)]

    if (query.status) {
      conditions.push(eq(posts.status, query.status))
    }

    if (query.keyword) {
      conditions.push(like(posts.title, `%${query.keyword}%`))
    }

    // For category/tag filtering, use subqueries to avoid duplicate rows
    let filteredPostIds: number[] | null = null

    if (query.categoryId) {
      const catPosts = await db
        .select({ postId: postCategories.postId })
        .from(postCategories)
        .where(eq(postCategories.categoryId, query.categoryId))
      filteredPostIds = catPosts.map((r) => r.postId)
      if (filteredPostIds.length === 0) {
        return { items: [], total: 0, page, pageSize, totalPages: 0 }
      }
      conditions.push(sql`${posts.id} IN (${sql.join(filteredPostIds.map((id) => sql`${id}`), sql`, `)})`)
    }

    if (query.tagId) {
      const tagPosts = await db
        .select({ postId: postTags.postId })
        .from(postTags)
        .where(eq(postTags.tagId, query.tagId))
      const tagPostIds = tagPosts.map((r) => r.postId)
      if (tagPostIds.length === 0) {
        return { items: [], total: 0, page, pageSize, totalPages: 0 }
      }
      if (filteredPostIds) {
        // Intersect with category filter
        const intersection = filteredPostIds.filter((id) => tagPostIds.includes(id))
        if (intersection.length === 0) {
          return { items: [], total: 0, page, pageSize, totalPages: 0 }
        }
        // Remove the category condition and add intersection
        conditions.pop()
        conditions.push(sql`${posts.id} IN (${sql.join(intersection.map((id) => sql`${id}`), sql`, `)})`)
      }
      else {
        conditions.push(sql`${posts.id} IN (${sql.join(tagPostIds.map((id) => sql`${id}`), sql`, `)})`)
      }
    }

    const whereClause = and(...conditions)

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(posts)
      .where(whereClause)

    // Get items
    const items = await db
      .select()
      .from(posts)
      .where(whereClause)
      .orderBy(desc(posts.isTop), desc(posts.createdAt))
      .limit(pageSize)
      .offset(offset)

    const totalPages = Math.ceil(total / pageSize)

    return {
      items: items as ArticleWithRelations[],
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  /** Get a single article by slug with relations (public — published only) */
  static async getBySlug(slug: string): Promise<ArticleWithRelations | null> {
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), isNull(posts.deletedAt), eq(posts.status, 'published')))
      .limit(1)

    if (!post) return null

    // Get author
    const [author] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, post.authorId))
      .limit(1)

    // Get categories
    const postCats = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        isPrimary: postCategories.isPrimary,
      })
      .from(postCategories)
      .innerJoin(categories, eq(postCategories.categoryId, categories.id))
      .where(eq(postCategories.postId, post.id))

    // Get tags
    const postTgs = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id))

    // Increment view count
    await db.update(posts).set({ viewCount: sql`${posts.viewCount} + 1` }).where(eq(posts.id, post.id))

    return {
      ...post,
      viewCount: post.viewCount + 1,
      author: author ?? undefined,
      categories: postCats,
      tags: postTgs,
    } as ArticleWithRelations
  }

  /** Get a single article by ID with relations */
  static async getById(id: number): Promise<ArticleWithRelations | null> {
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1)

    if (!post) return null

    // Get author
    const [author] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, post.authorId))
      .limit(1)

    // Get categories
    const postCats = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        isPrimary: postCategories.isPrimary,
      })
      .from(postCategories)
      .innerJoin(categories, eq(postCategories.categoryId, categories.id))
      .where(eq(postCategories.postId, id))

    // Get tags
    const postTgs = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, id))

    return {
      ...post,
      author: author ?? undefined,
      categories: postCats,
      tags: postTgs,
    } as ArticleWithRelations
  }

  /** Update an article */
  static async update(id: number, input: ArticleUpdateInput): Promise<ArticleWithRelations | null> {
    // Check exists
    const [existing] = await db
      .select({ id: posts.id, slug: posts.slug })
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1)

    if (!existing) return null

    // Check slug uniqueness if changed
    if (input.slug && input.slug !== existing.slug) {
      const [slugConflict] = await db
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.slug, input.slug), ne(posts.id, id)))
        .limit(1)

      if (slugConflict) {
        throw createError({
          statusCode: 409,
          data: { code: BusinessErrors.DUPLICATE_SLUG.code, message: BusinessErrors.DUPLICATE_SLUG.message },
        })
      }
    }

    // Build update values (only defined fields)
    const updateValues: Record<string, unknown> = { updatedAt: new Date() }
    const fields = [
      'title', 'slug', 'content', 'excerpt', 'coverImage', 'status',
      'publishedAt', 'scheduledAt', 'seoTitle', 'seoDescription',
      'isTop', 'allowComment', 'password',
    ] as const

    for (const field of fields) {
      if (input[field] !== undefined) {
        updateValues[field] = input[field]
      }
    }

    await db.update(posts).set(updateValues).where(eq(posts.id, id))

    // Update category relations if provided
    if (input.categoryIds !== undefined) {
      await db.delete(postCategories).where(eq(postCategories.postId, id))
      if (input.categoryIds.length > 0) {
        await db.insert(postCategories).values(
          input.categoryIds.map((categoryId) => ({
            postId: id,
            categoryId,
            isPrimary: categoryId === input.primaryCategoryId,
          })),
        )
      }
    }

    // Update tag relations if provided
    if (input.tagIds !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, id))
      if (input.tagIds.length > 0) {
        await db.insert(postTags).values(
          input.tagIds.map((tagId) => ({
            postId: id,
            tagId,
          })),
        )
      }
    }

    return this.getById(id)
  }

  /** Soft-delete an article */
  static async softDelete(id: number): Promise<boolean> {
    const [existing] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1)

    if (!existing) return false

    await db
      .update(posts)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(posts.id, id))

    return true
  }
}
