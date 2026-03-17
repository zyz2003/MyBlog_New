// packages/plugin/src/__tests__/hook-registry.test.ts
// HookRegistry 单元测试

import { describe, it, expect, beforeEach } from 'vitest'
import { HookRegistry } from '../HookRegistry'
import { HookName } from '../types'

describe('HookRegistry', () => {
  let hooks: HookRegistry

  beforeEach(() => {
    hooks = new HookRegistry()
  })

  describe('register', () => {
    it('should register a sync hook', () => {
      const hookFn = (ctx: { value: number }) => ({ value: ctx.value + 1 })

      hooks.register(HookName.APP_INIT, hookFn, 'sync')

      expect(hooks.getCount(HookName.APP_INIT)).toBe(1)
    })

    it('should register an async hook', () => {
      const hookFn = async (ctx: { value: number }) => ({ value: ctx.value + 1 })

      hooks.register(HookName.APP_INIT, hookFn, 'async')

      expect(hooks.getCount(HookName.APP_INIT)).toBe(1)
    })

    it('should register multiple hooks for the same hook name', () => {
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_INIT, async (ctx) => ctx, 'async')

      expect(hooks.getCount(HookName.APP_INIT)).toBe(3)
    })

    it('should register different hook names', () => {
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_MOUNTED, (ctx) => ctx, 'sync')
      hooks.register(HookName.THEME_CHANGE, (ctx) => ctx, 'sync')

      expect(hooks.getCount(HookName.APP_INIT)).toBe(1)
      expect(hooks.getCount(HookName.APP_MOUNTED)).toBe(1)
      expect(hooks.getCount(HookName.THEME_CHANGE)).toBe(1)
    })
  })

  describe('executeSync', () => {
    it('should execute sync hooks in order', async () => {
      const executionOrder: number[] = []

      hooks.register(HookName.APP_INIT, (ctx) => {
        executionOrder.push(1)
        return { ...ctx, value: ctx.value + 1 }
      }, 'sync')

      hooks.register(HookName.APP_INIT, (ctx) => {
        executionOrder.push(2)
        return { ...ctx, value: ctx.value * 2 }
      }, 'sync')

      const result = await hooks.executeSync(HookName.APP_INIT, { value: 1 })

      expect(executionOrder).toEqual([1, 2])
      expect(result.value).toBe(4) // (1 + 1) * 2 = 4
    })

    it('should execute async hooks in order', async () => {
      const executionOrder: number[] = []

      hooks.register(HookName.APP_INIT, async (ctx) => {
        executionOrder.push(1)
        return { ...ctx, value: ctx.value + 1 }
      }, 'async')

      hooks.register(HookName.APP_INIT, async (ctx) => {
        executionOrder.push(2)
        return { ...ctx, value: ctx.value * 2 }
      }, 'async')

      const result = await hooks.executeSync(HookName.APP_INIT, { value: 1 })

      expect(executionOrder).toEqual([1, 2])
      expect(result.value).toBe(4)
    })

    it('should execute mixed sync and async hooks', async () => {
      hooks.register(HookName.APP_INIT, (ctx) => ({ ...ctx, value: ctx.value + 1 }), 'sync')
      hooks.register(HookName.APP_INIT, async (ctx) => ({ ...ctx, value: ctx.value * 2 }), 'async')

      const result = await hooks.executeSync(HookName.APP_INIT, { value: 1 })

      expect(result.value).toBe(4)
    })

    it('should return original context when no hooks registered', async () => {
      const context = { value: 42 }
      const result = await hooks.executeSync(HookName.APP_INIT, context)

      expect(result).toBe(context)
    })

    it('should handle hook that throws error', async () => {
      hooks.register(HookName.APP_INIT, () => {
        throw new Error('Hook error')
      }, 'sync')

      await expect(hooks.executeSync(HookName.APP_INIT, { value: 1 }))
        .rejects
        .toThrow('Hook error')
    })
  })

  describe('executeParallel', () => {
    it('should execute hooks in parallel', async () => {
      const executionOrder: number[] = []

      hooks.register(HookName.API_REQUEST, async (ctx) => {
        await new Promise(resolve => setTimeout(resolve, 50))
        executionOrder.push(1)
        return ctx
      }, 'async')

      hooks.register(HookName.API_REQUEST, async (ctx) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        executionOrder.push(2)
        return ctx
      }, 'async')

      await hooks.executeParallel(HookName.API_REQUEST, { url: '/api/test', options: {} })

      // Parallel execution means order is not guaranteed
      expect(executionOrder).toContain(1)
      expect(executionOrder).toContain(2)
    })

    it('should execute all hooks even if one fails', async () => {
      const executionOrder: number[] = []

      hooks.register(HookName.API_REQUEST, async () => {
        executionOrder.push(1)
        throw new Error('First hook error')
      }, 'async')

      hooks.register(HookName.API_REQUEST, async (ctx) => {
        executionOrder.push(2)
        return ctx
      }, 'async')

      await expect(hooks.executeParallel(HookName.API_REQUEST, { url: '/api', options: {} }))
        .rejects
        .toThrow()

      // Both hooks should have been attempted
      expect(executionOrder).toContain(2)
    })

    it('should do nothing when no hooks registered', async () => {
      await expect(
        hooks.executeParallel(HookName.API_REQUEST, { url: '/api', options: {} })
      ).resolves.toBeUndefined()
    })
  })

  describe('getCount', () => {
    it('should return 0 for unregistered hook', () => {
      expect(hooks.getCount(HookName.APP_INIT)).toBe(0)
    })

    it('should return correct count for registered hooks', () => {
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'async')

      expect(hooks.getCount(HookName.APP_INIT)).toBe(3)
    })
  })

  describe('clear', () => {
    it('should remove all hooks', () => {
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_MOUNTED, (ctx) => ctx, 'sync')

      hooks.clear()

      expect(hooks.getCount(HookName.APP_INIT)).toBe(0)
      expect(hooks.getCount(HookName.APP_MOUNTED)).toBe(0)
    })
  })

  describe('getRegisteredHooks', () => {
    it('should return empty array when no hooks registered', () => {
      expect(hooks.getRegisteredHooks()).toEqual([])
    })

    it('should return all registered hook names', () => {
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_MOUNTED, (ctx) => ctx, 'sync')
      hooks.register(HookName.THEME_CHANGE, (ctx) => ctx, 'sync')

      const registered = hooks.getRegisteredHooks()

      expect(registered).toHaveLength(3)
      expect(registered).toContain(HookName.APP_INIT)
      expect(registered).toContain(HookName.APP_MOUNTED)
      expect(registered).toContain(HookName.THEME_CHANGE)
    })
  })

  describe('clearHook', () => {
    it('should remove hooks for specific hook name', () => {
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_INIT, (ctx) => ctx, 'sync')
      hooks.register(HookName.APP_MOUNTED, (ctx) => ctx, 'sync')

      hooks.clearHook(HookName.APP_INIT)

      expect(hooks.getCount(HookName.APP_INIT)).toBe(0)
      expect(hooks.getCount(HookName.APP_MOUNTED)).toBe(1)
    })

    it('should do nothing for non-existent hook', () => {
      expect(() => hooks.clearHook(HookName.APP_INIT)).not.toThrow()
    })
  })

  describe('type safety', () => {
    it('should accept correct context type for APP_INIT hook', async () => {
      const appMock = { use: () => {}, mount: () => {} } as any

      hooks.register(HookName.APP_INIT, (ctx) => {
        expect(ctx.app).toBeDefined()
        return ctx
      }, 'sync')

      await hooks.executeSync(HookName.APP_INIT, { app: appMock })
    })

    it('should accept correct context type for ROUTER_BEFORE_EACH hook', async () => {
      const toRoute = { path: '/about', params: {}, query: {}, hash: '', fullPath: '/about', meta: {} }
      const fromRoute = { path: '/', params: {}, query: {}, hash: '', fullPath: '/', meta: {} }

      hooks.register(HookName.ROUTER_BEFORE_EACH, (ctx) => {
        expect(ctx.to).toBeDefined()
        expect(ctx.from).toBeDefined()
        expect(typeof ctx.next).toBe('function')
        return ctx
      }, 'sync')

      await hooks.executeSync(HookName.ROUTER_BEFORE_EACH, {
        to: toRoute,
        from: fromRoute,
        next: () => {}
      })
    })

    it('should accept correct context type for API_REQUEST hook', async () => {
      hooks.register(HookName.API_REQUEST, (ctx) => {
        expect(typeof ctx.url).toBe('string')
        expect(ctx.options).toBeDefined()
        return ctx
      }, 'sync')

      await hooks.executeSync(HookName.API_REQUEST, {
        url: '/api/data',
        options: { method: 'GET' }
      })
    })
  })
})
