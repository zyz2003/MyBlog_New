import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import * as schema from '@my-blog/database/schema'

let testDb: LibSQLDatabase<typeof schema> | null = null
let testClient: ReturnType<typeof createClient> | null = null

/**
 * Get or create the test database connection
 * Uses in-memory SQLite for fast, isolated tests
 */
export function getTestDatabase(): LibSQLDatabase<typeof schema> {
  if (!testClient) {
    // Use in-memory database for tests
    testClient = createClient({
      url: 'file::memory:?cache=shared',
    })
    testDb = drizzle(testClient, { schema })
  }
  return testDb!
}

/**
 * Initialize database schema - creates all tables
 */
async function initializeDatabaseSchema(db: LibSQLDatabase<typeof schema>): Promise<void> {
  // Drop tables in reverse dependency order
  await db.run(sql`DROP TABLE IF EXISTS posts_tags`)
  await db.run(sql`DROP TABLE IF EXISTS media`)
  await db.run(sql`DROP TABLE IF EXISTS posts`)
  await db.run(sql`DROP TABLE IF EXISTS tags`)
  await db.run(sql`DROP TABLE IF EXISTS categories`)
  await db.run(sql`DROP TABLE IF EXISTS users`)

  // Create tables
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
  await db.run(sql`
    CREATE TABLE tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#3b82f6',
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)
  await db.run(sql`
    CREATE TABLE posts_tags (
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    )
  `)
  await db.run(sql`
    CREATE TABLE media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size INTEGER,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      uploaded_by TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch())
    )
  `)
}

/**
 * Reset the test database - drops all tables and recreates schema
 * Call this between tests for isolation
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

  // Create fresh in-memory database
  testClient = createClient({
    url: 'file::memory:?cache=shared',
  })
  testDb = drizzle(testClient, { schema })

  // Initialize schema
  await initializeDatabaseSchema(testDb!)
}

/**
 * Clean up test database resources
 * Call this in afterAll hook
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (testClient) {
    await testClient.close()
    testClient = null
    testDb = null
  }
}
