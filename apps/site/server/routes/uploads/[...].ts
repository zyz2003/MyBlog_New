import { readFile } from 'fs/promises'
import { join, extname } from 'path'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
}

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  const filePath = path.replace(/^\/uploads\//, '')

  if (!filePath || filePath.includes('..')) {
    throw createError({ statusCode: 400, message: '无效路径' })
  }

  const fullPath = join(process.cwd(), 'uploads', filePath)

  try {
    const data = await readFile(fullPath)
    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

    return data
  }
  catch {
    throw createError({ statusCode: 404, message: '文件不存在' })
  }
})
