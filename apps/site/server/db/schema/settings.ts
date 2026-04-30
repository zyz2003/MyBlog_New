import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const themeSettings = sqliteTable('theme_settings', {
  id: integer('id').primaryKey(),
  themeName: text('theme_name').notNull().unique(),
  config: text('config', { mode: 'json' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const pluginSettings = sqliteTable('plugin_settings', {
  id: integer('id').primaryKey(),
  pluginName: text('plugin_name').notNull().unique(),
  config: text('config', { mode: 'json' }),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  version: text('version'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const systemSettings = sqliteTable('system_settings', {
  id: integer('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value', { mode: 'json' }),
  category: text('category'),
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
