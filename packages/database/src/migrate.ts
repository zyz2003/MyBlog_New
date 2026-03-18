import { createClient } from '@libsql/client'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

// Path relative to package root, resolve to absolute
const DB_PATH = resolve(__dirname, '../../../apps/site/data/blog.db')

export async function runMigrations() {
  console.log('Starting database migration...')
  console.log('Database path:', DB_PATH)

  // Create database client
  const client = createClient({
    url: `file:${DB_PATH}`,
  })

  try {
    // Enable WAL mode (libsql specific)
    await client.execute('PRAGMA journal_mode = WAL')
    console.log('WAL mode enabled')

    // Enable foreign keys
    await client.execute('PRAGMA foreign_keys = ON')
    console.log('Foreign keys enabled')

    // Read migration files
    const migrationsDir = resolve(__dirname, '../drizzle')
    console.log('Migrations directory:', migrationsDir)

    const migrationFiles = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    console.log(`Found ${migrationFiles.length} migration files`)

    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`)
      const sql = readFileSync(join(migrationsDir, file), 'utf-8')

      // Split by statement breaker and execute each statement
      const statements = sql.split('--> statement-breakpoint')
      for (const stmt of statements) {
        const trimmed = stmt.trim()
        if (trimmed) {
          try {
            await client.execute(trimmed)
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            console.error(`Error executing statement: ${errorMessage}`)
            console.error(`Statement: ${trimmed.substring(0, 200)}...`)
            throw error
          }
        }
      }
    }

    console.log('All migrations applied successfully!')

    // Verify tables were created
    const result = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )

    console.log('\nTables created:')
    for (const row of result.rows) {
      console.log(`  - ${row.name}`)
    }

    console.log('\nMigration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Run always when executed as main module
runMigrations().catch(console.error)
