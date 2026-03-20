import { describe, it, expect } from 'vitest'
import { generateToken, optionalAuth, requireAuth } from '../../../server/middleware/auth'
import { HTTPError } from '../../../server/utils/error'

// Mock user data
const mockUser = {
  id: 'user-123',
  username: 'testuser',
  role: 'admin' as const,
  email: 'test@example.com',
}

describe('JWT Authentication', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await generateToken(mockUser)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should generate tokens with different values for different users', async () => {
      const token1 = await generateToken(mockUser)
      const token2 = await generateToken({ ...mockUser, id: 'user-456' })

      expect(token1).not.toBe(token2)
    })
  })

  describe('optionalAuth', () => {
    it('should attach user for valid token', async () => {
      const token = await generateToken(mockUser)
      const mockEvent = createMockEvent(token)

      await optionalAuth(mockEvent)

      expect(mockEvent.context.user).toBeDefined()
      expect(mockEvent.context.user?.id).toBe(mockUser.id)
      expect(mockEvent.context.user?.username).toBe(mockUser.username)
      expect(mockEvent.context.user?.role).toBe(mockUser.role)
    })

    it('should not attach user for missing token', async () => {
      const mockEvent = createMockEvent(null)

      await optionalAuth(mockEvent)

      expect(mockEvent.context.user).toBeUndefined()
    })

    it('should not attach user for invalid token', async () => {
      const mockEvent = createMockEvent('invalid-token')

      await optionalAuth(mockEvent)

      expect(mockEvent.context.user).toBeUndefined()
    })

    it('should not throw for expired token', async () => {
      const mockEvent = createMockEvent('expired.token.here')

      // Should not throw
      await expect(optionalAuth(mockEvent)).resolves.not.toThrow()
    })
  })

  describe('requireAuth', () => {
    it('should return user for valid token', async () => {
      const token = await generateToken(mockUser)
      const mockEvent = createMockEvent(token)

      const user = await requireAuth(mockEvent)

      expect(user.id).toBe(mockUser.id)
      expect(user.username).toBe(mockUser.username)
      expect(user.role).toBe(mockUser.role)
    })

    it('should throw UNAUTHORIZED for missing token', async () => {
      const mockEvent = createMockEvent(null)

      await expect(requireAuth(mockEvent)).rejects.toThrow(HTTPError)
      await expect(requireAuth(mockEvent)).rejects.toThrow('Authentication required')
    })

    it('should throw INVALID_TOKEN for invalid token', async () => {
      const mockEvent = createMockEvent('invalid-token')

      await expect(requireAuth(mockEvent)).rejects.toThrow(HTTPError)
      await expect(requireAuth(mockEvent)).rejects.toThrow('Invalid or expired token')
    })
  })

  describe('Token payload', () => {
    it('should include all user fields in token', async () => {
      const token = await generateToken(mockUser)

      // Decode token payload (base64)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'))

      expect(payload.id).toBe(mockUser.id)
      expect(payload.username).toBe(mockUser.username)
      expect(payload.role).toBe(mockUser.role)
      expect(payload.email).toBe(mockUser.email)
      expect(payload.exp).toBeDefined() // expiry
      expect(payload.iat).toBeDefined() // issued at
    })
  })
})

/**
 * Create a mock H3 event for testing
 */
function createMockEvent(token: string | null) {
  return {
    context: {} as Record<string, unknown>,
    node: {
      req: {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      },
      res: {
        statusCode: 200,
        setHeader: () => {},
        end: () => {},
      },
    },
  } as unknown as typeof import('h3').H3Event
}
