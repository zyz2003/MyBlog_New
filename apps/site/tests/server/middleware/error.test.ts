import { describe, it, expect } from 'vitest'
import { HTTPError } from '../../../server/utils/error'
import { createErrorResponse } from '../../../server/utils/response'

/**
 * Test the error handling logic by verifying the response format
 * We test createErrorResponse directly since handleError is just
 * a wrapper that sets response status and calls createErrorResponse
 */
describe('Error Handler', () => {
  describe('HTTPError types', () => {
    it('should create NOT_FOUND error with correct structure', () => {
      const error = HTTPError.NOT_FOUND('Resource not found')

      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.message).toBe('Resource not found')
    })

    it('should create UNAUTHORIZED error with correct structure', () => {
      const error = HTTPError.UNAUTHORIZED('Authentication required')

      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.message).toBe('Authentication required')
    })

    it('should create VALIDATION_ERROR with details', () => {
      const error = HTTPError.VALIDATION_ERROR('Invalid input', [
        { field: 'username', message: 'Username is required' },
        { field: 'email', message: 'Invalid email format' },
      ])

      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toHaveLength(2)
      expect(error.details?.[0].field).toBe('username')
    })

    it('should create RATE_LIMIT_EXCEEDED error', () => {
      const error = HTTPError.RATE_LIMIT_EXCEEDED('Too many requests')

      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should create SERVER_ERROR for unknown errors', () => {
      const error = HTTPError.SERVER_ERROR('Internal server error')

      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('SERVER_ERROR')
    })
  })

  describe('createErrorResponse', () => {
    it('should create error response with code and message', () => {
      const response = createErrorResponse('NOT_FOUND', 'Resource not found')

      expect(response).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      })
    })

    it('should create error response with details', () => {
      const response = createErrorResponse('VALIDATION_ERROR', 'Invalid input', [
        { field: 'username', message: 'Required' },
      ])

      expect(response).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: [{ field: 'username', message: 'Required' }],
        },
      })
    })
  })

  describe('isHTTPError', () => {
    it('should identify HTTPError instances', () => {
      const error = HTTPError.NOT_FOUND('test')

      expect(error instanceof HTTPError).toBe(true)
    })

    it('should not identify regular errors as HTTPError', () => {
      const error = new Error('test')

      expect(error instanceof HTTPError).toBe(false)
    })
  })
})
