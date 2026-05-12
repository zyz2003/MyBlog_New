import { MediaService } from '../../services/media.service'

/**
 * GET /api/media/:filename
 * Serves media file from database
 */
export default defineEventHandler(async (event) => {
  const filename = event.context.params?.filename

  if (!filename) {
    throw createError({
      statusCode: 400,
      message: '文件名不能为空',
    })
  }

  const file = await MediaService.getFileByFilename(filename)

  if (!file || !file.data) {
    throw createError({
      statusCode: 404,
      message: '文件不存在',
    })
  }

  // Set headers for file download
  setHeader(event, 'Content-Type', file.mimeType)
  setHeader(event, 'Content-Length', file.size)
  setHeader(event, 'Content-Disposition', `inline; filename="${file.filename}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return file.data
})
