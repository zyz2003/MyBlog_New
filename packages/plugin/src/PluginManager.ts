// packages/plugin/src/PluginManager.ts
// Core plugin manager implementation

import type { App } from 'vue'
import type {
  Plugin,
  PluginContext,
  PluginConfig,
  PluginManagerOptions,
  RouteLocation,
} from './types'
import { HookRegistry } from './HookRegistry'
import { LifecycleEmitter, LifecycleEvent } from './lifecycle/events'

/**
 * 插件管理器
 * 负责插件的加载、注册、生命周期管理和执行
 *
 * @example
 * ```typescript
 * const manager = new PluginManager({
 *   configPath: './plugins.config.json',
 *   autoScan: true
 * })
 *
 * // 注册插件
 * manager.register(myPlugin)
 *
 * // 加载插件
 * await manager.loadPlugin('./plugins/example.ts')
 *
 * // 获取插件
 * const plugin = manager.getPlugin('example-plugin')
 * ```
 */
export class PluginManager {
  /** 已注册的插件 Map */
  private plugins: Map<string, Plugin> = new Map()

  /** 挂载点注册表 */
  private _hooks: HookRegistry

  /** 生命周期事件发射器 */
  private _emitter: LifecycleEmitter

  /** 插件配置列表 */
  private config: PluginConfig[] = []

  /** Vue 应用实例 */
  private appInstance: App<unknown> | null = null

  /**
   * 创建插件管理器
   *
   * @param options 管理器配置选项
   */
  constructor(options: PluginManagerOptions = {}) {
    this._hooks = new HookRegistry()
    this._emitter = new LifecycleEmitter()

    if (options.configPath) {
      this.loadConfig(options.configPath)
    }
  }

  /**
   * 加载插件配置文件
   * 从指定路径导入配置并触发 REGISTER 事件
   *
   * @param configPath 配置文件路径
   *
   * @example
   * ```typescript
   * await manager.loadConfig('./plugins.config.json')
   * ```
   */
  async loadConfig(configPath: string): Promise<void> {
    try {
      // 支持 JSON 和 TS/JS 配置文件
      const config = await import(configPath)
      this.config = config.plugins || config.default?.plugins || []

      await this._emitter.emit(LifecycleEvent.REGISTER, { plugins: this.config })
    } catch (error) {
      console.warn(`Failed to load config from ${configPath}:`, error)
    }
  }

  /**
   * 注册插件
   * 将插件添加到注册表并触发 INIT 事件
   *
   * @param plugin 插件实例
   *
   * @example
   * ```typescript
   * manager.register({
   *   name: 'example-plugin',
   *   version: '1.0.0',
   *   onInit: (ctx) => { console.log('Initialized') }
   * })
   * ```
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered`)
      return
    }
    this.plugins.set(plugin.name, plugin)

    // 触发插件的 onInit 钩子
    if (plugin.onInit) {
      const ctx: PluginContext = {
        app: this.getApp(),
        config: this.getPluginConfig(plugin.name),
        hooks: this._hooks,
      }
      await plugin.onInit(ctx)
    }

    // 触发初始化事件
    await this._emitter.emit(LifecycleEvent.INIT, { plugin })
  }

  /**
   * 加载并注册插件
   * 从指定路径导入插件模块，注册并触发初始化钩子
   *
   * @param pluginPath 插件文件路径
   *
   * @example
   * ```typescript
   * await manager.loadPlugin('./plugins/example-plugin.ts')
   * ```
   */
  async loadPlugin(pluginPath: string): Promise<void> {
    try {
      const module = await import(pluginPath)
      const plugin: Plugin = module.default || module
      this.register(plugin)

      // 触发插件的 onInit 钩子
      if (plugin.onInit) {
        const ctx: PluginContext = {
          app: this.getApp(),
          config: this.getPluginConfig(plugin.name),
          hooks: this._hooks,
        }
        await plugin.onInit(ctx)
      }
    } catch (error) {
      console.error(`Failed to load plugin from ${pluginPath}:`, error)
    }
  }

  /**
   * 卸载插件
   * 触发插件的 onDestroy 钩子并从注册表中移除
   *
   * @param pluginName 插件名称
   *
   * @example
   * ```typescript
   * await manager.unregister('example-plugin')
   * ```
   */
  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      // 触发销毁钩子
      if (plugin.onDestroy) {
        await plugin.onDestroy()
      }

      // 触发销毁事件
      await this._emitter.emit(LifecycleEvent.DESTROY, { pluginName })

      this.plugins.delete(pluginName)
    }
  }

  /**
   * 获取插件实例
   *
   * @param name 插件名称
   * @returns 插件实例或 undefined
   *
   * @example
   * ```typescript
   * const plugin = manager.getPlugin('example-plugin')
   * ```
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有已注册的插件
   *
   * @returns 插件数组
   *
   * @example
   * ```typescript
   * const plugins = manager.getPlugins()
   * ```
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取已注册插件名称列表
   *
   * @returns 插件名称数组
   */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys())
  }

  /**
   * 检查插件是否已注册
   *
   * @param name 插件名称
   * @returns 是否已注册
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 获取挂载点注册表
   */
  get hooks(): HookRegistry {
    return this._hooks
  }

  /**
   * 获取生命周期事件发射器
   */
  get emitter(): LifecycleEmitter {
    return this._emitter
  }

  /**
   * 设置 Vue 应用实例
   *
   * @param app Vue 应用实例
   *
   * @example
   * ```typescript
   * manager.setApp(app)
   * ```
   */
  setApp(app: App<unknown>): void {
    this.appInstance = app

    // 触发应用创建事件
    this._emitter.emit(LifecycleEvent.APP_CREATED, { app })
  }

  /**
   * 获取 Vue 应用实例
   *
   * @private
   * @returns Vue 应用实例
   */
  private getApp(): App<unknown> {
    if (!this.appInstance) {
      // 返回一个模拟的 app 实例用于早期初始化
      return {
        use: () => this,
        mount: () => this,
        unmount: () => {},
        provide: () => this,
        component: () => this,
        directive: () => this,
        mixin: () => this,
        compile: () => this,
        version: '3.x',
      } as unknown as App<unknown>
    }
    return this.appInstance
  }

  /**
   * 获取插件配置
   *
   * @private
   * @param pluginName 插件名称
   * @returns 插件配置对象
   */
  private getPluginConfig(pluginName: string): Record<string, unknown> {
    const config = this.config.find((p) => p.name === pluginName)
    return config?.config || {}
  }

  /**
   * 应用已挂载
   * 通知所有插件应用已完成挂载
   *
   * @param el 挂载的目标元素
   */
  notifyAppMounted(el?: Element): void {
    this._emitter.emit(LifecycleEvent.APP_MOUNT, {
      app: this.getApp(),
      el,
    })

    // 调用所有插件的 onAppMounted 钩子
    this.plugins.forEach(async (plugin) => {
      if (plugin.onAppMounted) {
        const ctx: PluginContext = {
          app: this.getApp(),
          config: this.getPluginConfig(plugin.name),
          hooks: this._hooks,
        }
        await plugin.onAppMounted(ctx)
      }
    })
  }

  /**
   * 触发导航开始事件
   *
   * @param to 目标路由
   * @param from 源路由
   * @param next 继续导航函数
   */
  async notifyNavigationStart(
    to: RouteLocation,
    from: RouteLocation,
    next: () => void
  ): Promise<void> {
    await this._emitter.emit(LifecycleEvent.NAVIGATION_START, { to, from, next })

    // 调用所有插件的 onNavigationStart 钩子
    for (const plugin of this.plugins.values()) {
      if (plugin.onNavigationStart) {
        await plugin.onNavigationStart({ to, from, next })
      }
    }
  }

  /**
   * 触发导航结束事件
   *
   * @param to 目标路由
   * @param from 源路由
   */
  async notifyNavigationEnd(to: RouteLocation, from: RouteLocation): Promise<void> {
    await this._emitter.emit(LifecycleEvent.NAVIGATION_END, { to, from })

    // 调用所有插件的 onNavigationEnd 钩子
    for (const plugin of this.plugins.values()) {
      if (plugin.onNavigationEnd) {
        await plugin.onNavigationEnd({ to, from, next: () => {} })
      }
    }
  }

  /**
   * 清空所有插件和注册表
   * 用于测试或重新初始化
   */
  clear(): void {
    this.plugins.clear()
    this.config = []
    this.appInstance = null
    this._hooks.clear()
    this._emitter.clear()
  }
}
