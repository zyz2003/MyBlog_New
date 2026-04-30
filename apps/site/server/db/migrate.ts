import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './connection'

async function main() {
  console.log('Running migrations...')

  try {
    await migrate(db, { migrationsFolder: './server/db/migrations' })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

main()
