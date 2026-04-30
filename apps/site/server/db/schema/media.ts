import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const media = sqliteTable('media', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  title: text('title'),
  alt: text('alt'),
  caption: text('caption'),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  extension: text('extension').notNull(),
  storageType: text('storage_type', { enum: ['local', 'oss', 'cos', 's3'] }).notNull().default('local'),
  storagePath: text('storage_path').notNull(),
  url: text('url').notNull(),
  cdnUrl: text('cdn_url'),
  width: integer('width'),
  height: integer('height'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
