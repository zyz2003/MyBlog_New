/**
 * Unified API response helpers
 * Per architecture doc section 4.5.2
 */

/** Success response: { code: 0, data: T } */
export function successResponse<T>(data: T, message?: string) {
  return {
    code: 0,
    data,
    ...(message ? { message } : {}),
  }
}

/** Error response: { code: number, message: string } */
export function errorResponse(code: number, message: string, details?: unknown) {
  return {
    code,
    message,
    ...(process.env.NODE_ENV !== 'production' && details ? { details } : {}),
  }
}

/** Auth error codes */
export const AuthErrors = {
  UNAUTHENTICATED: { code: 1001, message: '未登录' },
  UNAUTHORIZED: { code: 1002, message: '无权限' },
  TOKEN_EXPIRED: { code: 1003, message: 'Token 已过期' },
  INVALID_CREDENTIALS: { code: 1004, message: '用户名或密码错误' },
  ACCOUNT_DISABLED: { code: 1005, message: '账号已禁用' },
} as const

/** Validation error codes */
export const ValidationErrors = {
  MISSING_PARAM: { code: 2001, message: '参数缺失' },
  INVALID_FORMAT: { code: 2002, message: '参数格式错误' },
} as const

/** System error codes */
export const SystemErrors = {
  INTERNAL: { code: 9001, message: '服务器内部错误' },
  DATABASE: { code: 9002, message: '数据库错误' },
} as const
