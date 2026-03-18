import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { posts } from './posts'

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    parentId: text('parent_id').references((): ReturnType<typeof categories.id> => categories.id, {
      onDelete: 'set null', // Per CONTEXT.md: parent deleted → children become top-level
    }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index('categories_slug_idx').on(table.slug),
    parentIdIdx: index('categories_parent_idx').on(table.parentId),
  })
)

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryHierarchy',
  }),
  posts: many(posts),
  // children: many(categories, { relationName: 'categoryHierarchy' }),  // Will be added later
}))

// Type exports
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
