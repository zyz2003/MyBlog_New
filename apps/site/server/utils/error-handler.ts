import type { H3Error } from 'h3'
import { errorResponse, SystemErrors } from './response'

/**
 * Custom Nitro error handler for unified response format.
 *
 * Referenced in nuxt.config.ts via nitro.errorHandler.
 *
 * H3Error (from createError) carries statusCode + data — we extract
 * the data field and send it directly for a flat { code, message } shape.
 * Unknown errors get wrapped in a 500 with code 9001.
 */
export default function errorHandler(error: H3Error, event: any) {
  // If the error has a data field (from createError({ data: errorResponse(...) }))
  // send it directly as the response body — this gives us the flat { code, message } format
  if (error.data) {
    setResponseStatus(event, error.statusCode || 500)
    return error.data
  }

  // Unknown error without data — wrap in unified format
  console.error('[Unhandled Error]', error)

  setResponseStatus(event, 500)
  return errorResponse(
    SystemErrors.INTERNAL.code,
    process.env.NODE_ENV !== 'production'
      ? `${SystemErrors.INTERNAL.message}: ${error.message}`
      : SystemErrors.INTERNAL.message,
  )
}
