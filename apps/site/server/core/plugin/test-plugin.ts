import type { PluginAdapter } from './types'

/**
 * Test plugin for verification
 * Shows a floating message at bottom-right corner
 */
export default {
  meta: {
    name: 'test-hello',
    label: '测试插件',
    type: 'custom',
    version: '1.0.0',
    author: 'Blog Team',
    description: '用于验证插件系统的测试插件',
    icon: 'i-heroicons-sparkles',
  },
  configSchema: {
    message: {
      type: 'string',
      label: '消息内容',
      description: '显示的消息文本',
      required: false,
      default: 'Hello from plugin!',
      placeholder: '输入消息内容',
    },
  },
  mountPoints: ['body-end'],
  onMount(container: HTMLElement, config: Record<string, unknown>) {
    const message = (config.message as string) || 'Hello from plugin!'
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;bottom:16px;right:16px;background:#3B82F6;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;cursor:pointer;'
    el.textContent = message
    el.onclick = () => el.remove()
    container.appendChild(el)
  },
} satisfies PluginAdapter
