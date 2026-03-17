/**
 * @my-blog/types
 *
 * Shared TypeScript Types
 *
 * Common type definitions used across the blog system.
 */

export const VERSION = '0.0.0'

/**
 * Base article interface
 */
export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  authorId: string
  status: 'draft' | 'published' | 'archived'
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  tags: string[]
  categoryId?: string
}

/**
 * Base user interface
 */
export interface User {
  id: string
  username: string
  email: string
  displayName?: string
  avatar?: string
  role: 'admin' | 'editor' | 'author'
  createdAt: Date
  updatedAt: Date
}

/**
 * Base category interface
 */
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
}

/**
 * Base tag interface
 */
export interface Tag {
  id: string
  name: string
  slug: string
}
