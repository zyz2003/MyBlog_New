// packages/plugin/src/lifecycle/events.ts
// Lifecycle event definitions and emitter

import { PluginLifecycleEvent } from '../types'

/**
 * 生命周期事件枚举
 * 导出自 types.ts，在此重新导出方便使用
 */
export { PluginLifecycleEvent as LifecycleEvent } from '../types'

/**
 * 生命周期回调函数类型
 */
export type LifecycleCallback = (data?: any) => void | Promise<void>

/**
 * 生命周期事件发射器
 * 用于管理和触发插件生命周期事件
 *
 * @example
 * ```typescript
 * const emitter = new LifecycleEmitter()
 *
 * // 注册事件监听器
 * emitter.on(LifecycleEvent.INIT, (data) => {
 *   console.log('Plugin initialized:', data)
 * })
 *
 * // 触发事件
 * await emitter.emit(LifecycleEvent.INIT, { pluginName: 'example' })
 *
 * // 移除监听器
 * emitter.off(LifecycleEvent.INIT, callback)
 * ```
 */
export class LifecycleEmitter {
  /** 存储所有事件监听器的 Map */
  private listeners: Map<PluginLifecycleEvent, LifecycleCallback[]> = new Map()

  /**
   * 注册事件监听器
   *
   * @param event 生命周期事件
   * @param callback 回调函数
   *
   * @example
   * ```typescript
   * emitter.on(LifecycleEvent.APP_CREATED, (data) => {
   *   console.log('App created:', data)
   * })
   * ```
   */
  on(event: PluginLifecycleEvent, callback: LifecycleCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**
   * 触发事件
   * 按注册顺序依次执行所有监听器，支持异步回调
   *
   * @param event 生命周期事件
   * @param data 事件数据
   *
   * @example
   * ```typescript
   * await emitter.emit(LifecycleEvent.APP_CREATED, { app, nuxt })
   * ```
   */
  async emit(event: PluginLifecycleEvent, data?: any): Promise<void> {
    const callbacks = this.listeners.get(event) || []
    for (const callback of callbacks) {
      await callback(data)
    }
  }

  /**
   * 移除事件监听器
   *
   * @param event 生命周期事件
   * @param callback 要移除的回调函数，如果不传则移除该事件的所有监听器
   *
   * @example
   * ```typescript
   * // 移除特定监听器
   * emitter.off(LifecycleEvent.INIT, callback)
   *
   * // 移除所有监听器
   * emitter.off(LifecycleEvent.INIT)
   * ```
   */
  off(event: PluginLifecycleEvent, callback?: LifecycleCallback): void {
    if (!callback) {
      this.listeners.delete(event)
    } else {
      const callbacks = this.listeners.get(event) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 获取指定事件的监听器数量
   *
   * @param event 生命周期事件
   * @returns 监听器数量
   *
   * @example
   * ```typescript
   * const count = emitter.getListenerCount(LifecycleEvent.INIT)
   * ```
   */
  getListenerCount(event: PluginLifecycleEvent): number {
    return (this.listeners.get(event) || []).length
  }

  /**
   * 清空所有事件监听器
   *
   * @example
   * ```typescript
   * emitter.clear()
   * ```
   */
  clear(): void {
    this.listeners.clear()
  }

  /**
   * 获取所有已注册的事件列表
   *
   * @returns 事件数组
   */
  getRegisteredEvents(): PluginLifecycleEvent[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 移除事件的所有监听器（不删除事件本身）
   *
   * @param event 生命周期事件
   */
  clearEvent(event: PluginLifecycleEvent): void {
    this.listeners.delete(event)
  }
}
