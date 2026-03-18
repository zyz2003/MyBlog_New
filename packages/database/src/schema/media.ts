import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const media = sqliteTable(
  'media',
  {
    id: text('id').primaryKey(),
    filename: text('filename').notNull(),
    originalName: text('original_name'),
    path: text('path').notNull(),
    url: text('url').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    width: integer('width'),
    height: integer('height'),
    // Extended fields per CONTEXT.md (optional for frontend)
    altText: text('alt_text'), // Accessibility
    thumbnailPath: text('thumbnail_path'), // Thumbnail image path
    folderId: text('folder_id'), // For grouping/folder organization
    // Audit fields
    uploadedBy: text('uploaded_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    uploadedByIdx: index('media_uploaded_by_idx').on(table.uploadedBy),
    mimeTypeIdx: index('media_mime_type_idx').on(table.mimeType),
    folderIdIdx: index('media_folder_idx').on(table.folderId),
  })
)

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, {
    fields: [media.uploadedBy],
    references: [users.id],
  }),
}))

// Type exports
export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
