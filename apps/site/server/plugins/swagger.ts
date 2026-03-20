/**
 * Swagger/OpenAPI Documentation Plugin
 *
 * Provides Swagger UI at /docs endpoint (development only)
 * and OpenAPI JSON spec at /api/docs/json
 *
 * Uses @asteasolutions/zod-to-openapi for schema generation
 */

import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z)

// ============================================================================
// OpenAPI Registry Setup
// ============================================================================

const registry = new OpenAPIRegistry()

// ============================================================================
// Schema Definitions
// ============================================================================

/**
 * Post schema for OpenAPI documentation
 */
const postSchema = z
  .object({
    id: z.string().uuid().describe('Post unique identifier'),
    title: z.string().max(200).describe('Post title'),
    slug: z.string().max(200).describe('URL-friendly slug'),
    content: z.string().describe('Post content in Markdown format'),
    excerpt: z.string().optional().describe('Post excerpt/summary'),
    coverImage: z.string().url().optional().describe('Cover image URL'),
    status: z.enum(['draft', 'published', 'archived']).describe('Post status'),
    categoryId: z.string().uuid().nullable().describe('Category ID'),
    categoryName: z.string().optional().describe('Category name'),
    tags: z
      .array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          slug: z.string(),
        })
      )
      .optional()
      .describe('Associated tags'),
    authorId: z.string().uuid().describe('Author user ID'),
    authorName: z.string().optional().describe('Author name'),
    viewCount: z.number().default(0).describe('View count'),
    wordCount: z.number().default(0).describe('Word count'),
    isPinned: z.boolean().default(false).describe('Whether post is pinned'),
    pinnedAt: z.string().datetime().nullable().optional().describe('Pin timestamp'),
    createdAt: z.string().datetime().describe('Creation timestamp'),
    updatedAt: z.string().datetime().describe('Last update timestamp'),
    publishedAt: z.string().datetime().nullable().optional().describe('Publication timestamp'),
  })
  .openapi({ description: 'Blog post object' })

/**
 * Category schema for OpenAPI documentation
 */
const categorySchema = z
  .object({
    id: z.string().uuid().describe('Category unique identifier'),
    name: z.string().max(100).describe('Category name'),
    slug: z.string().max(100).describe('URL-friendly slug'),
    description: z.string().optional().describe('Category description'),
    parentId: z.string().uuid().nullable().optional().describe('Parent category ID'),
    postCount: z.number().default(0).describe('Number of posts in this category'),
    createdAt: z.string().datetime().describe('Creation timestamp'),
    updatedAt: z.string().datetime().describe('Last update timestamp'),
  })
  .openapi({ description: 'Category object' })

/**
 * Tag schema for OpenAPI documentation
 */
const tagSchema = z
  .object({
    id: z.string().uuid().describe('Tag unique identifier'),
    name: z.string().max(50).describe('Tag name'),
    slug: z.string().max(50).describe('URL-friendly slug'),
    postCount: z.number().default(0).describe('Number of posts with this tag'),
    createdAt: z.string().datetime().describe('Creation timestamp'),
    updatedAt: z.string().datetime().describe('Last update timestamp'),
  })
  .openapi({ description: 'Tag object' })

/**
 * Media schema for OpenAPI documentation
 */
const mediaSchema = z
  .object({
    id: z.string().uuid().describe('Media unique identifier'),
    filename: z.string().describe('Original filename'),
    url: z.string().url().describe('Media URL'),
    thumbnailUrl: z.string().url().optional().describe('Thumbnail URL'),
    mimeType: z.string().describe('MIME type'),
    size: z.number().describe('File size in bytes'),
    width: z.number().nullable().optional().describe('Image width (for images)'),
    height: z.number().nullable().optional().describe('Image height (for images)'),
    uploadedBy: z.string().uuid().describe('Uploader user ID'),
    createdAt: z.string().datetime().describe('Upload timestamp'),
  })
  .openapi({ description: 'Media resource object' })

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Login request schema
 */
const loginSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username is required')
      .max(50, 'Username must be less than 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
  })
  .openapi({
    description: 'User login credentials',
    example: { username: 'admin', password: 'password123' },
  })

/**
 * Register request schema
 */
const registerSchema = z
  .object({
    username: loginSchema.shape.username,
    password: loginSchema.shape.password,
    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email must be less than 255 characters'),
  })
  .openapi({
    description: 'User registration data',
    example: { username: 'newuser', password: 'securepass123', email: 'user@example.com' },
  })

/**
 * Token response schema
 */
const tokenResponseSchema = z
  .object({
    token: z.string().describe('JWT access token'),
    expiresIn: z.number().describe('Token expiration time in seconds'),
    tokenType: z.literal('Bearer').describe('Token type'),
  })
  .openapi({ description: 'JWT token response' })

/**
 * User response schema
 */
const userResponseSchema = z
  .object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'user']),
    createdAt: z.string().datetime(),
  })
  .openapi({ description: 'User profile response' })

/**
 * Create post request schema
 */
const createPostSchema = z
  .object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    excerpt: z.string().max(500).optional(),
    categoryId: z.string().uuid().nullable().optional(),
    tagIds: z.array(z.string().uuid()).optional(),
    coverImageUrl: z.string().url().optional(),
    status: z.enum(['draft', 'published']).default('draft'),
    isPinned: z.boolean().default(false),
  })
  .openapi({ description: 'Create post request' })

/**
 * Update post request schema
 */
const updatePostSchema = createPostSchema.partial().openapi({ description: 'Update post request' })

/**
 * Create category request schema
 */
const createCategorySchema = z
  .object({
    name: z.string().min(1).max(100),
    slug: z.string().max(100).optional(),
    description: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
  })
  .openapi({ description: 'Create category request' })

/**
 * Create tag request schema
 */
const createTagSchema = z
  .object({
    name: z.string().min(1).max(50),
    slug: z.string().max(50).optional(),
  })
  .openapi({ description: 'Create tag request' })

/**
 * Error response schema
 */
const errorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z
        .array(
          z.object({
            field: z.string().optional(),
            message: z.string(),
          })
        )
        .optional(),
    }),
  })
  .openapi({ description: 'Error response' })

/**
 * Pagination params schema
 */
const paginationParamsSchema = z
  .object({
    limit: z.string().optional().default('10'),
    offset: z.string().optional().default('0'),
  })
  .openapi({ description: 'Pagination parameters' })

/**
 * List query params schema
 */
const listQueryParamsSchema = paginationParamsSchema
  .extend({
    category: z.string().optional(),
    tag: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    search: z.string().optional(),
    sort: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .openapi({ description: 'List query parameters' })

// ============================================================================
// API Tags
// ============================================================================

const TAGS = {
  auth: 'Auth',
  posts: 'Posts',
  categories: 'Categories',
  tags: 'Tags',
  media: 'Media',
} as const

// ============================================================================
// Auth Endpoints
// ============================================================================

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  tags: [TAGS.auth],
  summary: 'User login',
  description: 'Authenticate user and return JWT token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful login',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: tokenResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Invalid credentials',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  tags: [TAGS.auth],
  summary: 'User registration',
  description: 'Register a new user account',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: userResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Validation error or user already exists',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  tags: [TAGS.auth],
  summary: 'Get current user',
  description: 'Get the currently authenticated user profile',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user profile',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: userResponseSchema,
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/logout',
  tags: [TAGS.auth],
  summary: 'User logout',
  description: 'Logout current user',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Successfully logged out',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

// ============================================================================
// Posts Endpoints
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/api/v1/posts',
  tags: [TAGS.posts],
  summary: 'List posts',
  description: 'Get a paginated list of posts with optional filtering',
  request: {
    query: listQueryParamsSchema,
  },
  responses: {
    200: {
      description: 'Paginated list of posts',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(postSchema),
            meta: z.object({
              total: z.number(),
              limit: z.number(),
              offset: z.number(),
              totalPages: z.number(),
              currentPage: z.number(),
            }),
          }),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/posts/{slug}',
  tags: [TAGS.posts],
  summary: 'Get post by slug',
  description: 'Get a single post by its slug',
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      description: 'Post details',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: postSchema,
          }),
        },
      },
    },
    404: {
      description: 'Post not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/posts',
  tags: [TAGS.posts],
  summary: 'Create post',
  description: 'Create a new blog post',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createPostSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Post created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: postSchema,
          }),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'put',
  path: '/api/v1/posts/{id}',
  tags: [TAGS.posts],
  summary: 'Update post',
  description: 'Update an existing post',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        'application/json': {
          schema: updatePostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Post updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: postSchema,
          }),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/posts/{id}',
  tags: [TAGS.posts],
  summary: 'Delete post',
  description: 'Delete a post',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Post deleted',
      content: {
        'application/json': {
          schema: z.object({ success: z.literal(true), message: z.string() }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
})

// ============================================================================
// Categories Endpoints
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/api/v1/categories',
  tags: [TAGS.categories],
  summary: 'List categories',
  description: 'Get all categories',
  request: { query: paginationParamsSchema },
  responses: {
    200: {
      description: 'List of categories',
      content: {
        'application/json': {
          schema: z.object({ success: z.literal(true), data: z.array(categorySchema) }),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/categories',
  tags: [TAGS.categories],
  summary: 'Create category',
  description: 'Create a new category',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createCategorySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Category created',
      content: {
        'application/json': {
          schema: z.object({ success: z.literal(true), data: categorySchema }),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
})

// ============================================================================
// Tags Endpoints
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/api/v1/tags',
  tags: [TAGS.tags],
  summary: 'List tags',
  description: 'Get all tags',
  request: { query: paginationParamsSchema },
  responses: {
    200: {
      description: 'List of tags',
      content: {
        'application/json': {
          schema: z.object({ success: z.literal(true), data: z.array(tagSchema) }),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/tags',
  tags: [TAGS.tags],
  summary: 'Create tag',
  description: 'Create a new tag',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createTagSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Tag created',
      content: {
        'application/json': {
          schema: z.object({ success: z.literal(true), data: tagSchema }),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
})

// ============================================================================
// Media Endpoints
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/api/v1/media',
  tags: [TAGS.media],
  summary: 'List media',
  description: 'Get all media files',
  security: [{ bearerAuth: [] }],
  request: { query: paginationParamsSchema },
  responses: {
    200: {
      description: 'List of media files',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(mediaSchema),
            meta: z.object({
              total: z.number(),
              limit: z.number(),
              offset: z.number(),
              totalPages: z.number(),
              currentPage: z.number(),
            }),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/media/upload',
  tags: [TAGS.media],
  summary: 'Upload media',
  description: 'Upload a new media file',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.string().describe('File to upload'),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Media uploaded',
      content: {
        'application/json': {
          schema: z.object({ success: z.literal(true), data: mediaSchema }),
        },
      },
    },
    400: {
      description: 'Invalid file',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/media/{id}',
  tags: [TAGS.media],
  summary: 'Delete media',
  description: 'Delete a media file',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Media deleted',
      content: {
        'application/json': {
          schema: z.object({ success: z.literal(true), message: z.string() }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    404: {
      description: 'Media not found',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
})

// ============================================================================
// Security Scheme
// ============================================================================

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT Bearer token authentication',
})

// ============================================================================
// OpenAPI Document Generator
// ============================================================================

/**
 * Generate the full OpenAPI document
 */
export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'My Blog API',
      version: '1.0.0',
      description: `
# My Blog API Documentation

This API provides full CRUD operations for blog posts, categories, tags, and media management.

## Authentication

Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## Response Format

All responses follow a consistent format:

**Success Response:**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
\`\`\`
      `,
    },
    servers: [{ url: '/api/v1', description: 'Current API version' }],
  })
}

// ============================================================================
// Nuxt Plugin Export
// ============================================================================

/**
 * Nuxt server plugin for Swagger UI
 * Mounts Swagger UI at /docs (development only)
 * Serves OpenAPI JSON at /api/docs/json
 */
export default defineNitroPlugin((nitroApp) => {
  // Only enable Swagger UI in development
  if (!import.meta.dev) {
    return
  }

  // Serve OpenAPI JSON
  nitroApp.router.get('/api/docs/json', () => {
    const openApiDoc = generateOpenApiDocument()
    return openApiDoc
  })

  // Serve Swagger UI HTML
  nitroApp.router.get('/docs', () => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="My Blog API Documentation" />
    <title>My Blog API - Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
      *, *:before, *:after { box-sizing: inherit; }
      body { margin: 0; background: #fafafa; }
      .swagger-ui .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function() {
        window.ui = SwaggerUIBundle({
          url: '/api/docs/json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: "StandaloneLayout",
          docExpansion: 'list',
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          displayRequestDuration: true,
          filter: true,
          persistAuthorization: true,
          validatorUrl: null
        });
      };
    </script>
  </body>
</html>
    `
  })

  console.log('[Swagger] API Documentation available at:')
  console.log('  - Swagger UI: http://localhost:3000/docs')
  console.log('  - OpenAPI JSON: http://localhost:3000/api/docs/json')
})
