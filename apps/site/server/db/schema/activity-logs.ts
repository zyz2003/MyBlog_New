import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core'

export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: integer('target_id').notNull(),
  targetTitle: text('target_title'),
  userId: integer('user_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  createdAtIdx: index('idx_activity_created_at').on(t.createdAt),
  targetTypeIdx: index('idx_activity_target_type').on(t.targetType),
}))
