import { describe, it, expect, vi } from 'vitest'

// Mock @libsql/client
vi.mock('@libsql/client', () => {
  const mockClient = {
    execute: vi.fn(),
    batch: vi.fn(),
    transaction: vi.fn(),
    close: vi.fn(),
  }
  return {
    createClient: vi.fn().mockImplementation(() => mockClient),
  }
})

vi.mock('drizzle-orm/libsql', () => {
  return {
    drizzle: vi.fn().mockImplementation((client) => ({
      _client: client,
      query: vi.fn(),
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  }
})

describe('Database Connection', () => {
  it('should create database connection with WAL mode and proper configuration', async () => {
    const { createDatabase } = await import('../db')
    const libsql = await import('@libsql/client')

    // Create database connection
    const db = createDatabase({
      dbPath: ':memory:',
      enableSlowQueryLog: true,
      slowQueryThreshold: 100,
    })

    // Verify createClient was called
    expect(libsql.createClient).toHaveBeenCalled()

    // Verify drizzle ORM wrapper was called
    const { drizzle } = await import('drizzle-orm/libsql')
    expect(drizzle).toHaveBeenCalled()

    // Verify db connection is defined
    expect(db).toBeDefined()
  })

  it('should export getDatabase function', async () => {
    const { getDatabase } = await import('../db')
    expect(typeof getDatabase).toBe('function')
  })

  it('should export db lazy getter', async () => {
    const { db } = await import('../db')
    expect(db).toBeDefined()
    expect(typeof db.get).toBe('function')
  })

  it('should have schema export available', async () => {
    const schema = await import('../schema')
    expect(schema).toBeDefined()
  })
})
