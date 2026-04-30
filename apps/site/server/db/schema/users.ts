import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  displayName: text('display_name'),
  avatar: text('avatar'),
  bio: text('bio'),
  role: text('role', { enum: ['admin', 'editor', 'author'] }).notNull().default('author'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
