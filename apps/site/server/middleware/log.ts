/**
 * Request logging middleware.
 *
 * Logs timestamp, HTTP method, path, status code, and response time (ms)
 * for every request after the response completes.
 */
export default defineEventHandler(async (event) => {
  const start = event.context._startTime || Date.now()
  const method = event.method
  const path = getRequestURL(event).pathname

  // Listen for response finish to capture status code and duration
  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const status = event.node.res.statusCode
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${method} ${path} ${status} ${duration}ms`)
  })
})
