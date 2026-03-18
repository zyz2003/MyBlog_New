import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { users, categories, tags, posts, postTags, media } from '../schema'
import { eq } from 'drizzle-orm'
import * as schema from '../schema'

describe('Database Integration', () => {
  let client: ReturnType<typeof createClient>
  let db: ReturnType<typeof drizzle>

  beforeAll(async () => {
    // Create in-memory database for tests
    client = createClient({
      url: 'file::memory:',
    })

    db = drizzle(client, { schema })

    // Run migrations in memory
    // Note: drizzle folder is at package root, not inside src
    const migrationsDir = resolve(import.meta.dirname, '../../drizzle')
    const migrationFiles = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of migrationFiles) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8')
      const statements = sql.split('--> statement-breakpoint')
      for (const stmt of statements) {
        const trimmed = stmt.trim()
        if (trimmed) {
          await client.execute(trimmed)
        }
      }
    }
  })

  afterAll(async () => {
    await client.close()
  })

  it('can insert and query users with extended fields', async () => {
    const testUser = {
      id: 'test-1',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashed',
      role: 'admin' as const,
      status: 'active' as const,
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Test bio',
      website: 'https://example.com',
    }

    await db.insert(users).values(testUser).run()

    const result = await db.select().from(users).where(eq(users.id, 'test-1')).get()
    expect(result).toBeDefined()
    expect(result?.username).toBe('testuser')
    expect(result?.avatar).toBe('https://example.com/avatar.jpg')
  })

  it('can handle posts with full fields and 4-state status', async () => {
    const testPost = {
      id: 'post-1',
      title: 'Test Post',
      slug: 'test-post',
      content: 'Content',
      excerpt: 'Excerpt',
      coverImage: '/images/cover.jpg',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      status: 'reviewing' as const,
      authorId: 'test-1',
      categoryId: null,
      viewCount: 0,
      likeCount: 0,
    }

    await db.insert(posts).values(testPost).run()

    const result = await db.select().from(posts).where(eq(posts.slug, 'test-post')).get()
    expect(result).toBeDefined()
    expect(result?.status).toBe('reviewing')
    expect(result?.seoTitle).toBe('SEO Title')
  })

  it('can handle category hierarchy (2 levels max)', async () => {
    const parentCat = {
      id: 'cat-parent',
      name: 'Parent Category',
      slug: 'parent',
      description: 'Parent',
    }

    const childCat = {
      id: 'cat-child',
      name: 'Child Category',
      slug: 'child',
      description: 'Child',
      parentId: 'cat-parent',
    }

    await db.insert(categories).values([parentCat, childCat]).run()

    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, 'cat-parent'))
      .all()
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Child Category')
  })

  it('can query posts with tags (many-to-many)', async () => {
    // Insert a post and tags, then associate them
    const post = {
      id: 'post-tags-test',
      title: 'Post with Tags',
      slug: 'post-with-tags',
      content: 'Content',
      status: 'published' as const,
      authorId: 'test-1',
    }

    const tag1 = { id: 'tag-1', name: 'Tag1', slug: 'tag1' }
    const tag2 = { id: 'tag-2', name: 'Tag2', slug: 'tag2' }

    await db.insert(posts).values(post).run()
    await db.insert(tags).values([tag1, tag2]).run()
    await db
      .insert(postTags)
      .values([
        { postId: post.id, tagId: tag1.id },
        { postId: post.id, tagId: tag2.id },
      ])
      .run()

    // Query posts with their tags
    const postResult = await db.select().from(posts).where(eq(posts.id, post.id)).get()
    const tagsResult = await db.select().from(postTags).where(eq(postTags.postId, post.id)).all()

    expect(postResult).toBeDefined()
    expect(tagsResult.length).toBe(2)
  })

  it('can insert and query media with extended fields', async () => {
    const testMedia = {
      id: 'media-1',
      filename: 'test-image.jpg',
      originalName: 'Original.jpg',
      path: '/uploads/test-image.jpg',
      url: 'https://example.com/uploads/test-image.jpg',
      mimeType: 'image/jpeg',
      size: 102400,
      width: 1920,
      height: 1080,
      altText: 'Test image',
      thumbnailPath: '/uploads/thumbnails/test-image.jpg',
      uploadedBy: 'test-1',
    }

    await db.insert(media).values(testMedia).run()

    const result = await db.select().from(media).where(eq(media.id, 'media-1')).get()
    expect(result).toBeDefined()
    expect(result?.filename).toBe('test-image.jpg')
    expect(result?.width).toBe(1920)
    expect(result?.altText).toBe('Test image')
  })
})
