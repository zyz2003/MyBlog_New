/**
 * 数据库核心模块
 * 使用 Drizzle ORM + SQLite
 */

import { drizzle, type SqliteDatabase } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { type RelationalSchema, type Relations } from 'drizzle-orm';

/**
 * 数据库配置
 */
export interface DatabaseConfig {
  /** 数据库文件路径 */
  path: string;
  /** 是否启用 WAL 模式 */
  walMode?: boolean;
  /** 是否启用外键 */
  foreignKeys?: boolean;
}

/**
 * 创建数据库连接
 */
export function createDatabase(config: DatabaseConfig): SqliteDatabase<RelationalSchema, string> {
  const sqlite = new Database(config.path);

  // 启用外键
  if (config.foreignKeys !== false) {
    sqlite.pragma('foreign_keys = ON');
  }

  // 启用 WAL 模式以获得更好的并发性能
  if (config.walMode !== false) {
    sqlite.pragma('journal_mode = WAL');
  }

  return drizzle(sqlite);
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(db: SqliteDatabase<RelationalSchema, string>): void {
  const client = (db as any).client as Database;
  if (client) {
    client.close();
  }
}

/**
 * 运行数据库迁移
 */
export function runMigrations(
  db: SqliteDatabase<RelationalSchema, string>,
  migrations: Array<{ id: string; sql: string }>
): void {
  // 创建迁移记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      executed_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 获取已执行的迁移
  const executedStmt = db.prepare('SELECT id FROM _migrations');
  const executed = new Set((executedStmt.all() as Array<{ id: string }>).map(m => m.id));

  // 执行未执行的迁移
  for (const migration of migrations) {
    if (!executed.has(migration.id)) {
      console.log(`Running migration: ${migration.id}`);
      db.run(migration.sql);
      db.run('INSERT INTO _migrations (id) VALUES (?)', [migration.id]);
    }
  }
}

/**
 * 数据库备份
 */
export function backupDatabase(
  sourcePath: string,
  destPath: string
): void {
  const source = new Database(sourcePath);
  const dest = new Database(destPath);

  source.backup(dest);

  source.close();
  dest.close();
}

// 重新导出 Drizzle ORM 的核心类型和函数
export * from 'drizzle-orm';
export { sqliteTable, text, integer, real, blob, index, uniqueIndex, primaryKey, foreignKey, relations } from 'drizzle-orm/sqlite-core';
