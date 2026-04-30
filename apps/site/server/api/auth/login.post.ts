import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { users } from '../../db/schema'
import { verifyPassword, generateToken } from '../../services/auth'
import { successResponse, errorResponse, AuthErrors } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate required fields (AUTH-01)
  if (!body?.username || !body?.password) {
    throw createError({
      statusCode: 400,
      data: errorResponse(2001, '用户名和密码不能为空'),
    })
  }

  // Find user by username
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, body.username))
    .limit(1)

  // Verify credentials — same error for wrong username or wrong password (security)
  if (!user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.INVALID_CREDENTIALS.code, AuthErrors.INVALID_CREDENTIALS.message),
    })
  }

  const passwordValid = await verifyPassword(body.password, user.password)
  if (!passwordValid) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.INVALID_CREDENTIALS.code, AuthErrors.INVALID_CREDENTIALS.message),
    })
  }

  // Check account status
  if (user.status !== 'active') {
    throw createError({
      statusCode: 403,
      data: errorResponse(AuthErrors.ACCOUNT_DISABLED.code, AuthErrors.ACCOUNT_DISABLED.message),
    })
  }

  // Update lastLoginAt
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id))

  // Generate JWT (AUTH-02: 7-day expiry)
  const token = await generateToken(user.id)

  // Return token + user info (exclude password)
  return successResponse({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role,
    },
  })
})
