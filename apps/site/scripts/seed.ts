/**
 * Seed script: creates default admin user if none exists
 * Usage: pnpm seed (from project root)
 */
import { eq } from 'drizzle-orm'
import { db } from '../server/db/connection'
import { users } from '../server/db/schema'
import { hash, compare } from 'bcryptjs'

const SALT_ROUNDS = 10

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@blog.local',
  displayName: '管理员',
  role: 'admin' as const,
  status: 'active' as const,
}

async function seed() {
  console.log('Checking for existing admin user...')

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, DEFAULT_ADMIN.username))
    .limit(1)

  if (existing) {
    console.log('Admin user already exists, skipping seed.')
    return
  }

  console.log('Creating default admin user...')
  const hashedPassword = await hash(DEFAULT_ADMIN.password, SALT_ROUNDS)

  await db.insert(users).values({
    username: DEFAULT_ADMIN.username,
    email: DEFAULT_ADMIN.email,
    password: hashedPassword,
    displayName: DEFAULT_ADMIN.displayName,
    role: DEFAULT_ADMIN.role,
    status: DEFAULT_ADMIN.status,
  })

  console.log('Default admin user created successfully.')
  console.log(`  Username: ${DEFAULT_ADMIN.username}`)
  console.log(`  Password: ${DEFAULT_ADMIN.password}`)
  console.log('  (Change password after first login!)')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
