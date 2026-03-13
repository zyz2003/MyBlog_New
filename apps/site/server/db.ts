/**
 * 数据库连接单例
 * 使用 MySQL + Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@my-blog/core/schema';

// 从环境变量获取数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_blog',
};

// 创建数据库连接池
const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 创建 drizzle 实例
export const db = drizzle(pool, { schema, mode: 'default' });

// 导出 schema 方便使用
export * from '@my-blog/core/schema';

// 导出连接池用于关闭
export { pool };

// 关闭数据库连接
export const closeDatabase = async () => {
  await pool.end();
};
