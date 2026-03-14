/**
 * 数据库核心模块 - MySQL 版本
 * 使用 Drizzle ORM + MySQL
 */

import { drizzle, type MySqlDatabase } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { type RelationalSchema, type Relations } from 'drizzle-orm';

/**
 * 数据库配置
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
}

/**
 * 创建数据库连接池
 */
export function createDatabase(config: DatabaseConfig) {
  const pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: config.connectionLimit || 10,
    queueLimit: 0,
  });

  return drizzle(pool);
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(pool: mysql.Pool): Promise<void> {
  await pool.end();
}

/**
 * 数据库备份 - MySQL 版本使用 mysqldump
 * 注意：这需要系统安装 mysqldump 命令
 */
export async function backupDatabase(
  config: DatabaseConfig,
  destPath: string
): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const cmd = `mysqldump -h ${config.host} -P ${config.port} -u ${config.user} -p${config.password} ${config.database} > ${destPath}`;

  try {
    await execAsync(cmd);
  } catch (error) {
    throw new Error(`备份失败：${error}`);
  }
}

// 重新导出 Drizzle ORM 的核心类型和函数
export * from 'drizzle-orm';
