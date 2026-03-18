import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Note: posts relation will be added in Plan 03-03
// to avoid circular dependency issues during schema generation

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

// Note: categoriesRelations will be fully defined in subsequent plans
// after posts schema is created
export const categoriesRelations = relations(categories, ({ one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryHierarchy',
  }),
  // children: many(categories, { relationName: 'categoryHierarchy' }),  // Will be added later
  // posts: many(posts),  // Will be added in Plan 03-03
}))

// Type exports
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
