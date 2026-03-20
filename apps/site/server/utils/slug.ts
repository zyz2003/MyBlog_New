/**
 * Slug Generation Utility
 *
 * Converts Chinese titles to pinyin slugs and ensures uniqueness.
 * Uses pinyin-pro library for accurate Chinese to pinyin conversion.
 */

import { pinyin } from 'pinyin-pro'

/**
 * Options for slug generation
 */
export interface SlugOptions {
  /** Separator between words (default: '-') */
  separator?: string
  /** Convert to lowercase (default: true) */
  lowercase?: boolean
  /** Remove special characters (default: true) */
  clean?: boolean
}

/**
 * Generate a URL-friendly slug from a title
 * Supports Chinese characters (converts to pinyin) and Latin characters
 *
 * @param title - The title to convert to slug
 * @param options - Slug generation options
 * @returns URL-friendly slug string
 *
 * @example
 * generateSlug('中文标题') // 'zhong-wen-biao-ti'
 * generateSlug('Hello World') // 'hello-world'
 * generateSlug('Hello 世界') // 'hello-shi-jie'
 */
export function generateSlug(title: string, options: SlugOptions = {}): string {
  const { separator = '-', lowercase = true, clean = true } = options

  if (!title || typeof title !== 'string') {
    return ''
  }

  // Convert Chinese characters to pinyin
  // pinyin-pro handles mixed Chinese and Latin characters
  let pinyinText = pinyin(title, {
    separator: ' ',
    toneType: 'none', // Remove tone marks
  })

  // Clean the text
  if (clean) {
    // Remove special characters except spaces and hyphens
    pinyinText = pinyinText.replace(/[^\w\s-]/gu, '')
  }

  // Replace spaces and underscores with separator
  let slug = pinyinText.trim().split(/\s+/).filter(Boolean).join(separator)

  // Convert to lowercase if requested
  if (lowercase) {
    slug = slug.toLowerCase()
  }

  // Replace multiple consecutive separators with single one
  slug = slug.replace(new RegExp(`${separator}+`, 'g'), separator)

  // Remove leading/trailing separators
  slug = slug.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '')

  return slug || 'untitled'
}

/**
 * Ensure slug uniqueness by adding incremental suffix if needed
 *
 * @param baseSlug - The base slug to ensure uniqueness for
 * @param existingSlugs - Array of existing slugs to check against
 * @param startFrom - Starting number for suffix (default: 1)
 * @returns Unique slug with incremental suffix if needed
 *
 * @example
 * ensureUniqueSlug('hello', ['hello', 'hello-1']) // 'hello-2'
 * ensureUniqueSlug('hello', ['world']) // 'hello'
 */
export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
  startFrom: number = 1
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = startFrom
  let slug = `${baseSlug}-${counter}`

  while (existingSlugs.includes(slug)) {
    counter++
    slug = `${baseSlug}-${counter}`
  }

  return slug
}

/**
 * Validate if a slug is properly formatted
 *
 * @param slug - The slug to validate
 * @returns true if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false
  }

  // Slug should only contain lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * Parse a slug back to its component parts
 * Useful for extracting base slug and counter
 *
 * @param slug - The slug to parse
 * @returns Object with base slug and optional counter
 *
 * @example
 * parseSlug('hello-world-2') // { base: 'hello-world', counter: 2 }
 * parseSlug('hello-world') // { base: 'hello-world', counter: null }
 */
export function parseSlug(slug: string): { base: string; counter: number | null } {
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]
  const counter = /^\d+$/.test(lastPart) ? parseInt(lastPart, 10) : null

  if (counter !== null) {
    parts.pop()
  }

  return {
    base: parts.join('-'),
    counter,
  }
}
