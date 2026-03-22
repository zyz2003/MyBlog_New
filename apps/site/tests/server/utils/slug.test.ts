/**
 * Slug Utility Tests
 *
 * Tests for slug.ts covering:
 * - generateSlug for Chinese and Latin characters
 * - ensureUniqueSlug for uniqueness
 * - isValidSlug for validation
 * - parseSlug for parsing
 */

import { describe, it, expect } from 'vitest'
import { generateSlug, ensureUniqueSlug, isValidSlug, parseSlug } from '../../../server/utils/slug'

describe('Slug Utility', () => {
  describe('generateSlug', () => {
    it('converts Chinese characters to pinyin', () => {
      expect(generateSlug('中文标题')).toBe('zhong-wen-biao-ti')
    })

    it('converts mixed Chinese and Latin characters', () => {
      expect(generateSlug('Hello 世界')).toBe('hello-shi-jie')
    })

    it('converts Latin characters to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('handles special characters', () => {
      expect(generateSlug('Hello! World?')).toBe('hello-world')
    })

    it('handles multiple spaces', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world')
    })

    it('handles leading/trailing spaces', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world')
    })

    it('uses custom separator', () => {
      expect(generateSlug('Hello World', { separator: '_' })).toBe('hello_world')
    })

    it('preserves case when lowercase is false', () => {
      const result = generateSlug('Hello World', { lowercase: false })
      expect(result).toBe('Hello-World')
    })

    it('returns "untitled" for empty string', () => {
      expect(generateSlug('')).toBe('untitled')
    })

    it('returns "untitled" for null/undefined', () => {
      expect(generateSlug(null as unknown as string)).toBe('untitled')
      expect(generateSlug(undefined as unknown as string)).toBe('untitled')
    })

    it('handles numbers in title', () => {
      expect(generateSlug('Top 10 最佳实践')).toBe('top-10-zui-jia-shi-jian')
    })
  })

  describe('ensureUniqueSlug', () => {
    it('returns original slug when no conflicts', () => {
      expect(ensureUniqueSlug('hello', ['world', 'foo'])).toBe('hello')
    })

    it('adds suffix when slug exists', () => {
      expect(ensureUniqueSlug('hello', ['hello'])).toBe('hello-1')
    })

    it('increments suffix until unique', () => {
      expect(ensureUniqueSlug('hello', ['hello', 'hello-1', 'hello-2'])).toBe('hello-3')
    })

    it('starts from custom startFrom value', () => {
      expect(ensureUniqueSlug('hello', ['hello'], 5)).toBe('hello-5')
    })

    it('handles multiple existing slugs', () => {
      const existing = ['hello', 'hello-1', 'hello-3', 'world']
      expect(ensureUniqueSlug('hello', existing)).toBe('hello-2')
    })
  })

  describe('isValidSlug', () => {
    it('returns true for valid slug', () => {
      expect(isValidSlug('hello-world')).toBe(true)
      expect(isValidSlug('hello-world-123')).toBe(true)
    })

    it('returns false for uppercase slug', () => {
      expect(isValidSlug('Hello-World')).toBe(false)
    })

    it('returns false for slug with special characters', () => {
      expect(isValidSlug('hello_world')).toBe(false)
      expect(isValidSlug('hello.world')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidSlug('')).toBe(false)
    })

    it('returns false for slug starting/ending with hyphen', () => {
      expect(isValidSlug('-hello-world')).toBe(false)
      expect(isValidSlug('hello-world-')).toBe(false)
    })
  })

  describe('parseSlug', () => {
    it('parses slug without counter', () => {
      const result = parseSlug('hello-world')
      expect(result.base).toBe('hello-world')
      expect(result.counter).toBeNull()
    })

    it('parses slug with counter', () => {
      const result = parseSlug('hello-world-3')
      expect(result.base).toBe('hello-world')
      expect(result.counter).toBe(3)
    })

    it('parses slug with number in base', () => {
      const result = parseSlug('top-10-posts-2')
      expect(result.base).toBe('top-10-posts')
      expect(result.counter).toBe(2)
    })

    it('handles single part slug', () => {
      const result = parseSlug('hello')
      expect(result.base).toBe('hello')
      expect(result.counter).toBeNull()
    })

    it('handles single part slug with counter', () => {
      const result = parseSlug('hello-5')
      expect(result.base).toBe('hello')
      expect(result.counter).toBe(5)
    })
  })
})
