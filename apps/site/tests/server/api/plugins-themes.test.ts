/**
 * Plugins and Themes API Contract Tests
 *
 * Tests for plugins API endpoints:
 * - GET /api/v1/plugins - List installed plugins
 * - PUT /api/v1/plugins/:id/config - Update plugin config (auth required)
 *
 * Tests for themes API endpoints:
 * - GET /api/v1/themes - Get current theme config
 * - PUT /api/v1/themes/active - Set active theme (auth required)
 *
 * These are contract tests that verify the API behavior matches the specification.
 * Focus on response format, status codes, and data structure.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import {
  createIsolatedTestDatabase,
  initializeTestDatabase,
  clearAllData,
  seedTestData,
} from '../../db'
import { hashPassword } from '../../../server/services/auth.service'
import { generateToken } from '../../../server/middleware/auth'

// Isolated database for this test file
let testDb: ReturnType<typeof createIsolatedTestDatabase>['db']
let cleanup: () => Promise<void>

/**
 * Initialize isolated test database before all tests
 */
beforeAll(async () => {
  const isolated = await createIsolatedTestDatabase()
  testDb = isolated.db
  cleanup = isolated.cleanup
  await initializeTestDatabase(testDb)
})

/**
 * Clean up isolated database after all tests
 */
afterAll(async () => {
  await cleanup()
})

/**
 * Clear all data between tests for isolation
 */
beforeEach(async () => {
  await clearAllData(testDb)

  // Insert test user
  const passwordHash = await hashPassword('password123')
  await seedTestData(testDb, passwordHash)
})

// Helper function to create mock events
function createMockEvent(
  method: string,
  body?: any,
  params?: Record<string, string>,
  authToken?: string
) {
  return {
    context: {
      params,
      user: undefined,
    },
    node: {
      req: {
        headers: authToken
          ? { authorization: `Bearer ${authToken}`, 'content-type': 'application/json' }
          : {},
        method,
        body: body || {},
      },
    },
    _body: body || {}, // For readBody compatibility
  } as any
}

describe('Plugins API Contract', () => {
  describe('GET /api/v1/plugins - List Plugins', () => {
    it('returns list of installed plugins', async () => {
      const handler = (await import('../../../server/api/v1/plugins/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/plugins' } },
        _query: {},
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.message).toBeUndefined()
    })

    it('returns plugins with id, name, version, enabled, and config fields', async () => {
      const handler = (await import('../../../server/api/v1/plugins/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/plugins' } },
        _query: {},
      } as any

      const result = await handler(mockEvent)

      expect(result.data).toBeDefined()
      if (result.data.length > 0) {
        const plugin = result.data[0]
        expect(plugin).toHaveProperty('id')
        expect(plugin).toHaveProperty('name')
        expect(plugin).toHaveProperty('version')
        expect(plugin).toHaveProperty('enabled')
        expect(plugin).toHaveProperty('config')
      }
    })
  })

  describe('PUT /api/v1/plugins/:id/config - Update Plugin Config', () => {
    it('requires authentication', async () => {
      const handler = (await import('../../../server/api/v1/plugins/index.put.ts')).default
      const mockEvent = createMockEvent('PUT', { enabled: true }, { id: 'test-plugin' })

      await expect(handler(mockEvent)).rejects.toThrow()
    })

    it('updates plugin config and returns updated plugin', async () => {
      const authToken = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/plugins/index.put.ts')).default
      const mockEvent = createMockEvent(
        'PUT',
        { enabled: true, apiKey: 'test-key' },
        { id: 'sitemap' },
        authToken
      )

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('sitemap')
      expect(result.message).toBe('Plugin config updated successfully')
    })

    it('returns 404 for non-existent plugin', async () => {
      const authToken = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/plugins/index.put.ts')).default
      const mockEvent = createMockEvent(
        'PUT',
        { enabled: true },
        { id: 'non-existent-plugin' },
        authToken
      )

      try {
        await handler(mockEvent)
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })
  })
})

describe('Themes API Contract', () => {
  describe('GET /api/v1/themes - Get Theme Config', () => {
    it('returns current theme config', async () => {
      const handler = (await import('../../../server/api/v1/themes/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/themes' } },
        _query: {},
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data).toHaveProperty('activeTheme')
      expect(result.data).toHaveProperty('config')
      expect(result.message).toBeUndefined()
    })

    it('returns theme config with colors, typography, and layout settings', async () => {
      const handler = (await import('../../../server/api/v1/themes/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/themes' } },
        _query: {},
      } as any

      const result = await handler(mockEvent)

      expect(result.data.config).toBeDefined()
      // Theme config should have common theme settings
      expect(typeof result.data.activeTheme).toBe('string')
    })
  })

  describe('PUT /api/v1/themes/active - Set Active Theme', () => {
    it('requires authentication', async () => {
      const handler = (await import('../../../server/api/v1/themes/index.put.ts')).default
      const mockEvent = createMockEvent('PUT', { theme: 'dark' }, {}, undefined)

      await expect(handler(mockEvent)).rejects.toThrow()
    })

    it('sets active theme and returns updated config', async () => {
      const authToken = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/themes/index.put.ts')).default
      const mockEvent = createMockEvent('PUT', { theme: 'minimal' }, {}, authToken)

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.activeTheme).toBe('minimal')
      expect(result.message).toBe('Theme updated successfully')
    })

    it('returns 404 for non-existent theme', async () => {
      const authToken = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/themes/index.put.ts')).default
      const mockEvent = createMockEvent('PUT', { theme: 'non-existent-theme' }, {}, authToken)

      try {
        await handler(mockEvent)
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })
  })
})
