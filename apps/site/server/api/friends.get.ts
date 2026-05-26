import { eq } from 'drizzle-orm'
import { systemSettings } from '../db/schema'
import { db } from '../utils/db'

export default defineEventHandler(async () => {
  const [row] = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, 'friendsLinks'))
    .limit(1)

  if (!row?.value || typeof row.value !== 'object') {
    return { code: 200, data: { groups: [] } }
  }

  const config = row.value as Record<string, unknown>
  const groups = Array.isArray(config.groups) ? config.groups : []

  return { code: 200, data: { groups } }
})