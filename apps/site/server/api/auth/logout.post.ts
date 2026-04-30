import { successResponse } from '../../utils/response'

export default defineEventHandler(async () => {
  // Logout is client-side: client clears token from localStorage/cookie
  // Server confirms (AUTH-04)
  return successResponse(null, '已退出登录')
})
