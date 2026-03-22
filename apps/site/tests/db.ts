import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import * as schema from '@my-blog/database/schema'

/**
 * Global test database (for backward compatibility)
 * @deprecated Use createIsolatedTestDatabase() for new tests to avoid cross-file interference
 */
let testDb: LibSQLDatabase<typeof schema> | null = null
let testClient: ReturnType<typeof createClient> | null = null

/**
 * Get or create the test database connection
 * Uses in-memory SQLite for fast, isolated tests
 * @deprecated Use createIsolatedTestDatabase() for new tests to avoid cross-file interference
 */
export function getTestDatabase(): LibSQLDatabase<typeof schema> {
  if (!testClient) {
    testClient = createClient({
      url: 'file::memory:?cache=shared',
    })
    testDb = drizzle(testClient, { schema })
  }
  return testDb!
}

/**
 * Create an isolated test database instance
 * Each test file should call this to get its own database, avoiding cross-file interference
 *
 * @returns Object with db instance and cleanup function
 */
export function createIsolatedTestDatabase(): {
  db: LibSQLDatabase<typeof schema>
  cleanup: () => Promise<void>
} {
  const client = createClient({
    url: 'file::memory:?cache=shared',
  })
  // Pass schema explicitly to drizzle for proper table metadata
  const db = drizzle(client, { schema })

  return {
    db,
    cleanup: async () => {
      try {
        await client.close()
      } catch {
        // Ignore close errors
      }
    },
  }
}

/**
 * Initialize database schema for a test database
 * Creates all tables from the formal schema definitions
 */
export async function initializeTestDatabase(db: LibSQLDatabase<typeof schema>): Promise<void> {
  // Drop tables in reverse dependency order
  await db.run(sql`DROP TABLE IF EXISTS post_tags`)
  await db.run(sql`DROP TABLE IF EXISTS media`)
  await db.run(sql`DROP TABLE IF EXISTS posts`)
  await db.run(sql`DROP TABLE IF EXISTS tags`)
  await db.run(sql`DROP TABLE IF EXISTS categories`)
  await db.run(sql`DROP TABLE IF EXISTS users`)

  // Create users table
  await db.run(sql`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'author' NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL,
      avatar TEXT,
      bio TEXT,
      website TEXT,
      last_login_at INTEGER,
      last_login_ip TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  // Create categories table
  await db.run(sql`
    CREATE TABLE categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      parent_id TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  // Create posts table
  await db.run(sql`
    CREATE TABLE posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT,
      seo_title TEXT,
      seo_description TEXT,
      status TEXT DEFAULT 'draft' NOT NULL,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      published_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  // Create tags table
  await db.run(sql`
    CREATE TABLE tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#3b82f6',
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  // Create post_tags table
  await db.run(sql`
    CREATE TABLE post_tags (
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      created_at INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (post_id, tag_id)
    )
  `)

  // Create media table (matching formal schema in packages/database/src/schema/media.ts)
  await db.run(sql`
    CREATE TABLE media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT,
      path TEXT NOT NULL,
      url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      alt_text TEXT,
      thumbnail_path TEXT,
      folder_id TEXT,
      uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      uploaded_at INTEGER DEFAULT (unixepoch())
    )
  `)
}

/**
 * Clear all data from database (for beforeEach isolation)
 * Call this between tests to reset data while keeping schema
 */
export async function clearAllData(db: LibSQLDatabase<typeof schema>): Promise<void> {
  await db.run(sql`DELETE FROM post_tags`)
  await db.run(sql`DELETE FROM posts`)
  await db.run(sql`DELETE FROM tags`)
  await db.run(sql`DELETE FROM categories`)
  await db.run(sql`DELETE FROM users`)
}

/**
 * Seed test data - creates a test user, category, and tags
 */
export async function seedTestData(
  db: LibSQLDatabase<typeof schema>,
  passwordHash: string
): Promise<void> {
  // Insert test user
  await db.insert(schema.users).values({
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash,
    role: 'admin',
    status: 'active',
  })

  // Insert test category (using UUID format for schema validation compatibility)
  await db.insert(schema.categories).values({
    id: 'cat-00000000-0000-0000-0000-000000000001',
    name: 'Test Category',
    slug: 'test-category',
  })

  // Insert test tags (using UUID format for schema validation compatibility)
  await db.insert(schema.tags).values([
    { id: 'tag-00000000-0000-0000-0000-000000000001', name: 'Vue', slug: 'vue' },
    { id: 'tag-00000000-0000-0000-0000-000000000002', name: 'Nuxt', slug: 'nuxt' },
    { id: 'tag-00000000-0000-0000-0000-000000000003', name: 'TypeScript', slug: 'typescript' },
  ])
}

/**
 * Reset the global test database - drops all tables and recreates schema
 * Call this between tests for isolation (deprecated: use isolated databases instead)
 * @deprecated Use createIsolatedTestDatabase() for new tests
 */
export async function resetTestDatabase(): Promise<void> {
  if (testClient) {
    try {
      await testClient.close()
    } catch {
      // Ignore close errors
    }
    testClient = null
    testDb = null
  }

  testClient = createClient({
    url: 'file::memory:?cache=shared',
  })
  testDb = drizzle(testClient, { schema })

  await initializeTestDatabase(testDb!)
}

/**
 * Clean up global test database resources
 * Call this in afterAll hook (deprecated: use isolated database cleanup instead)
 * @deprecated Use the cleanup function from createIsolatedTestDatabase()
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (testClient) {
    await testClient.close()
    testClient = null
    testDb = null
  }
}
