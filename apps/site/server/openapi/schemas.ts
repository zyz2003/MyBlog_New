/**
 * OpenAPI Schema Definitions
 *
 * Re-exports Zod schemas with OpenAPI metadata using @asteasolutions/zod-to-openapi
 * Generates OpenAPI spec for Swagger UI documentation
 */

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

// Extend Zod with OpenAPI metadata support
extendZodWithOpenApi(z)

// Import existing Zod schemas
import { loginSchema, registerSchema } from '../schemas/auth'
import {
  paginationSchema,
  listQuerySchema,
  idSchema,
  slugSchema,
  sortOrderSchema,
} from '../schemas/common'

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Generic success response schema
 */
export const successResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z
    .object({
      success: z.literal(true).describe('Indicates successful response'),
      data: dataSchema.describe('Response data payload'),
      message: z.string().optional().describe('Optional success message'),
    })
    .openapi({ description: 'Standard success response format' })

/**
 * Error detail schema for validation errors
 */
export const errorDetailSchema = z
  .object({
    field: z.string().optional().describe('The field that caused the error'),
    message: z.string().describe('Human-readable error message'),
  })
  .openapi({ description: 'Detailed error information for validation errors' })

/**
 * Error response schema
 */
export const errorResponseSchema = z
  .object({
    success: z.literal(false).describe('Indicates error response'),
    error: z.object({
      code: z.string().describe('Machine-readable error code (e.g., NOT_FOUND, VALIDATION_ERROR)'),
      message: z.string().describe('Human-readable error message'),
      details: z.array(errorDetailSchema).optional().describe('Optional array of detailed errors'),
    }),
  })
  .openapi({ description: 'Standard error response format' })

/**
 * Pagination metadata schema
 */
export const paginationMetaSchema = z
  .object({
    total: z.number().describe('Total number of items'),
    limit: z.number().describe('Items per page'),
    offset: z.number().describe('Current offset from start'),
    totalPages: z.number().describe('Total number of pages'),
    currentPage: z.number().describe('Current page number (1-indexed)'),
  })
  .openapi({ description: 'Pagination metadata for list responses' })

/**
 * Paginated response schema
 */
export const paginationResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z
    .object({
      success: z.literal(true).describe('Indicates successful response'),
      data: z.array(itemSchema).describe('Array of items'),
      meta: paginationMetaSchema.describe('Pagination metadata'),
    })
    .openapi({ description: 'Standard paginated response format' })

// ============================================================================
// Parameter Schemas (for query/path parameters)
// ============================================================================

/**
 * Pagination parameters for query strings
 */
export const paginationParamsSchema = paginationSchema
  .transform((val) => ({
    limit: Number(val.limit),
    offset: Number(val.offset),
  }))
  .openapi({
    description: 'Pagination parameters (limit: 1-100, offset: 0+)',
    example: { limit: 10, offset: 0 },
  })

/**
 * List query parameters for filtering and sorting
 */
export const listQueryParamsSchema = listQuerySchema
  .transform((val) => ({
    limit: Number(val.limit),
    offset: Number(val.offset),
    category: val.category,
    tag: val.tag,
    status: val.status,
    search: val.search,
    sort: val.sort,
    order: val.order,
  }))
  .openapi({
    description: 'List query parameters with filtering, sorting, and pagination',
    example: {
      limit: 10,
      offset: 0,
      sort: 'createdAt',
      order: 'desc',
    },
  })

/**
 * ID path parameter schema
 */
export const idParamSchema = idSchema.openapi({
  description: 'Resource ID parameter (UUID format)',
  example: { id: '550e8400-e29b-41d4-a716-446655440000' },
})

/**
 * Slug path parameter schema
 */
export const slugParamSchema = slugSchema.openapi({
  description: 'Resource slug parameter (URL-friendly identifier)',
  example: { slug: 'my-first-blog-post' },
})

// ============================================================================
// Auth Schemas with OpenAPI metadata
// ============================================================================

/**
 * Login request schema with OpenAPI metadata
 */
export const loginOpenApiSchema = loginSchema.openapi({
  description: 'User login credentials',
  example: {
    username: 'admin',
    password: 'password123',
  },
})

/**
 * Register request schema with OpenAPI metadata
 */
export const registerOpenApiSchema = registerSchema.openapi({
  description: 'User registration data',
  example: {
    username: 'newuser',
    password: 'securepass123',
    email: 'user@example.com',
  },
})

/**
 * JWT Token response schema
 */
export const tokenResponseSchema = z
  .object({
    token: z.string().describe('JWT access token'),
    expiresIn: z.number().describe('Token expiration time in seconds'),
    tokenType: z.literal('Bearer').describe('Token type'),
  })
  .openapi({
    description: 'JWT token response after successful login',
  })

/**
 * User info response schema
 */
export const userResponseSchema = z
  .object({
    id: z.string().uuid().describe('User ID'),
    username: z.string().describe('Username'),
    email: z.string().email().describe('User email'),
    role: z.enum(['admin', 'user']).describe('User role'),
    createdAt: z.string().datetime().describe('Account creation timestamp'),
  })
  .openapi({
    description: 'User profile information',
  })

// ============================================================================
// Security Schemes
// ============================================================================

/**
 * JWT Bearer authentication scheme definition
 * This is used by Swagger UI to enable authentication
 */
export const jwtBearerAuthScheme = {
  type: 'http' as const,
  scheme: 'bearer' as const,
  bearerFormat: 'JWT',
  description: 'JWT Bearer token authentication. Include token as: Bearer <token>',
}

// ============================================================================
// API Tags
// ============================================================================

/**
 * OpenAPI tags for organizing endpoints
 */
export const apiTags = {
  auth: { name: 'Auth', description: 'User authentication endpoints' },
  posts: { name: 'Posts', description: 'Blog post CRUD operations' },
  categories: { name: 'Categories', description: 'Category management' },
  tags: { name: 'Tags', description: 'Tag management' },
  media: { name: 'Media', description: 'Media library and file uploads' },
  users: { name: 'Users', description: 'User management' },
} as const

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate OpenAPI spec object with all schemas registered
 * @returns OpenAPI schemas object ready to be used in Swagger configuration
 */
export function getOpenApiSchemas() {
  return {
    // Response schemas
    SuccessResponse: successResponseSchema,
    ErrorResponse: errorResponseSchema,
    PaginationResponse: paginationResponseSchema,

    // Parameter schemas
    PaginationParams: paginationParamsSchema,
    ListQueryParams: listQueryParamsSchema,
    IdParam: idParamSchema,
    SlugParam: slugParamSchema,

    // Auth schemas
    LoginRequest: loginOpenApiSchema,
    RegisterRequest: registerOpenApiSchema,
    TokenResponse: tokenResponseSchema,
    UserResponse: userResponseSchema,

    // Security schemes
    BearerAuth: jwtBearerAuthScheme,
  }
}

// Re-export original Zod schemas for direct use
export {
  loginSchema,
  registerSchema,
  paginationSchema,
  listQuerySchema,
  idSchema,
  slugSchema,
  sortOrderSchema,
}
