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

/** Business error codes */
export const BusinessErrors = {
  ARTICLE_NOT_FOUND: { code: 3001, message: '文章不存在' },
  CATEGORY_NOT_FOUND: { code: 3002, message: '分类不存在' },
  CATEGORY_HAS_CHILDREN: { code: 3003, message: '该分类下有子分类，无法删除' },
  TAG_NOT_FOUND: { code: 3004, message: '标签不存在' },
  DUPLICATE_SLUG: { code: 3005, message: 'Slug 已存在' },
  INVALID_PARENT: { code: 3006, message: '父分类不存在或不能设置自身为父分类' },
  SETTING_NOT_FOUND: { code: 3007, message: '设置项不存在' },
  MEDIA_NOT_FOUND: { code: 3008, message: '媒体文件不存在' },
  INVALID_FILE_TYPE: { code: 3009, message: '不支持的文件类型' },
  FILE_TOO_LARGE: { code: 3010, message: '文件大小超过限制' },
} as const

/** System error codes */
export const SystemErrors = {
  INTERNAL: { code: 9001, message: '服务器内部错误' },
  DATABASE: { code: 9002, message: '数据库错误' },
} as const

/** Rate limit error codes */
export const RateLimitErrors = {
  TOO_MANY_REQUESTS: { code: 4001, message: '请求过于频繁，请稍后再试' },
} as const
