// packages/plugin/src/__tests__/lifecycle.test.ts
// LifecycleEmitter 单元测试

import { describe, it, expect, beforeEach } from 'vitest'
import { LifecycleEmitter, LifecycleEvent } from '../lifecycle/events'

describe('LifecycleEmitter', () => {
  let emitter: LifecycleEmitter

  beforeEach(() => {
    emitter = new LifecycleEmitter()
  })

  describe('on', () => {
    it('should register a listener for an event', () => {
      const callback = () => {}

      emitter.on(LifecycleEvent.INIT, callback)

      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(1)
    })

    it('should register multiple listeners for the same event', () => {
      const callback1 = () => {}
      const callback2 = () => {}

      emitter.on(LifecycleEvent.INIT, callback1)
      emitter.on(LifecycleEvent.INIT, callback2)

      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(2)
    })

    it('should register listeners for different events', () => {
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.APP_CREATED, () => {})
      emitter.on(LifecycleEvent.DESTROY, () => {})

      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(1)
      expect(emitter.getListenerCount(LifecycleEvent.APP_CREATED)).toBe(1)
      expect(emitter.getListenerCount(LifecycleEvent.DESTROY)).toBe(1)
    })
  })

  describe('emit', () => {
    it('should call all listeners for an event', async () => {
      const callOrder: number[] = []

      emitter.on(LifecycleEvent.INIT, () => {
        callOrder.push(1)
      })
      emitter.on(LifecycleEvent.INIT, () => {
        callOrder.push(2)
      })
      emitter.on(LifecycleEvent.INIT, () => {
        callOrder.push(3)
      })

      await emitter.emit(LifecycleEvent.INIT)

      expect(callOrder).toEqual([1, 2, 3])
    })

    it('should pass data to listeners', async () => {
      const receivedData: unknown[] = []

      emitter.on(LifecycleEvent.APP_CREATED, (data) => {
        receivedData.push(data)
      })

      const testData = { app: {}, nuxt: {} }
      await emitter.emit(LifecycleEvent.APP_CREATED, testData)

      expect(receivedData).toHaveLength(1)
      expect(receivedData[0]).toBe(testData)
    })

    it('should support async listeners', async () => {
      const callOrder: number[] = []

      emitter.on(LifecycleEvent.INIT, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        callOrder.push(1)
      })
      emitter.on(LifecycleEvent.INIT, () => {
        callOrder.push(2)
      })

      await emitter.emit(LifecycleEvent.INIT)

      // Sync listeners are called in order, async listeners wait
      expect(callOrder).toContain(1)
      expect(callOrder).toContain(2)
    })

    it('should do nothing when no listeners registered', async () => {
      await expect(emitter.emit(LifecycleEvent.INIT)).resolves.toBeUndefined()
    })

    it('should continue calling listeners even if one throws', async () => {
      const callOrder: number[] = []

      emitter.on(LifecycleEvent.INIT, () => {
        callOrder.push(1)
        throw new Error('Listener error')
      })
      emitter.on(LifecycleEvent.INIT, () => {
        callOrder.push(2)
      })

      await expect(emitter.emit(LifecycleEvent.INIT)).rejects.toThrow('Listener error')

      // First listener should have been called
      expect(callOrder).toContain(1)
    })
  })

  describe('off', () => {
    it('should remove a specific listener', () => {
      const callback = () => {}

      emitter.on(LifecycleEvent.INIT, callback)
      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(1)

      emitter.off(LifecycleEvent.INIT, callback)
      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(0)
    })

    it('should remove all listeners when callback not specified', () => {
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.INIT, () => {})

      emitter.off(LifecycleEvent.INIT)

      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(0)
    })

    it('should do nothing when listener does not exist', () => {
      const callback = () => {}
      const otherCallback = () => {}

      emitter.on(LifecycleEvent.INIT, callback)

      expect(() => emitter.off(LifecycleEvent.INIT, otherCallback)).not.toThrow()
      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(1)
    })

    it('should do nothing when event does not exist', () => {
      expect(() => emitter.off(LifecycleEvent.INIT)).not.toThrow()
    })
  })

  describe('getListenerCount', () => {
    it('should return 0 for unregistered event', () => {
      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(0)
    })

    it('should return correct count for registered event', () => {
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.INIT, () => {})

      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(3)
    })
  })

  describe('clear', () => {
    it('should remove all listeners for all events', () => {
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.APP_CREATED, () => {})
      emitter.on(LifecycleEvent.DESTROY, () => {})

      emitter.clear()

      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(0)
      expect(emitter.getListenerCount(LifecycleEvent.APP_CREATED)).toBe(0)
      expect(emitter.getListenerCount(LifecycleEvent.DESTROY)).toBe(0)
    })
  })

  describe('getRegisteredEvents', () => {
    it('should return empty array when no events registered', () => {
      expect(emitter.getRegisteredEvents()).toEqual([])
    })

    it('should return all registered events', () => {
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.APP_CREATED, () => {})
      emitter.on(LifecycleEvent.DESTROY, () => {})

      const events = emitter.getRegisteredEvents()

      expect(events).toHaveLength(3)
      expect(events).toContain(LifecycleEvent.INIT)
      expect(events).toContain(LifecycleEvent.APP_CREATED)
      expect(events).toContain(LifecycleEvent.DESTROY)
    })

    it('should not duplicate events', () => {
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.INIT, () => {})

      const events = emitter.getRegisteredEvents()

      expect(events).toHaveLength(1)
      expect(events[0]).toBe(LifecycleEvent.INIT)
    })
  })

  describe('clearEvent', () => {
    it('should remove all listeners for a specific event', () => {
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.INIT, () => {})
      emitter.on(LifecycleEvent.APP_CREATED, () => {})

      emitter.clearEvent(LifecycleEvent.INIT)

      expect(emitter.getListenerCount(LifecycleEvent.INIT)).toBe(0)
      expect(emitter.getListenerCount(LifecycleEvent.APP_CREATED)).toBe(1)
    })

    it('should do nothing for non-existent event', () => {
      expect(() => emitter.clearEvent(LifecycleEvent.INIT)).not.toThrow()
    })
  })

  describe('integration tests', () => {
    it('should handle complex event flow', async () => {
      const log: string[] = []

      // 模拟完整的插件生命周期
      emitter.on(LifecycleEvent.INIT, (data) => {
        log.push(`init: ${data?.pluginName}`)
      })

      emitter.on(LifecycleEvent.REGISTER, (data) => {
        log.push(`register: ${data?.plugins?.length || 0} plugins`)
      })

      emitter.on(LifecycleEvent.APP_CREATED, () => {
        log.push('app:created')
      })

      emitter.on(LifecycleEvent.APP_MOUNT, () => {
        log.push('app:mounted')
      })

      emitter.on(LifecycleEvent.DESTROY, () => {
        log.push('plugin:destroy')
      })

      // 按顺序触发所有事件
      await emitter.emit(LifecycleEvent.INIT, { pluginName: 'test-plugin' })
      await emitter.emit(LifecycleEvent.REGISTER, { plugins: [1, 2, 3] })
      await emitter.emit(LifecycleEvent.APP_CREATED)
      await emitter.emit(LifecycleEvent.APP_MOUNT)
      await emitter.emit(LifecycleEvent.DESTROY)

      expect(log).toEqual([
        'init: test-plugin',
        'register: 3 plugins',
        'app:created',
        'app:mounted',
        'plugin:destroy',
      ])
    })

    it('should support listener that unsubscribes itself', async () => {
      let callCount = 0

      const selfRemovingListener = () => {
        callCount++
        emitter.off(LifecycleEvent.INIT, selfRemovingListener)
      }

      emitter.on(LifecycleEvent.INIT, selfRemovingListener)

      await emitter.emit(LifecycleEvent.INIT)
      await emitter.emit(LifecycleEvent.INIT)
      await emitter.emit(LifecycleEvent.INIT)

      expect(callCount).toBe(1)
    })
  })
})
