import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../utils/db'
import { systemSettings } from '../db/schema'
import { settingSchemas } from './settings.schema'

/** Settings service — CRUD operations for system settings with Zod validation and transactional batch updates */
export class SettingsService {
  /** Get all settings grouped by category */
  static async getAll() {
    const rows = await db
      .select()
      .from(systemSettings)
      .orderBy(systemSettings.category, desc(systemSettings.updatedAt))

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

  /** Upsert a single setting (insert or update on key conflict) — validates value with Zod */
  static async upsert(
    key: string,
    value: unknown,
    category?: string,
    description?: string,
  ) {
    const schema = settingSchemas[key] ?? z.unknown()
    const parsed = schema.parse(value)
    const now = new Date()

    const [record] = await db
      .insert(systemSettings)
      .values({
        key,
        value: parsed,
        category,
        description,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: parsed,
          updatedAt: now,
          ...(category !== undefined ? { category } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      })
      .returning()

    return record
  }

  /** Batch update multiple settings — atomic via db.transaction() with Zod validation */
  static async batchUpdate(
    items: Array<{ key: string; value: unknown; category?: string; description?: string }>,
  ) {
    return await db.transaction(async (tx) => {
      const results = []
      for (const item of items) {
        const schema = settingSchemas[item.key] ?? z.unknown()
        const parsed = schema.parse(item.value)
        const [record] = await tx
          .insert(systemSettings)
          .values({
            key: item.key,
            value: parsed,
            category: item.category,
            description: item.description,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: systemSettings.key,
            set: {
              value: parsed,
              updatedAt: new Date(),
              ...(item.category !== undefined ? { category: item.category } : {}),
              ...(item.description !== undefined ? { description: item.description } : {}),
            },
          })
          .returning()
        results.push(record)
      }
      return results
    })
  }

  /** Validate a setting value against its Zod schema */
  static parseValue(key: string, value: unknown): unknown {
    const schema = settingSchemas[key] ?? z.unknown()
    return schema.parse(value)
  }
}
