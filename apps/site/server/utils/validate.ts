import type { H3Event } from 'h3'
import { z } from 'zod'
import { HTTPError } from './error'
import type { ErrorDetail } from './error'

/**
 * Format Zod errors into our standard error details format
 */
function formatZodErrors(error: z.ZodError): ErrorDetail[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))
}

/**
 * Validate and parse data with a Zod schema
 * Throws HTTPError(400, 'VALIDATION_ERROR') on failure
 */
function validate<T>(data: unknown, schema: z.ZodType<T>, context: string): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const details = formatZodErrors(result.error)
    throw HTTPError.VALIDATION_ERROR(`Invalid ${context}`, details)
  }

  return result.data
}

/**
 * Validate request body against a Zod schema
 * @param event - H3 event
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated body data
 * @throws HTTPError(400, 'VALIDATION_ERROR') on invalid body
 */
export async function validateBody<T>(event: H3Event, schema: z.ZodType<T>): Promise<T> {
  const body = await event.context.$fetch('')
  return validate(body, schema, 'request body')
}

/**
 * Validate request body against a Zod schema (simpler version without event)
 * @param body - Request body to validate
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated body data
 * @throws HTTPError(400, 'VALIDATION_ERROR') on invalid body
 */
export function validateBodySync<T>(body: unknown, schema: z.ZodType<T>): T {
  return validate(body, schema, 'request body')
}

/**
 * Validate query parameters against a Zod schema
 * @param query - Query parameters object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated query data
 * @throws HTTPError(400, 'VALIDATION_ERROR') on invalid query
 */
export function validateQuery<T>(query: unknown, schema: z.ZodType<T>): T {
  return validate(query, schema, 'query parameters')
}

/**
 * Validate route parameters against a Zod schema
 * @param params - Route parameters object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated params data
 * @throws HTTPError(400, 'VALIDATION_ERROR') on invalid params
 */
export function validateParams<T>(params: unknown, schema: z.ZodType<T>): T {
  return validate(params, schema, 'route parameters')
}

/**
 * Get validated query parameters from H3 event
 * @param event - H3 event
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated query data
 */
export function getValidatedQuery<T>(event: H3Event, schema: z.ZodType<T>): T {
  return validateQuery(getQuery(event), schema)
}

/**
 * Get query parameters from H3 event
 */
function getQuery(event: H3Event): Record<string, unknown> {
  return event.context.query || {}
}

/**
 * Validate request body with a schema - Nitro handler version
 * Usage: const data = await validateRequestBody(event, loginSchema)
 */
export async function validateRequestBody<T>(event: H3Event, schema: z.ZodType<T>): Promise<T> {
  const body = await readBody(event)
  return validate(body, schema, 'request body')
}

/**
 * Read body from H3 event (helper for internal use)
 */
async function readBody(event: H3Event): Promise<unknown> {
  // For Nitro/H3, use readBody from h3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (event as any)._request?.body ?? (event as any).body
}
