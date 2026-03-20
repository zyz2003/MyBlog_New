/**
 * HTTP Error class and error code constants
 * Used for standardized error handling across all API endpoints
 */

/**
 * Predefined error codes
 */
export const ERROR_CODES = {
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',

  // Client errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  INVALID_INPUT: 'INVALID_INPUT',

  // Not found (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  SERVER_ERROR: 'SERVER_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Error detail structure for validation errors
 */
export interface ErrorDetail {
  field?: string
  message: string
}

/**
 * HTTP Error class
 * Extends native Error with HTTP-specific properties
 */
export class HTTPError extends Error {
  statusCode: number
  code: ErrorCode
  details?: ErrorDetail[]

  constructor(statusCode: number, code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message)
    this.name = 'HTTPError'
    this.statusCode = statusCode
    this.code = code
    this.details = details

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HTTPError)
    }
  }

  /**
   * Create an UNAUTHORIZED error (401)
   */
  static UNAUTHORIZED(message = 'Unauthorized'): HTTPError {
    return new HTTPError(401, ERROR_CODES.UNAUTHORIZED, message)
  }

  /**
   * Create an INVALID_TOKEN error (401)
   */
  static INVALID_TOKEN(message = 'Invalid or expired token'): HTTPError {
    return new HTTPError(401, ERROR_CODES.INVALID_TOKEN, message)
  }

  /**
   * Create a TOKEN_EXPIRED error (401)
   */
  static TOKEN_EXPIRED(message = 'Token has expired'): HTTPError {
    return new HTTPError(401, ERROR_CODES.TOKEN_EXPIRED, message)
  }

  /**
   * Create a FORBIDDEN error (403)
   */
  static FORBIDDEN(message = 'Access denied'): HTTPError {
    return new HTTPError(403, ERROR_CODES.FORBIDDEN, message)
  }

  /**
   * Create a VALIDATION_ERROR error (400)
   */
  static VALIDATION_ERROR(message = 'Invalid input', details?: ErrorDetail[]): HTTPError {
    return new HTTPError(400, ERROR_CODES.VALIDATION_ERROR, message, details)
  }

  /**
   * Create a BAD_REQUEST error (400)
   */
  static BAD_REQUEST(message = 'Bad request'): HTTPError {
    return new HTTPError(400, ERROR_CODES.BAD_REQUEST, message)
  }

  /**
   * Create a NOT_FOUND error (404)
   */
  static NOT_FOUND(message = 'Resource not found'): HTTPError {
    return new HTTPError(404, ERROR_CODES.NOT_FOUND, message)
  }

  /**
   * Create a RESOURCE_NOT_FOUND error (404)
   */
  static RESOURCE_NOT_FOUND(resource: string): HTTPError {
    return new HTTPError(404, ERROR_CODES.RESOURCE_NOT_FOUND, `${resource} not found`)
  }

  /**
   * Create a RATE_LIMIT_EXCEEDED error (429)
   */
  static RATE_LIMIT_EXCEEDED(message = 'Too many requests'): HTTPError {
    return new HTTPError(429, ERROR_CODES.RATE_LIMIT_EXCEEDED, message)
  }

  /**
   * Create a SERVER_ERROR error (500)
   */
  static SERVER_ERROR(message = 'Internal server error'): HTTPError {
    return new HTTPError(500, ERROR_CODES.SERVER_ERROR, message)
  }

  /**
   * Create an INTERNAL_ERROR error (500)
   */
  static INTERNAL_ERROR(message = 'An unexpected error occurred'): HTTPError {
    return new HTTPError(500, ERROR_CODES.INTERNAL_ERROR, message)
  }

  /**
   * Create a DATABASE_ERROR error (500)
   */
  static DATABASE_ERROR(message = 'Database error'): HTTPError {
    return new HTTPError(500, ERROR_CODES.DATABASE_ERROR, message)
  }
}

/**
 * Type guard to check if an error is an HTTPError
 */
export function isHTTPError(error: unknown): error is HTTPError {
  return error instanceof HTTPError
}
