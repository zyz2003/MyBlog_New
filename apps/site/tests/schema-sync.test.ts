/**
 * Schema Sync Tests
 *
 * 验证测试数据库结构与正式 Schema 完全一致
 * 这些测试会捕获 Schema 不一致的问题
 *
 * 如果测试失败，说明正式 Schema 与测试验证脚本之间存在差异
 * 需要同时更新 verify-schema.ts 中的 requiredFields 配置
 */

import { describe, it, expect } from 'vitest'
import * as schema from '@my-blog/database/schema'

describe('Schema Definition Validation', () => {
  describe('users table', () => {
    const table = schema.users

    it('has id field', () => {
      expect(table.id).toBeDefined()
    })

    it('has username field', () => {
      expect(table.username).toBeDefined()
    })

    it('has email field', () => {
      expect(table.email).toBeDefined()
    })

    it('has passwordHash field', () => {
      expect(table.passwordHash).toBeDefined()
    })

    it('has avatar field', () => {
      expect(table.avatar).toBeDefined()
    })

    it('has bio field', () => {
      expect(table.bio).toBeDefined()
    })

    it('has website field', () => {
      expect(table.website).toBeDefined()
    })

    it('has lastLoginAt field', () => {
      expect(table.lastLoginAt).toBeDefined()
    })

    it('has lastLoginIp field', () => {
      expect(table.lastLoginIp).toBeDefined()
    })
  })

  describe('posts table', () => {
    const table = schema.posts

    it('has id field', () => {
      expect(table.id).toBeDefined()
    })

    it('has title field', () => {
      expect(table.title).toBeDefined()
    })

    it('has slug field', () => {
      expect(table.slug).toBeDefined()
    })

    it('has content field', () => {
      expect(table.content).toBeDefined()
    })

    it('has status field', () => {
      expect(table.status).toBeDefined()
    })

    it('has authorId field', () => {
      expect(table.authorId).toBeDefined()
    })

    it('has categoryId field', () => {
      expect(table.categoryId).toBeDefined()
    })

    it('has excerpt field', () => {
      expect(table.excerpt).toBeDefined()
    })

    it('has coverImage field', () => {
      expect(table.coverImage).toBeDefined()
    })

    it('has seoTitle field', () => {
      expect(table.seoTitle).toBeDefined()
    })

    it('has seoDescription field', () => {
      expect(table.seoDescription).toBeDefined()
    })

    it('has viewCount field', () => {
      expect(table.viewCount).toBeDefined()
    })

    it('has likeCount field', () => {
      expect(table.likeCount).toBeDefined()
    })

    it('has publishedAt field', () => {
      expect(table.publishedAt).toBeDefined()
    })

    it('has createdAt field', () => {
      expect(table.createdAt).toBeDefined()
    })

    it('has updatedAt field', () => {
      expect(table.updatedAt).toBeDefined()
    })
  })

  describe('tags table', () => {
    const table = schema.tags

    it('has id field', () => {
      expect(table.id).toBeDefined()
    })

    it('has name field', () => {
      expect(table.name).toBeDefined()
    })

    it('has slug field', () => {
      expect(table.slug).toBeDefined()
    })

    it('has color field', () => {
      expect(table.color).toBeDefined()
    })
  })

  describe('postTags table', () => {
    const table = schema.postTags

    it('has postId field', () => {
      expect(table.postId).toBeDefined()
    })

    it('has tagId field', () => {
      expect(table.tagId).toBeDefined()
    })

    it('has createdAt field', () => {
      expect(table.createdAt).toBeDefined()
    })
  })

  describe('categories table', () => {
    const table = schema.categories

    it('has id field', () => {
      expect(table.id).toBeDefined()
    })

    it('has name field', () => {
      expect(table.name).toBeDefined()
    })

    it('has slug field', () => {
      expect(table.slug).toBeDefined()
    })

    it('has parentId field for hierarchy', () => {
      expect(table.parentId).toBeDefined()
    })
  })

  describe('media table', () => {
    const table = schema.media

    it('has id field', () => {
      expect(table.id).toBeDefined()
    })

    it('has filename field', () => {
      expect(table.filename).toBeDefined()
    })

    it('has mimeType field', () => {
      expect(table.mimeType).toBeDefined()
    })

    it('has size field', () => {
      expect(table.size).toBeDefined()
    })

    it('has url field', () => {
      expect(table.url).toBeDefined()
    })
  })

  describe('Schema Export Completeness', () => {
    it('exports all required tables', () => {
      expect(schema.users).toBeDefined()
      expect(schema.posts).toBeDefined()
      expect(schema.tags).toBeDefined()
      expect(schema.postTags).toBeDefined()
      expect(schema.categories).toBeDefined()
      expect(schema.media).toBeDefined()
    })

    it('schema object has all expected keys', () => {
      const schemaKeys = Object.keys(schema)
      const requiredTables = ['users', 'posts', 'tags', 'postTags', 'categories', 'media']

      for (const table of requiredTables) {
        expect(schemaKeys).toContain(table)
      }
    })
  })
})
