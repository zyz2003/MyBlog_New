import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Note: posts and media relations will be added in subsequent plans
// to avoid circular dependency issues during schema generation

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', {
      enum: ['admin', 'author', 'editor'],
    })
      .default('author')
      .notNull(),
    status: text('status', {
      enum: ['active', 'banned'],
    })
      .default('active')
      .notNull(),
    // Extended fields per CONTEXT.md
    avatar: text('avatar'),
    bio: text('bio'),
    website: text('website'),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
    lastLoginIp: text('last_login_ip'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    usernameIdx: index('users_username_idx').on(table.username),
    emailIdx: index('users_email_idx').on(table.email),
  })
)

// Note: usersRelations will be defined in subsequent plans
// after posts and media schemas are created
export const usersRelations = relations(users, () => ({
  // posts: many(posts),  // Will be added in Plan 03-03
  // media: many(media),  // Will be added in Plan 03-04
}))

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
