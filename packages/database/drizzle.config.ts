import type { Config } from 'drizzle-kit'

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: '../../apps/site/data/blog.db',
  },
  // Migration naming: timestamp format
  migrations: {
    prefix: 'timestamp', // e.g., 20260318120000_create_users
  },
} satisfies Config
