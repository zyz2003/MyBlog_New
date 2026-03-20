/**
 * Unified response utilities for Nitro server
 * Provides consistent response formats for all API endpoints
 */

/**
 * Success response structure
 */
export interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{
      field?: string
      message: string
    }>
  }
}

/**
 * Pagination response structure
 */
export interface PaginationResponse<T> {
  success: true
  data: T[]
  meta: {
    total: number
    limit: number
    offset: number
    totalPages: number
    currentPage: number
  }
}

/**
 * Create a success response
 * @param data - The response data
 * @param message - Optional success message
 */
export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  }

  if (message) {
    response.message = message
  }

  return response
}

/**
 * Create an error response
 * @param code - Error code (e.g., 'NOT_FOUND', 'VALIDATION_ERROR')
 * @param message - Human-readable error message
 * @param details - Optional array of detailed error information
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Array<{ field?: string; message: string }>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
}

/**
 * Create a pagination response
 * @param data - Array of items
 * @param pagination - Pagination parameters
 */
export function createPaginationResponse<T>(
  data: T[],
  pagination: { total: number; limit: number; offset: number }
): PaginationResponse<T> {
  const totalPages = pagination.total > 0 ? Math.ceil(pagination.total / pagination.limit) : 0
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  return {
    success: true,
    data,
    meta: {
      total: pagination.total,
      limit: pagination.limit,
      offset: pagination.offset,
      totalPages,
      currentPage,
    },
  }
}
