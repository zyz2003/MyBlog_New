import { eq, desc } from 'drizzle-orm'
import { db } from '../utils/db'
import { systemSettings } from '../db/schema'

/** Settings service — CRUD operations for system settings */
export class SettingsService {
  /** Get all settings grouped by category */
  static async getAll() {
    const rows = await db
      .select()
      .from(systemSettings)
      .orderBy(systemSettings.category, desc(systemSettings.updatedAt))

    // Group by category
    const grouped: Record<string, typeof rows> = {}
    for (const row of rows) {
      const cat = row.category || 'general'
      if (!grouped[cat]) {
        grouped[cat] = []
      }
      grouped[cat].push(row)
    }

    return grouped
  }

  /** Get single setting by key */
  static async getByKey(key: string) {
    const [record] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1)

    return record || null
  }

  /** Upsert a single setting (insert or update on key conflict) */
  static async upsert(
    key: string,
    value: unknown,
    category?: string,
    description?: string,
  ) {
    const now = new Date()

    const [record] = await db
      .insert(systemSettings)
      .values({
        key,
        value: value as any,
        category,
        description,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: value as any,
          updatedAt: now,
          ...(category !== undefined ? { category } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      })
      .returning()

    return record
  }

  /** Batch update multiple settings */
  static async batchUpdate(
    items: Array<{ key: string; value: unknown; category?: string; description?: string }>,
  ) {
    const results = []
    for (const item of items) {
      const record = await SettingsService.upsert(
        item.key,
        item.value,
        item.category,
        item.description,
      )
      results.push(record)
    }
    return results
  }
}
