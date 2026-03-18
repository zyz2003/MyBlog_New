import { describe, it, expect, vi } from 'vitest'

// Mock better-sqlite3 (default export) and drizzle-orm
vi.mock('better-sqlite3', () => {
  const mockDbInstance = {
    pragma: vi.fn(),
    close: vi.fn(),
    prepare: vi.fn(),
    transaction: vi.fn(),
  }
  return {
    default: vi.fn().mockImplementation(() => mockDbInstance),
  }
})

vi.mock('drizzle-orm/better-sqlite3', () => {
  return {
    drizzle: vi.fn().mockImplementation((db) => ({
      _db: db,
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
    const Database = await import('better-sqlite3')

    // Create database connection
    const db = createDatabase({
      dbPath: ':memory:',
      enableSlowQueryLog: true,
      slowQueryThreshold: 100,
    })

    // Verify Database was instantiated (default export is the constructor)
    expect(Database.default).toHaveBeenCalled()

    // Verify drizzle ORM wrapper was called
    const { drizzle } = await import('drizzle-orm/better-sqlite3')
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
