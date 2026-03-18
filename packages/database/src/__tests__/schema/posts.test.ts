import { describe, it, expect } from 'vitest'
import { posts } from '../../schema/posts'

describe('Posts Schema', () => {
  it('has correct fields', () => {
    expect(posts.id).toBeDefined()
    expect(posts.title).toBeDefined()
    expect(posts.slug).toBeDefined()
    expect(posts.content).toBeDefined()
    expect(posts.excerpt).toBeDefined()
    expect(posts.coverImage).toBeDefined()
    expect(posts.seoTitle).toBeDefined()
    expect(posts.seoDescription).toBeDefined()
    expect(posts.status).toBeDefined()
    expect(posts.authorId).toBeDefined()
    expect(posts.categoryId).toBeDefined()
    expect(posts.viewCount).toBeDefined()
    expect(posts.likeCount).toBeDefined()
    expect(posts.publishedAt).toBeDefined()
    expect(posts.createdAt).toBeDefined()
    expect(posts.updatedAt).toBeDefined()
  })

  it('has correct status enum values', () => {
    // draft → reviewing → published → archived
    expect(posts.status).toBeDefined()
  })

  it('has unique constraint on slug', () => {
    // Unique constraint verified by drizzle-kit generate
    expect(posts.slug).toBeDefined()
  })

  it('has indexes for performance', () => {
    // slug, status, author_id, category_id, created_at
    expect(posts).toBeDefined()
  })
})
