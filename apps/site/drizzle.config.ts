import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './server/db/migrations',
  schema: './server/db/schema',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './database/blog.sqlite',
  },
  strict: true,
  verbose: true,
})
