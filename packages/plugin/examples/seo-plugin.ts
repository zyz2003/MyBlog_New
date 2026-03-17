// packages/plugin/examples/seo-plugin.ts
// SEO 插件示例 - 展示如何处理 SEO 相关的功能

import type { Plugin, PluginContext } from '../src/types'

export interface SeoPluginConfig {
  siteName: string
  defaultTitle: string
  defaultDescription: string
  twitterHandle?: string
}

/**
 * SEO 插件
 * 用于管理页面的 SEO 元数据
 */
const seoPlugin: Plugin = {
  name: 'seo-plugin',
  version: '1.0.0',

  privateConfig: {} as SeoPluginConfig,

  onInit(ctx: PluginContext) {
    // 保存配置
    this.privateConfig = ctx.config as SeoPluginConfig

    console.log('[SeoPlugin] Initialized for site:', this.privateConfig.siteName)

    // 注册 SEO 相关的挂载点
    ctx.hooks.register('page:render' as any, (hookCtx) => {
      console.log('[SeoPlugin] Rendering page with SEO metadata')
      return hookCtx
    }, 'async')
  },

  onNavigationEnd(ctx) {
    // 导航结束后更新 SEO 信息
    console.log('[SeoPlugin] Page navigated to:', ctx.to.path)

    // 在实际实现中，这里会更新 document.title 和 meta 标签
    const title = `${ctx.to.meta.title || this.privateConfig.defaultTitle} - ${this.privateConfig.siteName}`
    console.log('[SeoPlugin] Setting title:', title)
  },

  onDestroy() {
    console.log('[SeoPlugin] Cleanup complete')
  }
}

export default seoPlugin
