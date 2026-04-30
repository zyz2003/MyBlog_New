/**
 * Error-handler middleware — sets up context for request tracking.
 *
 * NOTE: The actual global error catching is done by the custom error handler
 * at utils/error-handler.ts (referenced in nuxt.config.ts via nitro.errorHandler).
 * This middleware initializes per-request context that the log middleware relies on.
 */
export default defineEventHandler(async (event) => {
  // Record request start time for response-time logging
  event.context._startTime = Date.now()
})
