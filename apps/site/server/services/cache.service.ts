/**
 * LRU Cache Service with TTL support.
 *
 * Uses a Map (insertion-order) to implement LRU eviction without
 * external dependencies. When max entries is reached, the oldest
 * entry (first inserted) is evicted.
 *
 * Default: 500 max entries, 300s (5 min) TTL.
 */

interface CacheEntry<T = unknown> {
  value: T
  expiresAt: number
}

export class CacheService {
  private cache = new Map<string, CacheEntry>()
  private max: number
  private defaultTtlMs: number

  constructor(options?: { max?: number; ttl?: number }) {
    this.max = options?.max ?? 500
    this.defaultTtlMs = (options?.ttl ?? 300) * 1000
  }

  /** Get a cached value. Returns undefined if missing or expired. */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    // Check TTL expiry
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return undefined
    }

    // Move to end (most recently used) by re-inserting
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value as T
  }

  /** Store a value with optional TTL in seconds. */
  set(key: string, value: unknown, ttlSeconds?: number): void {
    // If key already exists, delete first so re-insert goes to end
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Evict oldest entry if at capacity
    while (this.cache.size >= this.max) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
      else {
        break
      }
    }

    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  /** Remove a single entry. */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /** Remove all entries whose key starts with the given prefix. */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  /** Remove all entries. */
  clear(): void {
    this.cache.clear()
  }

  /** Get from cache or compute, cache, and return. */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== undefined) return cached

    const value = await factory()
    this.set(key, value, ttlSeconds)
    return value
  }
}

/** Singleton cache instance with default settings */
export const cache = new CacheService()
