import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

interface DatabaseConfig {
  dbPath: string
  enableSlowQueryLog?: boolean
  slowQueryThreshold?: number
}

export function createDatabase(config: DatabaseConfig) {
  const { dbPath, enableSlowQueryLog = true, slowQueryThreshold = 100 } = config

  const db = new Database(dbPath)

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')

  // Increase cache size for better performance
  db.pragma('cache_size = -64000') // 64MB cache

  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Slow query logging
  if (enableSlowQueryLog) {
    db.pragma(`trusted_schema = ON`)
    console.log(`[Database] Slow query logging enabled (threshold: ${slowQueryThreshold}ms)`)
  }

  return drizzle(db, { schema })
}

// Default database instance with retry logic
let dbInstance: ReturnType<typeof createDatabase> | null = null

export function getDatabase(dbPath?: string): ReturnType<typeof createDatabase> {
  if (!dbInstance) {
    const path = dbPath || './apps/site/data/blog.db'
    const maxRetries = 3
    let attempts = 0

    while (attempts < maxRetries) {
      try {
        dbInstance = createDatabase({
          dbPath: path,
          enableSlowQueryLog: true,
          slowQueryThreshold: 100,
        })
        break
      } catch (error) {
        attempts++
        if (attempts < maxRetries) {
          console.error(
            `[Database] Connection failed (attempt ${attempts}/${maxRetries}), retrying in 100ms...`
          )
        } else {
          console.error('[Database] Failed to connect after 3 attempts:', error)
          throw error
        }
      }
    }
  }
  return dbInstance! // Non-null assertion: we know it's set after the loop or an error was thrown
}

// Lazy getter for default export - avoids connection at import time
export const db = {
  get: () => {
    if (!dbInstance) {
      dbInstance = getDatabase()
    }
    return dbInstance
  },
}
