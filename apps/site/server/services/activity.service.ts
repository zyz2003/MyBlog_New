import { desc, and, eq, isNull } from 'drizzle-orm'
import { db } from '../utils/db'
import { activityLogs } from '../db/schema/activity-logs'

export type ActivityAction = 'create' | 'update' | 'delete' | 'publish'
export type ActivityTargetType = 'article' | 'page' | 'media' | 'category' | 'tag'

export interface ActivityLog {
  id: number
  action: string
  targetType: string
  targetId: number
  targetTitle: string | null
  userId: number
  createdAt: Date
}

export class ActivityService {
  /**
   * Log an activity
   */
  static async log(
    action: ActivityAction,
    targetType: ActivityTargetType,
    targetId: number,
    targetTitle: string,
    userId: number,
  ): Promise<void> {
    await db.insert(activityLogs).values({
      action,
      targetType,
      targetId,
      targetTitle,
      userId,
    })
  }

  /**
   * Get recent activities
   */
  static async getRecent(limit = 20): Promise<ActivityLog[]> {
    const result = await db.select().from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)

    return result as ActivityLog[]
  }
}
