// packages/plugin/src/HookRegistry.ts
// Type-safe hook registry for plugin mount points

import { HookName, Hook, HookContextMap } from './types'

/**
 * 挂载点注册表
 * 管理所有插件挂载点的注册和执行
 *
 * @example
 * ```typescript
 * const hooks = new HookRegistry()
 *
 * // 注册同步挂载点
 * hooks.register(HookName.APP_INIT, (ctx) => {
 *   console.log('App initialized')
 *   return ctx
 * })
 *
 * // 注册异步挂载点
 * hooks.register(HookName.API_REQUEST, async (ctx) => {
 *   console.log('API request:', ctx.url)
 *   return ctx
 * }, 'async')
 *
 * // 执行挂载点链
 * const result = await hooks.executeSync(HookName.APP_INIT, { app })
 * ```
 */
export class HookRegistry {
  /** 存储所有挂载点的 Map */
  private hooks: Map<HookName, Hook[]> = new Map()

  /**
   * 注册挂载点
   *
   * @param hookName 挂载点名称
   * @param fn 挂载点函数
   * @param type 挂载点类型，默认为 'async'
   *
   * @example
   * ```typescript
   * // 同步挂载点
   * hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
   *
   * // 异步挂载点
   * hooks.register(HookName.API_REQUEST, async (ctx) => ctx, 'async')
   * ```
   */
  register<T extends HookName>(
    hookName: T,
    fn: (ctx: HookContextMap[T]) => HookContextMap[T] | Promise<HookContextMap[T]>,
    type: 'sync' | 'async' = 'async'
  ): void {
    const hook: Hook = type === 'sync'
      ? { type: 'sync', fn: fn as (ctx: any) => any }
      : { type: 'async', fn: fn as (ctx: any) => Promise<any> }

    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }
    this.hooks.get(hookName)!.push(hook)
  }

  /**
   * 执行同步挂载点（串行执行）
   * 按注册顺序依次执行，前一个钩子的返回值作为下一个钩子的输入
   *
   * @param hookName 挂载点名称
   * @param context 上下文参数
   * @returns 处理后的上下文
   *
   * @example
   * ```typescript
   * const result = await hooks.executeSync(HookName.APP_INIT, { app })
   * ```
   */
  async executeSync<T extends HookName>(
    hookName: T,
    context: HookContextMap[T]
  ): Promise<HookContextMap[T]> {
    const hooks = this.hooks.get(hookName) || []
    let ctx = context

    for (const hook of hooks) {
      if (hook.type === 'sync') {
        ctx = hook.fn(ctx) as HookContextMap[T]
      } else {
        ctx = await hook.fn(ctx) as HookContextMap[T]
      }
    }

    return ctx
  }

  /**
   * 执行异步挂载点（并行执行）
   * 所有钩子并行执行，不保证执行顺序
   * 适用于不需要修改上下文的场景，如日志记录、通知等
   *
   * @param hookName 挂载点名称
   * @param context 上下文参数
   *
   * @example
   * ```typescript
   * await hooks.executeParallel(HookName.API_REQUEST, { url: '/api/data', options: {} })
   * ```
   */
  async executeParallel<T extends HookName>(
    hookName: T,
    context: HookContextMap[T]
  ): Promise<void> {
    const hooks = this.hooks.get(hookName) || []
    const promises = hooks.map(hook => hook.fn(context))
    await Promise.all(promises)
  }

  /**
   * 获取指定挂载点的钩子数量
   *
   * @param hookName 挂载点名称
   * @returns 钩子数量
   *
   * @example
   * ```typescript
   * const count = hooks.getCount(HookName.APP_INIT)
   * ```
   */
  getCount(hookName: HookName): number {
    return (this.hooks.get(hookName) || []).length
  }

  /**
   * 清空所有挂载点
   * 用于测试或重新初始化场景
   *
   * @example
   * ```typescript
   * hooks.clear()
   * ```
   */
  clear(): void {
    this.hooks.clear()
  }

  /**
   * 获取所有挂载点名称列表
   *
   * @returns 挂载点名称数组
   */
  getRegisteredHooks(): HookName[] {
    return Array.from(this.hooks.keys())
  }

  /**
   * 移除指定挂载点的所有钩子
   *
   * @param hookName 挂载点名称
   */
  clearHook(hookName: HookName): void {
    this.hooks.delete(hookName)
  }
}
