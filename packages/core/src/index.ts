// @my-blog/core - 核心模块导出
export * from './plugin-adapter';
export * from './database';

/**
 * 版本号
 */
export const VERSION = '0.0.1';

/**
 * 定义插件的辅助函数
 */
export function definePlugin<T extends Record<string, any>>(plugin: T): T {
  return plugin;
}

/**
 * 定义数据库 Schema 的辅助函数
 */
export function defineSchema<T extends Record<string, any>>(schema: T): T {
  return schema;
}
