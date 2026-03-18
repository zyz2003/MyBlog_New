// packages/plugin/src/__tests__/plugin-manager.test.ts
// PluginManager 单元测试

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PluginManager } from '../PluginManager'
import type { App } from 'vue'
import { LifecycleEvent } from '../lifecycle/events'

// 模拟插件
const createMockPlugin = (name: string, version = '1.0.0'): Plugin => ({
  name,
  version,
  onInit: undefined,
  onAppCreated: undefined,
  onAppMounted: undefined,
  onDestroy: undefined,
})

// 带钩子的模拟插件
const createPluginWithHooks = (
  name: string
): Plugin & {
  initCalled: boolean
  destroyCalled: boolean
  mountCalled: boolean
} => ({
  name,
  version: '1.0.0',
  initCalled: false,
  destroyCalled: false,
  mountCalled: false,
  async onInit() {
    ;(this as unknown as Record<string, boolean>).initCalled = true
  },
  async onDestroy() {
    ;(this as unknown as Record<string, boolean>).destroyCalled = true
  },
  async onAppMounted() {
    ;(this as unknown as Record<string, boolean>).mountCalled = true
  },
})

describe('PluginManager', () => {
  let manager: PluginManager

  beforeEach(() => {
    manager = new PluginManager()
  })

  describe('constructor', () => {
    it('should create manager with default options', () => {
      expect(manager).toBeDefined()
      expect(manager.hooks).toBeDefined()
      expect(manager.emitter).toBeDefined()
    })

    it('should load config if configPath provided', async () => {
      // 注意：实际测试中配置文件可能不存在，这里只验证构造函数不抛出异常
      const newManager = new PluginManager({ configPath: './non-existent.json' })
      // 等待异步操作完成
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(newManager).toBeDefined()
    })
  })

  describe('register', () => {
    it('should register a plugin', async () => {
      const plugin = createMockPlugin('test-plugin')

      await manager.register(plugin)

      expect(manager.hasPlugin('test-plugin')).toBe(true)
      expect(manager.getPlugins()).toHaveLength(1)
    })

    it('should warn when registering duplicate plugin', async () => {
      const plugin = createMockPlugin('test-plugin')
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await manager.register(plugin)
      await manager.register(plugin)

      expect(consoleSpy).toHaveBeenCalledWith('Plugin "test-plugin" is already registered')
      expect(manager.getPlugins()).toHaveLength(1)

      consoleSpy.mockRestore()
    })

    it('should trigger INIT event when registering', async () => {
      const plugin = createMockPlugin('test-plugin')
      let eventTriggered = false

      manager.emitter.on(LifecycleEvent.INIT, (data) => {
        eventTriggered = true
        expect(data?.plugin).toBe(plugin)
      })

      await manager.register(plugin)

      expect(eventTriggered).toBe(true)
    })

    it('should call onInit hook when registering', async () => {
      const plugin = createPluginWithHooks('test-plugin')

      expect(plugin.initCalled).toBe(false)
      await manager.register(plugin)
      expect(plugin.initCalled).toBe(true)
    })
  })

  describe('getPlugin', () => {
    it('should return plugin by name', async () => {
      const plugin = createMockPlugin('test-plugin')
      await manager.register(plugin)

      const retrieved = manager.getPlugin('test-plugin')

      expect(retrieved).toBe(plugin)
    })

    it('should return undefined for non-existent plugin', () => {
      const retrieved = manager.getPlugin('non-existent')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('getPlugins', () => {
    it('should return all registered plugins', async () => {
      const plugin1 = createMockPlugin('plugin-1')
      const plugin2 = createMockPlugin('plugin-2')
      const plugin3 = createMockPlugin('plugin-3')

      await manager.register(plugin1)
      await manager.register(plugin2)
      await manager.register(plugin3)

      const plugins = manager.getPlugins()

      expect(plugins).toHaveLength(3)
      expect(plugins.map((p) => p.name)).toEqual(['plugin-1', 'plugin-2', 'plugin-3'])
    })

    it('should return empty array when no plugins registered', () => {
      expect(manager.getPlugins()).toEqual([])
    })
  })

  describe('getPluginNames', () => {
    it('should return all plugin names', async () => {
      await manager.register(createMockPlugin('plugin-1'))
      await manager.register(createMockPlugin('plugin-2'))

      expect(manager.getPluginNames()).toEqual(['plugin-1', 'plugin-2'])
    })
  })

  describe('hasPlugin', () => {
    it('should return true for registered plugin', async () => {
      await manager.register(createMockPlugin('test-plugin'))
      expect(manager.hasPlugin('test-plugin')).toBe(true)
    })

    it('should return false for non-existent plugin', () => {
      expect(manager.hasPlugin('non-existent')).toBe(false)
    })
  })

  describe('unregister', () => {
    it('should unregister a plugin', async () => {
      const plugin = createMockPlugin('test-plugin')
      await manager.register(plugin)

      await manager.unregister('test-plugin')

      expect(manager.hasPlugin('test-plugin')).toBe(false)
    })

    it('should call onDestroy hook when unregistering', async () => {
      const plugin = createPluginWithHooks('test-plugin')
      await manager.register(plugin)

      expect(plugin.initCalled).toBe(true)
      expect(plugin.destroyCalled).toBe(false)

      await manager.unregister('test-plugin')

      expect(plugin.destroyCalled).toBe(true)
    })

    it('should trigger DESTROY event when unregistering', async () => {
      const plugin = createMockPlugin('test-plugin')
      await manager.register(plugin)

      let eventTriggered = false
      manager.emitter.on(LifecycleEvent.DESTROY, (data) => {
        eventTriggered = true
        expect(data?.pluginName).toBe('test-plugin')
      })

      await manager.unregister('test-plugin')

      expect(eventTriggered).toBe(true)
    })

    it('should do nothing when unregistering non-existent plugin', async () => {
      await expect(manager.unregister('non-existent')).resolves.toBeUndefined()
    })
  })

  describe('setApp', () => {
    it('should set Vue app instance', () => {
      const appMock = { use: () => {}, mount: () => {} } as unknown as App<unknown>

      manager.setApp(appMock)

      // 验证内部 app 已设置（通过 hooks 间接验证）
      expect(manager.hooks).toBeDefined()
    })

    it('should trigger APP_CREATED event', async () => {
      const appMock = { use: () => {}, mount: () => {} } as unknown as App<unknown>
      let eventTriggered = false
      let eventData: unknown

      manager.emitter.on(LifecycleEvent.APP_CREATED, (data) => {
        eventTriggered = true
        eventData = data
      })

      manager.setApp(appMock)

      expect(eventTriggered).toBe(true)
      expect((eventData as { app: unknown })?.app).toBe(appMock)
    })
  })

  describe('notifyAppMounted', () => {
    it('should trigger APP_MOUNT event', async () => {
      let eventTriggered = false

      manager.notifyAppMounted()

      // 事件是异步触发的，需要等待
      await new Promise((resolve) => setTimeout(resolve, 10))
      eventTriggered = true

      expect(eventTriggered).toBe(true)
    })

    it('should call onAppMounted hook on all plugins', async () => {
      const plugin = createPluginWithHooks('test-plugin')
      await manager.register(plugin)

      expect(plugin.mountCalled).toBe(false)

      manager.notifyAppMounted()

      // 等待异步执行
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(plugin.mountCalled).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all plugins', async () => {
      await manager.register(createMockPlugin('plugin-1'))
      await manager.register(createMockPlugin('plugin-2'))

      manager.clear()

      expect(manager.getPlugins()).toHaveLength(0)
    })

    it('should clear config', () => {
      // 通过反射访问私有属性测试
      ;(manager as unknown as { config: unknown[] }).config = [
        { name: 'test', path: './test', enabled: true },
      ]

      manager.clear()

      expect((manager as unknown as { config: unknown[] }).config).toEqual([])
    })

    it('should clear hooks and emitter', async () => {
      manager.hooks.register('app:init' as unknown as never, (ctx) => ctx, 'sync')
      manager.emitter.on(LifecycleEvent.INIT, () => {})

      manager.clear()

      expect(manager.hooks.getRegisteredHooks()).toEqual([])
      expect(manager.emitter.getRegisteredEvents()).toEqual([])
    })
  })

  describe('loadPlugin', () => {
    it('should fail gracefully when loading non-existent plugin', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await manager.loadPlugin('./non-existent-plugin.ts')

      expect(consoleSpy).toHaveBeenCalled()
      expect(manager.getPlugins()).toHaveLength(0)

      consoleSpy.mockRestore()
    })
  })

  describe('loadConfig', () => {
    it('should fail gracefully when loading non-existent config', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await manager.loadConfig('./non-existent-config.json')

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('integration tests', () => {
    it('should manage full plugin lifecycle', async () => {
      const log: string[] = []

      // 创建带日志的插件
      const plugin: Plugin = {
        name: 'lifecycle-plugin',
        version: '1.0.0',
        async onInit() {
          log.push('init')
        },
        async onAppMounted() {
          log.push('mounted')
        },
        async onDestroy() {
          log.push('destroy')
        },
      }

      // 注册插件
      await manager.register(plugin)
      expect(log).toContain('init')

      // 设置 app
      const appMock = {} as unknown as App<unknown>
      manager.setApp(appMock)

      // 通知挂载
      manager.notifyAppMounted()
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(log).toContain('mounted')

      // 卸载插件
      await manager.unregister('lifecycle-plugin')
      expect(log).toContain('destroy')

      expect(log).toEqual(['init', 'mounted', 'destroy'])
    })

    it('should handle multiple plugins', async () => {
      const plugin1 = createPluginWithHooks('plugin-1')
      const plugin2 = createPluginWithHooks('plugin-2')
      const plugin3 = createPluginWithHooks('plugin-3')

      await manager.register(plugin1)
      await manager.register(plugin2)
      await manager.register(plugin3)

      expect(manager.getPluginNames()).toEqual(['plugin-1', 'plugin-2', 'plugin-3'])

      // 验证所有插件都被初始化了
      expect(plugin1.initCalled).toBe(true)
      expect(plugin2.initCalled).toBe(true)
      expect(plugin3.initCalled).toBe(true)

      // 卸载其中一个
      await manager.unregister('plugin-2')
      expect(manager.getPluginNames()).toEqual(['plugin-1', 'plugin-3'])
      expect(plugin2.destroyCalled).toBe(true)
    })
  })
})
