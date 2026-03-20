import { z } from 'zod'

/**
 * Login request schema
 * - username: 1-50 characters, alphanumeric and underscore allowed
 * - password: 6-100 characters
 */
export const loginSchema = z.object({
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

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Register request schema
 * - username: same as login
 * - password: same as login
 * - email: valid email format
 */
export const registerSchema = z.object({
  username: loginSchema.shape.username,
  password: loginSchema.shape.password,
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
