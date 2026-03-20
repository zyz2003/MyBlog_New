import { defineEventHandler } from 'h3'

/**
 * Logger middleware
 * Logs every request with method, path, status code, and duration
 *
 * Format: [HTTP] ${method} ${path} ${status} ${duration}ms
 */
export default defineEventHandler((event) => {
  // Record start time
  const startTime = performance.now()

  // Hook into response completion
  event.node.res.on('finish', () => {
    const duration = performance.now() - startTime
    const method = event.node.req.method || 'GET'
    const path = event.node.req.url || '/'
    const status = event.node.res.statusCode || 200

    console.log(`[HTTP] ${method} ${path} ${status} ${Math.round(duration)}ms`)
  })
})
