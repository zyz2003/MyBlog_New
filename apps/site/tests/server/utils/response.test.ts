import { describe, it, expect } from 'vitest'
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginationResponse,
} from '../../../server/utils/response'
import { HTTPError, ERROR_CODES } from '../../../server/utils/error'

describe('Response Utilities', () => {
  describe('createSuccessResponse', () => {
    it('should return success response with data', () => {
      const result = createSuccessResponse({ id: 1, name: 'test' })

      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'test' },
      })
    })

    it('should return success response with custom message', () => {
      const result = createSuccessResponse({ id: 1 }, 'Operation successful')

      expect(result).toEqual({
        success: true,
        message: 'Operation successful',
        data: { id: 1 },
      })
    })

    it('should work with array data', () => {
      const result = createSuccessResponse([1, 2, 3])

      expect(result).toEqual({
        success: true,
        data: [1, 2, 3],
      })
    })

    it('should work with primitive data', () => {
      const result = createSuccessResponse('hello')

      expect(result).toEqual({
        success: true,
        data: 'hello',
      })
    })
  })

  describe('createErrorResponse', () => {
    it('should return error response with code and message', () => {
      const result = createErrorResponse('NOT_FOUND', 'Resource not found')

      expect(result).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      })
    })

    it('should include details when provided', () => {
      const details = [{ field: 'email', message: 'Invalid email' }]
      const result = createErrorResponse('VALIDATION_ERROR', 'Invalid input', details)

      expect(result).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details,
        },
      })
    })

    it('should work with predefined error codes', () => {
      const result = createErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Access denied')

      expect(result.error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('createPaginationResponse', () => {
    const items = [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' },
    ]

    it('should return pagination response with meta', () => {
      const result = createPaginationResponse(items, { total: 100, limit: 10, offset: 0 })

      expect(result).toEqual({
        success: true,
        data: items,
        meta: {
          total: 100,
          limit: 10,
          offset: 0,
          totalPages: 10,
          currentPage: 1,
        },
      })
    })

    it('should calculate correct page number', () => {
      const result = createPaginationResponse(items, { total: 100, limit: 10, offset: 20 })

      expect(result.meta.currentPage).toBe(3)
    })

    it('should handle empty data', () => {
      const result = createPaginationResponse([], { total: 0, limit: 10, offset: 0 })

      expect(result).toEqual({
        success: true,
        data: [],
        meta: {
          total: 0,
          limit: 10,
          offset: 0,
          totalPages: 0,
          currentPage: 1,
        },
      })
    })
  })
})

describe('HTTPError', () => {
  it('should create error with statusCode, code, message', () => {
    const error = new HTTPError(404, 'NOT_FOUND', 'Resource not found')

    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe('Resource not found')
    expect(error.name).toBe('HTTPError')
  })

  it('should create error with details', () => {
    const details = [{ field: 'email', message: 'Required' }]
    const error = new HTTPError(400, 'VALIDATION_ERROR', 'Invalid input', details)

    expect(error.details).toEqual(details)
  })

  it('should be catchable as Error', () => {
    try {
      throw new HTTPError(500, 'SERVER_ERROR', 'Something went wrong')
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e).toBeInstanceOf(HTTPError)
    }
  })

  it('should have proper stack trace', () => {
    const error = new HTTPError(500, 'SERVER_ERROR', 'Test error')

    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
  })

  describe('Predefined error types', () => {
    it('HTTPError.UNAUTHORIZED should create 401 error', () => {
      const error = HTTPError.UNAUTHORIZED('Invalid credentials')

      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('HTTPError.INVALID_TOKEN should create 401 error', () => {
      const error = HTTPError.INVALID_TOKEN('Token expired')

      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('INVALID_TOKEN')
    })

    it('HTTPError.NOT_FOUND should create 404 error', () => {
      const error = HTTPError.NOT_FOUND('Resource not found')

      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('HTTPError.VALIDATION_ERROR should create 400 error', () => {
      const error = HTTPError.VALIDATION_ERROR('Invalid input')

      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('HTTPError.SERVER_ERROR should create 500 error', () => {
      const error = HTTPError.SERVER_ERROR('Internal error')

      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('SERVER_ERROR')
    })

    it('HTTPError.RATE_LIMIT_EXCEEDED should create 429 error', () => {
      const error = HTTPError.RATE_LIMIT_EXCEEDED('Too many requests')

      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
    })
  })
})
