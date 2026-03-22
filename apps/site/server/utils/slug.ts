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
 * Uses pinyin-pro only for Chinese characters, keeps Latin characters intact
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
    return 'untitled'
  }

  // Process the title character by character
  // - Chinese characters: convert to pinyin using pinyin-pro
  // - Latin characters and numbers: keep as-is (grouped into words)
  // - Spaces and separators: normalize to single separator

  let result = ''
  let currentWord = ''

  for (const char of title) {
    const charCode = char.charCodeAt(0)

    // Check if character is Chinese (CJK Unified Ideographs)
    const isChinese = charCode >= 0x4e00 && charCode <= 0x9fff

    if (isChinese) {
      // Flush current Latin word
      if (currentWord) {
        result += (result ? separator : '') + currentWord
        currentWord = ''
      }
      // Convert Chinese to pinyin (single character)
      const pinyinChar = pinyin(char, { toneType: 'none' }).trim()
      if (pinyinChar) {
        result += (result ? separator : '') + pinyinChar
      }
    } else if (/[\w]/.test(char)) {
      // Latin letter or number - accumulate
      currentWord += char
    } else {
      // Space or special character - treat as word separator
      if (currentWord) {
        result += (result ? separator : '') + currentWord
        currentWord = ''
      }
    }
  }

  // Flush any remaining word
  if (currentWord) {
    result += (result ? separator : '') + currentWord
  }

  // Convert to lowercase if requested
  if (lowercase) {
    result = result.toLowerCase()
  }

  // Clean: remove consecutive separators
  if (clean) {
    result = result.replace(new RegExp(`${separator}+`, 'g'), separator)
  }

  // Remove leading/trailing separators
  result = result.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')

  return result || 'untitled'
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
