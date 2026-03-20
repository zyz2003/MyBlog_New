import { describe, it, expect, beforeEach } from 'vitest'
import rateLimitMiddleware, {
  checkRateLimit,
  getRateLimitError,
  requestStore,
} from '../../../server/middleware/rate-limit'

interface MockedH3Event {
  context: Record<string, unknown> & {
    rateLimitExceeded?: boolean
    rateLimitError?: unknown
  }
  node: {
    req: {
      headers: Record<string, string>
      method: string
      url: string
      socket: {
        remoteAddress: string
      }
    }
    res: {
      statusCode: number
      headers: Record<string, string>
      setHeader: (key: string, value: string) => void
      getHeader: (key: string) => string | undefined
    }
  }
}

/**
 * Create a mock H3Event for testing
 */
function createMockEvent(
  ip: string,
  method: string = 'GET',
  url: string = '/api/test'
): MockedH3Event {
  const headers: Record<string, string> = {}
  const resHeaders: Record<string, string> = {}

  // Always set x-forwarded-for to simulate client IP
  headers['x-forwarded-for'] = ip

  return {
    context: {},
    node: {
      req: {
        headers,
        method,
        url,
        socket: {
          remoteAddress: '127.0.0.1',
        },
      },
      res: {
        statusCode: 200,
        headers: resHeaders,
        setHeader: function (key: string, value: string) {
          resHeaders[key] = value
        },
        getHeader: function (key: string) {
          return resHeaders[key]
        },
      },
    },
  }
}

describe('Rate Limit Middleware', () => {
  // Clear the rate limit store before each test
  beforeEach(() => {
    requestStore.clear()
  })

  it('should allow requests under the limit', () => {
    const event = createMockEvent('192.168.1.1')

    // First request should be allowed
    rateLimitMiddleware(event)

    // Should not exceed limit
    expect(checkRateLimit(event)).toBe(false)

    // Should have rate limit headers
    expect(event.node.res.headers['X-RateLimit-Limit']).toBe('100')
    expect(event.node.res.headers['X-RateLimit-Remaining']).toBe('99')
  })

  it('should set correct rate limit headers', () => {
    const event = createMockEvent('192.168.1.2')

    rateLimitMiddleware(event)

    expect(event.node.res.headers['X-RateLimit-Limit']).toBeDefined()
    expect(event.node.res.headers['X-RateLimit-Remaining']).toBeDefined()
    expect(event.node.res.headers['X-RateLimit-Reset']).toBeDefined()

    // Remaining should be 99 after first request
    expect(Number(event.node.res.headers['X-RateLimit-Remaining'])).toBe(99)
  })

  it('should track requests per IP', () => {
    const ip = '192.168.1.100'
    const event1 = createMockEvent(ip)
    const event2 = createMockEvent(ip)

    // First request
    rateLimitMiddleware(event1)
    const remaining1 = Number(event1.node.res.headers['X-RateLimit-Remaining'])

    // Second request from same IP
    rateLimitMiddleware(event2)
    const remaining2 = Number(event2.node.res.headers['X-RateLimit-Remaining'])

    // Second request should have one less remaining
    expect(remaining2).toBe(remaining1 - 1)
  })

  it('should treat different IPs separately', () => {
    const event1 = createMockEvent('192.168.1.100')
    const event2 = createMockEvent('192.168.1.101')

    rateLimitMiddleware(event1)
    rateLimitMiddleware(event2)

    // Both should have same remaining (100 - 1 = 99) since they're different IPs
    expect(event1.node.res.headers['X-RateLimit-Remaining']).toBe(
      event2.node.res.headers['X-RateLimit-Remaining']
    )
  })

  it('should block requests exceeding 100 per minute', () => {
    const ip = '10.0.0.1'

    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      const event = createMockEvent(ip)
      rateLimitMiddleware(event)
    }

    // 101st request should be blocked
    const event = createMockEvent(ip)
    rateLimitMiddleware(event)

    // Should exceed limit
    expect(checkRateLimit(event)).toBe(true)

    // Should have error response
    const error = getRateLimitError(event)
    expect(error).toBeDefined()
    const errorObj = error as { error?: { code?: string } }
    expect(errorObj.error?.code).toBe('RATE_LIMIT_EXCEEDED')
  })

  it('should set 429 status when limit exceeded', () => {
    const ip = '10.0.0.2'

    // Exhaust the limit
    for (let i = 0; i < 101; i++) {
      const event = createMockEvent(ip)
      rateLimitMiddleware(event)
    }

    // Next request should get 429
    const event = createMockEvent(ip)
    rateLimitMiddleware(event)

    // Should have 429 status
    expect(event.node.res.statusCode).toBe(429)
    expect(event.context.rateLimitExceeded).toBe(true)
  })

  it('should use x-forwarded-for header to identify client IP', () => {
    // Clear store first
    requestStore.clear()

    // First event with x-forwarded-for
    const event1 = createMockEvent('203.0.113.50')
    rateLimitMiddleware(event1)

    // Second event with same IP via x-forwarded-for
    const event2 = createMockEvent('203.0.113.50')
    rateLimitMiddleware(event2)

    // First request should have 99 remaining, second should have 98
    expect(event1.node.res.headers['X-RateLimit-Remaining']).toBe('99')
    expect(event2.node.res.headers['X-RateLimit-Remaining']).toBe('98')
  })
})
