// packages/plugin/examples/example-plugin.ts
// 示例插件 - 展示插件系统的基本用法

import type { Plugin, PluginContext } from '../src/types'

/**
 * 示例插件
 * 演示如何使用插件系统的完整功能
 */
const examplePlugin: Plugin = {
  name: 'example-plugin',
  version: '1.0.0',

  /**
   * 插件初始化钩子
   * 在插件注册时调用，可用于初始化状态
   */
  onInit(ctx: PluginContext) {
    console.log('[ExamplePlugin] Initialized with config:', ctx.config)

    // 注册自定义挂载点
    ctx.hooks.register('app:init' as any, (hookCtx) => {
      console.log('[ExamplePlugin] App is initializing...')
      return hookCtx
    }, 'sync')
  },

  /**
   * 应用创建完成钩子
   * 在 Nuxt 应用创建完成后调用
   */
  onAppCreated(ctx: PluginContext) {
    console.log('[ExamplePlugin] App created')

    // 可以在这里访问 app 实例
    console.log('[ExamplePlugin] App instance:', ctx.app)
  },

  /**
   * 应用挂载完成钩子
   * 在应用挂载到 DOM 后调用
   */
  onAppMounted(ctx: PluginContext) {
    console.log('[ExamplePlugin] App mounted')

    // 可以在这里执行需要 DOM 的操作
  },

  /**
   * 导航开始钩子
   * 在路由切换前调用
   */
  onNavigationStart(ctx) {
    console.log('[ExamplePlugin] Navigating from', ctx.from.path, 'to', ctx.to.path)
  },

  /**
   * 导航结束钩子
   * 在路由切换完成后调用
   */
  onNavigationEnd(ctx) {
    console.log('[ExamplePlugin] Navigation completed:', ctx.to.path)
  },

  /**
   * 插件销毁钩子
   * 在插件卸载时调用，用于清理资源
   */
  onDestroy() {
    console.log('[ExamplePlugin] Destroyed')
  }
}

export default examplePlugin
