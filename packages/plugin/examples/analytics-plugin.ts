// packages/plugin/examples/analytics-plugin.ts
// 分析插件示例 - 展示如何集成第三方分析服务

import type { Plugin, PluginContext, NavigationContext } from '../src/types'

export interface AnalyticsPluginConfig {
  trackingId: string
  anonymizeIp: boolean
  debug?: boolean
}

/**
 * 分析插件
 * 用于集成 Google Analytics 或其他分析服务
 */
const analyticsPlugin: Plugin = {
  name: 'analytics-plugin',
  version: '1.0.0',

  privateConfig: {} as AnalyticsPluginConfig,

  onInit(ctx: PluginContext) {
    this.privateConfig = ctx.config as AnalyticsPluginConfig
    console.log('[AnalyticsPlugin] Initialized with tracking ID:', this.privateConfig.trackingId)

    // 注册 API 请求监控
    ctx.hooks.register(
      'api:request' as unknown as never,
      (hookCtx) => {
        if (this.privateConfig.debug) {
          console.log('[AnalyticsPlugin] API Request:', (hookCtx as unknown as { url: string }).url)
        }
        return hookCtx
      },
      'sync'
    )
  },

  onAppMounted() {
    console.log('[AnalyticsPlugin] App mounted, starting analytics')
    // 在实际实现中，这里会初始化 Google Analytics SDK
  },

  onNavigationEnd(ctx: NavigationContext) {
    // 发送页面浏览事件
    this.trackPageView(ctx.to.path)
  },

  onDestroy() {
    console.log('[AnalyticsPlugin] Analytics stopped')
  },

  /**
   * 跟踪页面浏览
   */
  trackPageView(this: typeof analyticsPlugin, path: string) {
    if (this.privateConfig.debug) {
      console.log('[AnalyticsPlugin] Tracking page view:', path)
    }
    // 在实际实现中，这里会调用 Google Analytics API
  },
}

export default analyticsPlugin
