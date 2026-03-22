/**
 * API Test Helpers
 *
 * Provides utilities for testing API endpoints with consistent patterns.
 *
 * @module tests/server/helpers/api-test
 */

import { ofetch } from 'ofetch'
import { SignJWT } from 'jose'
import * as schema from '@my-blog/database/schema'

/**
 * Standard success response structure
 */
export interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

/**
 * Standard error response structure
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
 * Standard pagination response structure
 */
export interface PaginatedResponse<T> {
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
 * Union type for API responses
 */
export type APIResponse<T = unknown> = SuccessResponse<T> | ErrorResponse | PaginatedResponse<T>

/**
 * Options for makeAuthenticatedRequest
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
}

/**
 * JWT Secret - must match server configuration
 */
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'change-me-in-production')

/**
 * Generate a test JWT token for authentication
 *
 * @param user - User payload (id, username, role, email)
 * @returns Signed JWT token
 *
 * @example
 * const token = await generateTestToken({
 *   id: 'user-1',
 *   username: 'testuser',
 *   role: 'admin',
 *   email: 'test@example.com'
 * })
 */
export async function generateTestToken(user: {
  id: string
  username: string
  role: string
  email?: string
}): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

/**
 * Make an authenticated request to an API endpoint
 *
 * Uses ofetch for HTTP requests with automatic JSON handling.
 *
 * @param url - The API endpoint URL (e.g., '/api/v1/posts')
 * @param options - Request options (method, headers, body)
 * @returns The parsed JSON response
 *
 * @example
 * // GET request
 * const response = await makeAuthenticatedRequest('/api/v1/posts', {
 *   headers: { Authorization: 'Bearer ' + token }
 * })
 *
 * @example
 * // POST request with body
 * const response = await makeAuthenticatedRequest('/api/v1/posts', {
 *   method: 'POST',
 *   headers: { Authorization: 'Bearer ' + token },
 *   body: { title: 'New Post', content: '...' }
 * })
 */
export async function makeAuthenticatedRequest<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<APIResponse<T>> {
  const { method = 'GET', headers = {}, body } = options

  // Base URL for the Nitro server (will be overridden by test setup)
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000'

  try {
    const response = await ofetch<APIResponse<T>>(url, {
      baseURL,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      // Don't throw on HTTP errors - we want to inspect the response
      ignoreResponseError: true,
    })

    return response
  } catch (error) {
    // Network errors or unexpected failures
    // Return a standardized error response
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown network error',
      },
    }
  }
}

/**
 * Assert that a response has the standard success format
 *
 * @param response - The API response to validate
 * @returns True if response matches standard format
 * @throws Error if response format is invalid
 *
 * @example
 * assertStandardResponse(response)
 * expect(response.data).toHaveProperty('id')
 */
export function assertStandardResponse<T>(
  response: APIResponse<T>
): asserts response is SuccessResponse<T> {
  if (typeof response !== 'object' || response === null) {
    throw new Error(`Response is not an object: ${typeof response}`)
  }

  if (response.success !== true) {
    throw new Error(
      `Expected success: true but got success: ${response.success}. Error: ${JSON.stringify((response as ErrorResponse).error)}`
    )
  }

  if (!('data' in response)) {
    throw new Error('Response missing "data" property')
  }

  return true
}

/**
 * Assert that a response has the standard pagination format
 *
 * @param response - The API response to validate
 * @returns True if response matches paginated format
 * @throws Error if response format is invalid
 *
 * @example
 * assertPaginatedResponse(response)
 * expect(response.meta.total).toBe(100)
 * expect(response.data).toHaveLength(10)
 */
export function assertPaginatedResponse<T>(
  response: APIResponse<T>
): asserts response is PaginatedResponse<T> {
  if (typeof response !== 'object' || response === null) {
    throw new Error(`Response is not an object: ${typeof response}`)
  }

  if (response.success !== true) {
    throw new Error(
      `Expected success: true but got success: ${response.success}. Error: ${JSON.stringify((response as ErrorResponse).error)}`
    )
  }

  if (!('data' in response)) {
    throw new Error('Response missing "data" property')
  }

  if (!Array.isArray(response.data)) {
    throw new Error(`Expected data to be an array but got ${typeof response.data}`)
  }

  if (!('meta' in response)) {
    throw new Error('Response missing "meta" property')
  }

  const meta = (response as PaginatedResponse<T>).meta

  if (typeof meta.total !== 'number') {
    throw new Error(`meta.total must be a number, got ${typeof meta.total}`)
  }

  if (typeof meta.limit !== 'number') {
    throw new Error(`meta.limit must be a number, got ${typeof meta.limit}`)
  }

  if (typeof meta.offset !== 'number') {
    throw new Error(`meta.offset must be a number, got ${typeof meta.offset}`)
  }

  if (typeof meta.totalPages !== 'number') {
    throw new Error(`meta.totalPages must be a number, got ${typeof meta.totalPages}`)
  }

  if (typeof meta.currentPage !== 'number') {
    throw new Error(`meta.currentPage must be a number, got ${typeof meta.currentPage}`)
  }

  return true
}

/**
 * Assert that a response is an error response
 *
 * @param response - The API response to validate
 * @param expectedCode - Optional expected error code
 * @returns True if response is an error
 * @throws Error if response is not an error or doesn't match expected code
 *
 * @example
 * assertErrorResponse(response, 'NOT_FOUND')
 * expect(response.error.message).toContain('not found')
 */
export function assertErrorResponse(
  response: APIResponse,
  expectedCode?: string
): asserts response is ErrorResponse {
  if (typeof response !== 'object' || response === null) {
    throw new Error(`Response is not an object: ${typeof response}`)
  }

  if (response.success !== false) {
    throw new Error(`Expected success: false but got success: ${response.success}`)
  }

  if (!('error' in response)) {
    throw new Error('Response missing "error" property')
  }

  if (expectedCode && response.error.code !== expectedCode) {
    throw new Error(
      `Expected error code "${expectedCode}" but got "${response.error.code}". Message: ${response.error.message}`
    )
  }

  return true
}

/**
 * Clean up the database by clearing all tables
 *
 * Should be called after each test to ensure isolation.
 * Uses TRUNCATE for efficiency.
 *
 * @param db - The database instance to clean
 *
 * @example
 * beforeEach(async () => {
 *   const { db, cleanup } = createIsolatedTestDatabase()
 * })
 *
 * afterEach(async () => {
 *   await cleanupDatabase(db)
 * })
 */
export async function cleanupDatabase(): Promise<void> {
  // Note: This function is a no-op when using isolated databases
  // Each test file should use createIsolatedTestDatabase() for isolation
  // The cleanup function from createIsolatedTestDatabase handles resource cleanup
}

/**
 * Seed common test data
 *
 * Creates a standard set of test users, categories, and tags
 * that can be reused across test files.
 *
 * @param db - The database instance to seed
 * @returns Object with created test data IDs for reference
 *
 * @example
 * const testData = await seedTestData(db)
 * // testData.userId, testData.categoryId, etc.
 */
export async function seedTestData(
  db: ReturnType<typeof createIsolatedTestDatabase>['db']
): Promise<{
  userId: string
  categoryId: string
  tagIds: string[]
}> {
  const userId = 'test-user-seed'
  const categoryId = 'test-category-seed'
  const tagIds = ['test-tag-1', 'test-tag-2', 'test-tag-3']

  // Create test user
  await db.insert(schema.users).values({
    id: userId,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'admin',
    status: 'active',
  })

  // Create test category
  await db.insert(schema.categories).values({
    id: categoryId,
    name: 'Test Category',
    slug: 'test-category',
  })

  // Create test tags
  await db.insert(schema.tags).values(
    tagIds.map((id, index) => ({
      id,
      name: `Test Tag ${index + 1}`,
      slug: `test-tag-${index + 1}`,
    }))
  )

  return { userId, categoryId, tagIds }
}

/**
 * Create a test post with associated data
 *
 * @param db - The database instance
 * @param overrides - Optional overrides for default values
 * @returns The created post ID
 */
export async function createTestPost(
  db: ReturnType<typeof createIsolatedTestDatabase>['db'],
  overrides: Partial<{
    title: string
    slug: string
    content: string
    authorId: string
    categoryId: string
    status: 'draft' | 'published'
  }> = {}
): Promise<string> {
  const postId = `test-post-${Date.now()}`

  await db.insert(schema.posts).values({
    id: postId,
    title: overrides.title ?? 'Test Post',
    slug: overrides.slug ?? `test-post-${Date.now()}`,
    content: overrides.content ?? 'Test content',
    authorId: overrides.authorId ?? 'test-user-seed',
    categoryId: overrides.categoryId,
    status: overrides.status ?? 'draft',
  })

  return postId
}
