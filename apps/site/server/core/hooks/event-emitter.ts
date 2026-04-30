import type { HookEvent, HookContext, HookHandler } from '../theme/types'

/**
 * Simple event emitter for theme lifecycle hooks
 *
 * Supports on/once/off/dispatch pattern.
 * Handlers are called in registration order.
 * Errors in handlers are caught and logged without stopping other handlers.
 */
export class EventEmitter {
  private handlers = new Map<string, Set<HookHandler>>()

  /**
   * Register a handler for an event
   * @returns Unsubscribe function
   */
  on(event: HookEvent, handler: HookHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)

    // Return unsubscribe function
    return () => this.off(event, handler)
  }

  /**
   * Register a handler that fires once then auto-removes
   * @returns Unsubscribe function
   */
  once(event: HookEvent, handler: HookHandler): () => void {
    const wrappedHandler: HookHandler = (evt, ctx) => {
      this.off(event, wrappedHandler)
      return handler(evt, ctx)
    }
    return this.on(event, wrappedHandler)
  }

  /**
   * Remove a specific handler for an event
   */
  off(event: HookEvent, handler: HookHandler): void {
    const set = this.handlers.get(event)
    if (set) {
      set.delete(handler)
      if (set.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  /**
   * Dispatch an event to all registered handlers
   * Handlers are called in registration order, each awaited.
   * Errors are caught and logged without stopping other handlers.
   */
  async dispatch(event: HookEvent, context: HookContext): Promise<void> {
    const set = this.handlers.get(event)
    if (!set || set.size === 0) return

    for (const handler of Array.from(set)) {
      try {
        await handler(event, context)
      }
      catch (error) {
        console.error(`[EventEmitter] Handler error for "${event}":`, error)
      }
    }
  }

  /**
   * Remove all handlers (for testing/reset)
   */
  clear(): void {
    this.handlers.clear()
  }
}

/** Singleton hook emitter instance */
export const hookEmitter = new EventEmitter()
