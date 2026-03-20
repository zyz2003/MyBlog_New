import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'

/**
 * Create a mock H3Event for testing logger middleware
 */
function createMockEvent(method: string = 'GET', url: string = '/api/test') {
  const resHeaders: Record<string, string> = {}
  let finishListener: (() => void) | null = null

  const mockEvent = {
    context: {},
    node: {
      req: {
        headers: {},
        method,
        url,
      },
      res: {
        statusCode: 200,
        headers: resHeaders,
        on: vi.fn((event: string, cb: () => void) => {
          if (event === 'finish') {
            finishListener = cb
          }
        }),
        setHeader: function (key: string, value: string) {
          resHeaders[key] = value
        },
      },
    },
    triggerFinish: () => {
      if (finishListener) {
        finishListener()
      }
    },
  } as MockedH3Event

  return mockEvent
}

interface MockedH3Event {
  context: Record<string, unknown>
  node: {
    req: {
      headers: Record<string, string>
      method: string
      url: string
    }
    res: {
      statusCode: number
      headers: Record<string, string>
      on: Mock
      setHeader: (key: string, value: string) => void
    }
  }
  triggerFinish: () => void
}

describe('Logger Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log request with method, path, status, and duration', async () => {
    // Mock console.log
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // Import middleware
    const loggerMiddleware = (await import('../../../server/middleware/logger')).default

    // Create mock event
    const event = createMockEvent('GET', '/api/test')

    // Call middleware
    loggerMiddleware(event)

    // Wait a bit for time measurement
    await new Promise((resolve) => setTimeout(resolve, 5))

    // Trigger finish event
    event.triggerFinish()

    // Verify console.log was called
    expect(consoleLogSpy).toHaveBeenCalled()
    const logMessage = consoleLogSpy.mock.calls[0][0]
    expect(logMessage).toMatch(/\[HTTP\] GET \/api\/test \d+ \d+ms/)

    // Cleanup
    consoleLogSpy.mockRestore()
  })

  it('should log POST requests correctly', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const loggerMiddleware = (await import('../../../server/middleware/logger')).default

    const event = createMockEvent('POST', '/api/users')

    loggerMiddleware(event)

    await new Promise((resolve) => setTimeout(resolve, 5))
    event.triggerFinish()

    const logMessage = consoleLogSpy.mock.calls[0][0]
    expect(logMessage).toMatch(/\[HTTP\] POST \/api\/users \d+ \d+ms/)

    consoleLogSpy.mockRestore()
  })

  it('should handle different paths', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const loggerMiddleware = (await import('../../../server/middleware/logger')).default

    const event = createMockEvent('GET', '/api/v1/posts/123')

    loggerMiddleware(event)

    await new Promise((resolve) => setTimeout(resolve, 5))
    event.triggerFinish()

    const logMessage = consoleLogSpy.mock.calls[0][0]
    expect(logMessage).toMatch(/\[HTTP\] GET \/api\/v1\/posts\/123 \d+ \d+ms/)

    consoleLogSpy.mockRestore()
  })

  it('should log status code', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const loggerMiddleware = (await import('../../../server/middleware/logger')).default

    const event = createMockEvent('GET', '/api/test')

    // Set a different status code
    event.node.res.statusCode = 404

    loggerMiddleware(event)

    await new Promise((resolve) => setTimeout(resolve, 5))
    event.triggerFinish()

    const logMessage = consoleLogSpy.mock.calls[0][0]
    expect(logMessage).toMatch(/\[HTTP\] GET \/api\/test 404 \d+ms/)

    consoleLogSpy.mockRestore()
  })
})
