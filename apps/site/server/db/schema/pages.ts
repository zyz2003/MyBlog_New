import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core'

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  componentCode: text('component_code').notNull(),
  template: text('template', { enum: ['default', 'wide', 'full'] }).notNull().default('default'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  showInNav: integer('show_in_nav', { mode: 'boolean' }).notNull().default(false),
  navLabel: text('nav_label'),
  navOrder: integer('nav_order').notNull().default(0),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  authorId: integer('author_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, (t) => ({
  slugIdx: index('idx_pages_slug_unique').on(t.slug).where(sql`deleted_at IS NULL`),
  statusIdx: index('idx_pages_status').on(t.status),
  showInNavIdx: index('idx_pages_show_in_nav').on(t.showInNav),
}))
