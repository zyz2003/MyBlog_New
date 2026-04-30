import { readMultipartFormData } from 'h3'
import { MediaService } from '../../services/media.service'
import { successResponse } from '../../utils/response'

/**
 * POST /api/media/upload
 * Protected endpoint — accepts multipart form data with 'file' field
 * Auth handled by middleware (/api/media/ is protected)
 */
export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: '未登录',
    })
  }

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({
      statusCode: 400,
      message: '请上传文件',
    })
  }

  const filePart = parts.find(p => p.name === 'file')
  if (!filePart || !filePart.data) {
    throw createError({
      statusCode: 400,
      message: '请上传文件 (field name: "file")',
    })
  }

  const record = await MediaService.upload(
    filePart.data,
    filePart.filename || 'unknown',
    filePart.type || 'application/octet-stream',
    filePart.data.length,
    user.id,
  )

  return successResponse(record, '文件上传成功')
})
