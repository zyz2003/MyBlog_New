/**
 * @my-blog/database
 *
 * Database Layer (Drizzle ORM + SQLite)
 *
 * Provides database schema, ORM configuration, and migration tools.
 */

export const VERSION = '0.0.0'

/**
 * Initialize the database layer
 * @returns Database layer instance
 */
export function initDatabase() {
  console.log('[@my-blog/database] Database layer initialized')
  return {
    version: VERSION,
    name: '@my-blog/database',
  }
}
