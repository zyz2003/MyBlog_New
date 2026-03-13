/**
 * 数据库连接单例
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@my-blog/core/schema';

const dbPath = process.env.DATABASE_PATH || './data/blog.db';

// 确保数据目录存在
import { mkdirSync, existsSync } from 'fs';
const dir = dbPath.substring(0, dbPath.lastIndexOf('/'));
if (dir && !existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

// 创建数据库连接
const sqlite = new Database(dbPath);

// 启用外键
sqlite.pragma('foreign_keys = ON');

// 创建 drizzle 实例
export const db = drizzle(sqlite, { schema });

// 导出 schema 方便使用
export * from '@my-blog/core/schema';
