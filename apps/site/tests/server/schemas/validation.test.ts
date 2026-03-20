import { describe, it, expect } from 'vitest'
import { validateBodySync, validateQuery, validateParams } from '../../../server/utils/validate'
import { HTTPError } from '../../../server/utils/error'
import { loginSchema, registerSchema } from '../../../server/schemas/auth'
import {
  paginationSchema,
  listQuerySchema,
  idSchema,
  slugSchema,
} from '../../../server/schemas/common'

describe('Zod Validation Utilities', () => {
  describe('validateBodySync', () => {
    it('should return parsed data for valid body', () => {
      const validBody = { username: 'testuser', password: 'password123' }
      const result = validateBodySync(validBody, loginSchema)

      expect(result).toEqual(validBody)
    })

    it('should throw HTTPError for invalid body', () => {
      const invalidBody = { username: '', password: '123' }

      expect(() => validateBodySync(invalidBody, loginSchema)).toThrow(HTTPError)
      expect(() => validateBodySync(invalidBody, loginSchema)).toThrow('Invalid request body')
    })

    it('should throw VALIDATION_ERROR with field details', () => {
      const invalidBody = { username: '', password: '123' }

      try {
        validateBodySync(invalidBody, loginSchema)
      } catch (error) {
        if (error instanceof HTTPError) {
          expect(error.statusCode).toBe(400)
          expect(error.code).toBe('VALIDATION_ERROR')
          expect(error.details).toBeDefined()
          expect(error.details!.length).toBeGreaterThan(0)
        }
      }
    })

    it('should accept valid register data with email', () => {
      const validData = {
        username: 'newuser',
        password: 'securepass123',
        email: 'user@example.com',
      }

      const result = validateBodySync(validData, registerSchema)
      expect(result).toEqual(validData)
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        username: 'newuser',
        password: 'securepass123',
        email: 'not-an-email',
      }

      expect(() => validateBodySync(invalidData, registerSchema)).toThrow(HTTPError)
    })
  })

  describe('validateQuery', () => {
    it('should parse and validate query parameters', () => {
      const query = { limit: '20', offset: '5' }
      const result = validateQuery(query, paginationSchema)

      expect(result.limit).toBe(20)
      expect(result.offset).toBe(5)
    })

    it('should use default values', () => {
      const query = {}
      const result = validateQuery(query, paginationSchema)

      expect(result.limit).toBe(10)
      expect(result.offset).toBe(0)
    })

    it('should reject limit over 100', () => {
      const query = { limit: '200' }

      try {
        validateQuery(query, paginationSchema)
      } catch (error) {
        expect(error).toBeInstanceOf(HTTPError)
        expect((error as HTTPError).statusCode).toBe(400)
        expect((error as HTTPError).code).toBe('VALIDATION_ERROR')
      }
    })

    it('should reject negative offset', () => {
      const query = { offset: '-5' }

      expect(() => validateQuery(query, paginationSchema)).toThrow(HTTPError)
    })
  })

  describe('validateParams', () => {
    it('should validate UUID format for id', () => {
      const params = { id: '550e8400-e29b-41d4-a716-446655440000' }
      const result = validateParams(params, idSchema)

      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    it('should reject invalid UUID', () => {
      const params = { id: 'not-a-uuid' }

      expect(() => validateParams(params, idSchema)).toThrow(HTTPError)
    })

    it('should validate slug format', () => {
      const params = { slug: 'my-article-slug' }
      const result = validateParams(params, slugSchema)

      expect(result.slug).toBe('my-article-slug')
    })

    it('should reject slug over 200 characters', () => {
      const params = { slug: 'a'.repeat(201) }

      expect(() => validateParams(params, slugSchema)).toThrow(HTTPError)
    })
  })

  describe('listQuerySchema', () => {
    it('should accept valid list query', () => {
      const query = {
        limit: '25',
        offset: '10',
        category: 'tech',
        status: 'published',
        sort: 'createdAt',
        order: 'desc',
      }

      const result = validateQuery(query, listQuerySchema)

      expect(result.limit).toBe(25)
      expect(result.category).toBe('tech')
      expect(result.status).toBe('published')
      expect(result.order).toBe('desc')
    })

    it('should reject invalid status', () => {
      const query = { status: 'invalid' }

      expect(() => validateQuery(query, listQuerySchema)).toThrow(HTTPError)
    })

    it('should reject invalid sort order', () => {
      const query = { order: 'invalid' }

      expect(() => validateQuery(query, listQuerySchema)).toThrow(HTTPError)
    })
  })

  describe('Auth Schemas', () => {
    describe('loginSchema', () => {
      it('should accept valid credentials', () => {
        const valid = { username: 'test_user', password: 'password123' }
        expect(loginSchema.safeParse(valid)).toEqual({ success: true, data: valid })
      })

      it('should reject empty username', () => {
        const invalid = { username: '', password: 'password123' }
        expect(loginSchema.safeParse(invalid).success).toBe(false)
      })

      it('should reject username over 50 characters', () => {
        const invalid = { username: 'a'.repeat(51), password: 'password123' }
        expect(loginSchema.safeParse(invalid).success).toBe(false)
      })

      it('should reject password under 6 characters', () => {
        const invalid = { username: 'testuser', password: '12345' }
        expect(loginSchema.safeParse(invalid).success).toBe(false)
      })

      it('should reject username with special characters', () => {
        const invalid = { username: 'test@user!', password: 'password123' }
        expect(loginSchema.safeParse(invalid).success).toBe(false)
      })

      it('should reject missing password', () => {
        const invalid = { username: 'testuser' }
        expect(loginSchema.safeParse(invalid).success).toBe(false)
      })
    })

    describe('registerSchema', () => {
      it('should accept valid registration data', () => {
        const valid = {
          username: 'newuser',
          password: 'securepass123',
          email: 'new@example.com',
        }
        expect(registerSchema.safeParse(valid)).toEqual({ success: true, data: valid })
      })

      it('should reject invalid email format', () => {
        const invalid = {
          username: 'newuser',
          password: 'securepass123',
          email: 'notemail',
        }
        expect(registerSchema.safeParse(invalid).success).toBe(false)
      })

      it('should accept email with subdomain', () => {
        const valid = {
          username: 'newuser',
          password: 'securepass123',
          email: 'user@mail.example.com',
        }
        expect(registerSchema.safeParse(valid)).toEqual({ success: true, data: valid })
      })
    })
  })
})
