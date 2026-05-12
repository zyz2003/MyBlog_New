import { integer, sqliteTable, text, blob } from 'drizzle-orm/sqlite-core'
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
  storageType: text('storage_type', { enum: ['local', 'oss', 'cos', 's3', 'database'] }).notNull().default('database'),
  storagePath: text('storage_path'),
  url: text('url').notNull(),
  cdnUrl: text('cdn_url'),
  width: integer('width'),
  height: integer('height'),
  // Binary file data stored in database
  data: blob('data', { mode: 'buffer' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
