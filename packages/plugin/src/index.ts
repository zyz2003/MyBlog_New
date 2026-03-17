// packages/plugin/src/index.ts
// Plugin System Entry Point
// 插件系统入口文件

// =======================================================
// Core Classes / 核心类
// =======================================================

export { PluginManager } from './PluginManager'
export { HookRegistry } from './HookRegistry'
export { LifecycleEmitter, LifecycleEvent } from './lifecycle/events'

// =======================================================
// Type Definitions / 类型定义
// =======================================================

export type {
  // Plugin interface / 插件接口
  Plugin,
  PluginContext,
  PluginConfig,
  PluginManagerOptions,
  PluginLifecycleEvent,

  // Hook types / 挂载点类型
  HookName,
  HookFn,
  SyncHook,
  AsyncHook,
  Hook,
  HookContextMap,

  // Navigation types / 导航类型
  NavigationContext,
  RouteLocation
} from './types'

// =======================================================
// Re-export lifecycle module / 重新导出生命周期模块
// =======================================================

export * from './lifecycle/events'

// =======================================================
// Default export / 默认导出
// =======================================================

import { PluginManager } from './PluginManager'
export default PluginManager
