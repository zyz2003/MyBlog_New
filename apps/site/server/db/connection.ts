import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { resolve, dirname } from 'node:path'
import { mkdirSync } from 'node:fs'
import * as schema from './schema'

// Resolve database path relative to project root (apps/site)
const dbUrl = process.env.DATABASE_URL || './database/blog.sqlite'
const dbPath = resolve(process.cwd(), dbUrl)

// Ensure database directory exists
const dbDir = dirname(dbPath)
mkdirSync(dbDir, { recursive: true })

// Create SQLite connection with WAL mode
const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('busy_timeout = 5000')
sqlite.pragma('synchronous = NORMAL')

// Create Drizzle instance with all schemas (enables relational queries)
export const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema })
export { sqlite }

// Graceful shutdown: close database on process exit
process.on('exit', () => sqlite.close())
process.on('SIGINT', () => { sqlite.close(); process.exit(0) })
process.on('SIGTERM', () => { sqlite.close(); process.exit(0) })
