/**
 * Post Service
 *
 * Provides business logic for post management including:
 * - Create, update, delete posts with transaction support
 * - Get single post with relations (category, tags, author)
 * - List posts with pagination, filters, and sorting
 * - Slug generation and markdown rendering
 */

import { eq, and, or, like, desc, asc, SQL, type LibSQLDatabase } from 'drizzle-orm'
import {
  posts,
  type Post,
  type NewPost,
  categories,
  users,
  tags,
  postTags,
  type NewPostTag,
} from '@my-blog/database'
import { generateSlug as generateSlugUtil } from '../utils/slug'
import { renderMarkdown } from '../utils/markdown'

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
 * Options for getting a single post
 */
export interface GetPostOptions {
  includeCategory?: boolean
  includeTags?: boolean
  includeAuthor?: boolean
  includeContentHtml?: boolean
}

/**
 * Query parameters for listing posts
 */
export interface ListPostsQuery {
  limit?: number
  offset?: number
  category?: string
  tag?: string
  status?: 'draft' | 'published' | 'archived' | 'reviewing'
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  authorId?: string
}

/**
 * Post with relations (for create/update operations)
 */
export interface PostWithRelations extends Omit<Post, 'content'> {
  content: string
  contentHtml?: string
  category?: { id: string; name: string; slug: string } | null
  tags: { id: string; name: string; slug: string }[]
  author?: { id: string; username: string; email?: string } | null
}

/**
 * Post list item (for list operations - lighter weight)
 */
export interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  status: string
  categoryId: string | null
  category?: { name: string; slug: string } | null
  tags: { name: string; slug: string }[]
  authorId: string
  author?: { username: string } | null
  viewCount: number
  likeCount: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a new post with tags
 * Uses transaction for atomic post+tag operations
 *
 * @param data - Post data (without id)
 * @param tagIds - Array of tag IDs to associate
 * @param existingSlugs - Optional array of existing slugs for uniqueness check
 * @returns Created post with relations
 */
export async function createPost(
  data: Omit<NewPost, 'id'> & { content: string },
  tagIds: string[] = [],
  existingSlugs?: string[]
): Promise<PostWithRelations> {
  const db = await getDatabase()

  return db.transaction(async (tx) => {
    // Generate unique slug from title
    const baseSlug = generateSlugUtil(data.title as string)
    let slug = baseSlug
    let counter = 1

    // Check slug uniqueness
    while (existingSlugs?.includes(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Also check in database
    const existingPost = await tx
      .select({ slug: posts.slug })
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1)

    if (existingPost.length > 0) {
      slug = `${baseSlug}-${counter}`
    }

    // Render markdown content to HTML (optional caching)
    const contentHtml = renderMarkdown(data.content)

    // Create the post with generated ID
    const newPost: NewPost = {
      ...data,
      id: crypto.randomUUID(),
      slug,
      contentHtml,
    }

    const result = await tx.insert(posts).values(newPost).returning()
    const createdPost = result[0]

    // Associate tags if provided
    if (tagIds.length > 0) {
      const postTagValues: NewPostTag[] = tagIds.map((tagId) => ({
        postId: createdPost.id,
        tagId,
      }))
      await tx.insert(postTags).values(postTagValues)
    }

    // Return post with relations
    return {
      ...createdPost,
      content: data.content,
      contentHtml,
      category: null,
      tags: [],
      author: null,
    }
  })
}

/**
 * Update a post by ID with tags
 * Uses transaction for atomic post+tag operations
 *
 * @param id - Post ID
 * @param data - Post data to update
 * @param tagIds - Array of tag IDs to associate (replaces existing tags)
 * @returns Updated post with relations
 * @throws HTTPError 404 if post not found
 */
export async function updatePost(
  id: string,
  data: Partial<NewPost> & { content?: string },
  tagIds?: string[]
): Promise<PostWithRelations> {
  const db = await getDatabase()

  return db.transaction(async (tx) => {
    // Check if post exists
    const existingPosts = await tx.select().from(posts).where(eq(posts.id, id)).limit(1)

    if (existingPosts.length === 0) {
      const { HTTPError } = await import('../utils/error')
      throw HTTPError.NOT_FOUND('Post not found')
    }

    const existingPost = existingPosts[0]

    // Update slug if title changed
    let slug = data.slug || existingPost.slug
    if (data.title && data.title !== existingPost.title) {
      slug = generateSlugUtil(data.title)
    }

    // Update contentHtml if content changed
    let contentHtml = existingPost.contentHtml
    if (data.content) {
      contentHtml = renderMarkdown(data.content)
    }

    // Update the post
    const updateData: Partial<NewPost> = {
      ...data,
      slug,
      contentHtml,
      updatedAt: new Date(),
    }

    const result = await tx.update(posts).set(updateData).where(eq(posts.id, id)).returning()
    const updatedPost = result[0]

    // Update tags if provided
    if (tagIds !== undefined) {
      // Delete existing post-tag relations
      await tx.delete(postTags).where(eq(postTags.postId, id))

      // Insert new relations
      if (tagIds.length > 0) {
        const postTagValues: NewPostTag[] = tagIds.map((tagId) => ({
          postId: id,
          tagId,
        }))
        await tx.insert(postTags).values(postTagValues)
      }
    }

    // Return post with relations (tags will be populated by caller if needed)
    return {
      ...updatedPost,
      content: data.content || existingPost.content,
      contentHtml,
      category: null,
      tags: [],
      author: null,
    }
  })
}

/**
 * Delete a post by ID
 * Removes post and associated postTags (cascade)
 *
 * @param id - Post ID
 * @returns Deleted post data
 * @throws HTTPError 404 if post not found
 */
export async function deletePost(id: string): Promise<Post> {
  const db = await getDatabase()

  // Check if post exists
  const existingPosts = await db.select().from(posts).where(eq(posts.id, id)).limit(1)

  if (existingPosts.length === 0) {
    const { HTTPError } = await import('../utils/error')
    throw HTTPError.NOT_FOUND('Post not found')
  }

  // Delete the post (postTags will be deleted by cascade)
  const result = await db.delete(posts).where(eq(posts.id, id)).returning()

  return result[0]
}

/**
 * Get a post by ID with optional relations
 *
 * @param id - Post ID
 * @param options - Options for including relations
 * @returns Post with requested relations, or null if not found
 */
export async function getPostById(
  id: string,
  options: GetPostOptions = {}
): Promise<PostWithRelations | null> {
  const db = await getDatabase()

  const {
    includeCategory = true,
    includeTags = true,
    includeAuthor = true,
    includeContentHtml = false,
  } = options

  // Build the query based on options
  const query = db.select().from(posts).where(eq(posts.id, id))

  const postRecords = await query
  if (postRecords.length === 0) {
    return null
  }

  const postRecord = postRecords[0]

  // Fetch relations
  let category = null
  let tagsList: { id: string; name: string; slug: string }[] = []
  let author = null

  if (includeCategory && postRecord.categoryId) {
    const categoryRecords = await db
      .select()
      .from(categories)
      .where(eq(categories.id, postRecord.categoryId))
    category = categoryRecords[0] || null
  }

  if (includeTags) {
    const postTagRecords = await db
      .select({
        tagId: postTags.tagId,
      })
      .from(postTags)
      .where(eq(postTags.postId, id))

    if (postTagRecords.length > 0) {
      const tagIds = postTagRecords.map((pt) => pt.tagId)
      const tagRecords = await db
        .select()
        .from(tags)
        .where(or(...tagIds.map((tid) => eq(tags.id, tid))))
      tagsList = tagRecords
    }
  }

  if (includeAuthor) {
    const authorRecords = await db.select().from(users).where(eq(users.id, postRecord.authorId))
    author = authorRecords[0] || null
  }

  return {
    ...postRecord,
    contentHtml: includeContentHtml ? postRecord.contentHtml : undefined,
    category,
    tags: tagsList,
    author: author
      ? {
          id: author.id,
          username: author.username,
          email: author.email,
        }
      : null,
  }
}

/**
 * List posts with pagination, filters, and sorting
 *
 * @param query - Query parameters
 * @returns Paginated list of posts with meta information
 */
export async function listPosts(
  query: ListPostsQuery = {}
): Promise<{ items: PostListItem[]; total: number; limit: number; offset: number }> {
  const db = await getDatabase()

  const {
    limit = 10,
    offset = 0,
    category,
    tag,
    status,
    search,
    sort = 'publishedAt',
    order = 'desc',
    authorId,
  } = query

  // Build WHERE conditions
  const conditions: SQL[] = []

  if (status) {
    conditions.push(eq(posts.status, status))
  }

  if (category) {
    const categoryRecord = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, category))
      .limit(1)

    if (categoryRecord.length > 0) {
      conditions.push(eq(posts.categoryId, categoryRecord[0].id))
    }
  }

  if (tag) {
    const tagRecord = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, tag)).limit(1)

    if (tagRecord.length > 0) {
      const postIdsWithTag = await db
        .select({ postId: postTags.postId })
        .from(postTags)
        .where(eq(postTags.tagId, tagRecord[0].id))

      if (postIdsWithTag.length > 0) {
        const postIds = postIdsWithTag.map((p) => p.postId)
        conditions.push(or(...postIds.map((pid) => eq(posts.id, pid))))
      } else {
        // No posts with this tag, return empty result
        return { items: [], total: 0, limit, offset }
      }
    }
  }

  if (search) {
    const searchTerm = `%${search}%`
    conditions.push(or(like(posts.title, searchTerm), like(posts.content, searchTerm)))
  }

  if (authorId) {
    conditions.push(eq(posts.authorId, authorId))
  }

  // Get total count
  const countResult = await db.select({ count: posts.id }).from(posts)
  const total = countResult.length

  // Build ORDER BY
  const sortField = sort === 'publishedAt' ? posts.publishedAt : posts[sort as keyof typeof posts]
  const orderBy = order === 'desc' ? desc(sortField as SQL) : asc(sortField as SQL)

  // Fetch posts
  const postRecords = await db
    .select()
    .from(posts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)

  // Fetch relations for each post (category and tags)
  const items: PostListItem[] = await Promise.all(
    postRecords.map(async (post) => {
      let category = null
      let tagsList: { name: string; slug: string }[] = []
      let author = null

      if (post.categoryId) {
        const categoryRecords = await db
          .select({ name: categories.name, slug: categories.slug })
          .from(categories)
          .where(eq(categories.id, post.categoryId))
          .limit(1)
        category = categoryRecords[0] || null
      }

      const postTagRecords = await db
        .select({ tagId: postTags.tagId })
        .from(postTags)
        .where(eq(postTags.postId, post.id))

      if (postTagRecords.length > 0) {
        const tagIds = postTagRecords.map((pt) => pt.tagId)
        const tagRecords = await db
          .select({ name: tags.name, slug: tags.slug })
          .from(tags)
          .where(or(...tagIds.map((tid) => eq(tags.id, tid))))
        tagsList = tagRecords
      }

      if (post.authorId) {
        const authorRecords = await db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, post.authorId))
          .limit(1)
        author = authorRecords[0] || null
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        status: post.status,
        categoryId: post.categoryId,
        category,
        tags: tagsList,
        authorId: post.authorId,
        author,
        viewCount: post.viewCount,
        likeCount: post.likeCount,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }
    })
  )

  return {
    items,
    total,
    limit,
    offset,
  }
}

/**
 * Reset database instance (useful for testing)
 */
export function resetDatabaseInstance(): void {
  databaseInstance = null
}
