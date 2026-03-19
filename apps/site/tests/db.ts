import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '@my-blog/database/schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Test database path - in-memory for fast tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_DB_PATH = resolve(__dirname, '../../data/test.db')

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
 * Reset the test database - drops all tables and recreates schema
 * Call this between tests for isolation
 */
export async function resetTestDatabase(): Promise<void> {
  if (testClient) {
    try {
      // Close existing connection
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
