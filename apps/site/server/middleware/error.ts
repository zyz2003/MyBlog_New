import { defineEventHandler, setResponseStatus, setHeader } from 'h3'
import type { H3Event } from 'h3'
import { createErrorResponse } from '../utils/response'
import { isHTTPError } from '../utils/error'

/**
 * Handle error and send standardized JSON response
 * Call this function in your route handlers to properly handle errors
 *
 * @param event - H3Event
 * @param error - Caught error
 * @returns The error response object
 *
 * @example
 * export default defineEventHandler(async (event) => {
 *   try {
 *     // ... your logic
 *   } catch (error) {
 *     return handleError(event, error)
 *   }
 * })
 */
export function handleError(event: H3Event, error: unknown): unknown {
  // Log the error for debugging
  console.error('[Error]', error)

  if (isHTTPError(error)) {
    // HTTPError: return with matching status code
    setResponseStatus(event, error.statusCode)
    setHeader(event, 'Content-Type', 'application/json')

    return createErrorResponse(error.code, error.message, error.details)
  } else {
    // Unknown error: return 500 with sanitized message
    setResponseStatus(event, 500)
    setHeader(event, 'Content-Type', 'application/json')

    return createErrorResponse('SERVER_ERROR', 'An unexpected error occurred')
  }
}

/**
 * Global error handler middleware for Nitro
 * This middleware sets up error handling for all requests
 *
 * Note: In Nitro/H3, global error handling is typically done via
 * server plugins or by wrapping individual handlers.
 * This middleware logs errors and ensures consistent error responses.
 */
export default defineEventHandler((event) => {
  // Set up error handler on the event context
  // Route handlers can call handleError(event, error) to handle errors

  // Optionally set up global error interceptor
  event.context.handleError = (error: unknown) => {
    console.error('[Global Error]', error)

    if (isHTTPError(error)) {
      setResponseStatus(event, error.statusCode)
      setHeader(event, 'Content-Type', 'application/json')
      return createErrorResponse(error.code, error.message, error.details)
    }

    setResponseStatus(event, 500)
    setHeader(event, 'Content-Type', 'application/json')
    return createErrorResponse('SERVER_ERROR', 'An unexpected error occurred')
  }
})
