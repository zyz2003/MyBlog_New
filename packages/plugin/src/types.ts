// packages/plugin/src/types.ts
// Plugin System Type Definitions

import type { App } from 'vue'

/**
 * 插件生命周期事件枚举
 * 定义插件从初始化到销毁的完整生命周期
 */
export enum PluginLifecycleEvent {
  /** 插件初始化 */
  INIT = 'plugin:init',
  /** 插件注册 */
  REGISTER = 'plugin:register',
  /** 应用创建完成 */
  APP_CREATED = 'app:created',
  /** 应用挂载完成 */
  APP_MOUNT = 'app:mounted',
  /** 导航开始 */
  NAVIGATION_START = 'navigation:start',
  /** 导航结束 */
  NAVIGATION_END = 'navigation:end',
  /** 渲染阶段 */
  RENDER = 'render',
  /** 插件销毁 */
  DESTROY = 'plugin:destroy',
}

/**
 * 16 个插件挂载点枚举
 * 覆盖应用初始化、路由、API、主题、存储等核心场景
 */
export enum HookName {
  /** 应用初始化阶段 */
  APP_INIT = 'app:init',
  /** 应用创建完成 */
  APP_CREATED = 'app:created',
  /** 应用挂载完成 */
  APP_MOUNTED = 'app:mounted',
  /** 路由切换前（导航守卫） */
  ROUTER_BEFORE_EACH = 'router:before-each',
  /** 路由切换后 */
  ROUTER_AFTER_EACH = 'router:after-each',
  /** 页面加载开始 */
  PAGE_LOADING_START = 'page:loading:start',
  /** 页面加载结束 */
  PAGE_LOADING_END = 'page:loading:end',
  /** 页面渲染 */
  PAGE_RENDER = 'page:render',
  /** 组件挂载 */
  COMPONENT_MOUNT = 'component:mount',
  /** 组件卸载 */
  COMPONENT_UNMOUNT = 'component:unmount',
  /** API 请求发出 */
  API_REQUEST = 'api:request',
  /** API 响应接收 */
  API_RESPONSE = 'api:response',
  /** API 错误处理 */
  API_ERROR = 'api:error',
  /** 主题切换 */
  THEME_CHANGE = 'theme:change',
  /** 存储设置 */
  STORAGE_SET = 'storage:set',
  /** 存储获取 */
  STORAGE_GET = 'storage:get',
}

// Forward declaration for HookRegistry (defined in HookRegistry.ts)
// This avoids circular dependency
export interface HookRegistry {
  register<T extends HookName>(
    hookName: T,
    fn: (ctx: unknown) => unknown,
    type?: 'sync' | 'async'
  ): void
  executeSync<T extends HookName>(hookName: T, context: unknown): Promise<unknown>
  executeParallel<T extends HookName>(hookName: T, context: unknown): Promise<void>
  getCount(hookName: HookName): number
  clear(): void
}

/**
 * 插件上下文接口
 * 提供给插件访问应用核心功能的接口
 */
export interface PluginContext {
  /** Vue 应用实例 */
  app: App<unknown>
  /** 插件配置 */
  config: Record<string, unknown>
  /** 挂载点注册表 */
  hooks: HookRegistry
}

/**
 * 路由位置接口（简化版，兼容 Vue Router）
 */
export interface RouteLocation {
  path: string
  name?: string | symbol
  params: Record<string, unknown>
  query: Record<string, unknown>
  hash: string
  fullPath: string
  meta: Record<string, unknown>
}

/**
 * 导航上下文
 * 用于导航守卫模式的参数传递
 */
export interface NavigationContext {
  /** 目标路由 */
  to: RouteLocation
  /** 源路由 */
  from: RouteLocation
  /** 继续导航函数 */
  next: () => void
}

/**
 * 挂载点函数类型
 * 通用钩子函数签名
 */
export type HookFn<T = unknown> = (ctx: T) => Promise<T> | T

/**
 * 同步挂载点
 * 同步执行的钩子函数
 */
export interface SyncHook<T = unknown> {
  type: 'sync'
  fn: (ctx: T) => T
}

/**
 * 异步挂载点
 * 异步执行的钩子函数
 */
export interface AsyncHook<T = unknown> {
  type: 'async'
  fn: (ctx: T) => Promise<T>
}

/**
 * 挂载点联合类型
 */
export type Hook = SyncHook | AsyncHook

/**
 * 插件配置接口
 * 用于配置单个插件
 */
export interface PluginConfig {
  /** 插件名称 */
  name: string
  /** 插件路径 */
  path: string
  /** 是否启用 */
  enabled: boolean
  /** 插件特定配置 */
  config?: Record<string, unknown>
}

/**
 * 插件管理器配置接口
 */
export interface PluginManagerOptions {
  /** 配置文件路径 */
  configPath?: string
  /** 是否自动扫描插件 */
  autoScan?: boolean
}

/**
 * 插件接口
 * 所有插件必须实现的基本结构
 */
export interface Plugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 初始化钩子 */
  onInit?(ctx: PluginContext): Promise<void> | void
  /** 应用创建完成钩子 */
  onAppCreated?(ctx: PluginContext): Promise<void> | void
  /** 应用挂载完成钩子 */
  onAppMounted?(ctx: PluginContext): Promise<void> | void
  /** 导航开始钩子 */
  onNavigationStart?(ctx: NavigationContext): Promise<void> | void
  /** 导航结束钩子 */
  onNavigationEnd?(ctx: NavigationContext): Promise<void> | void
  /** 销毁钩子 */
  onDestroy?(): Promise<void> | void
  [key: string]: unknown
}

/**
 * 每个挂载点的上下文类型映射
 * 确保类型安全的挂载点调用
 */
export interface HookContextMap {
  [HookName.APP_INIT]: { app: App<unknown> }
  [HookName.APP_CREATED]: { app: App<unknown>; nuxt: unknown }
  [HookName.APP_MOUNTED]: { app: App<unknown>; el: Element }
  [HookName.ROUTER_BEFORE_EACH]: { to: RouteLocation; from: RouteLocation; next: () => void }
  [HookName.ROUTER_AFTER_EACH]: { to: RouteLocation; from: RouteLocation }
  [HookName.PAGE_LOADING_START]: { url: string }
  [HookName.PAGE_LOADING_END]: { url: string }
  [HookName.PAGE_RENDER]: { html: string }
  [HookName.COMPONENT_MOUNT]: { component: unknown; props: unknown }
  [HookName.COMPONENT_UNMOUNT]: { component: unknown }
  [HookName.API_REQUEST]: { url: string; options: RequestInit }
  [HookName.API_RESPONSE]: { url: string; response: Response }
  [HookName.API_ERROR]: { url: string; error: Error }
  [HookName.THEME_CHANGE]: { theme: string }
  [HookName.STORAGE_SET]: { key: string; value: unknown }
  [HookName.STORAGE_GET]: { key: string }
}
