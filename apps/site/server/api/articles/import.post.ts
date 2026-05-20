import { readMultipartFormData } from 'h3'
import { successResponse } from '../../utils/response'
import { db } from '../../utils/db'
import { posts } from '../../db/schema'

/**
 * POST /api/articles/import
 * Import Markdown file(s) as articles
 * Supports single file or batch import
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

  const results: { filename: string; title: string; status: 'success' | 'error'; message?: string }[] = []

  for (const part of parts) {
    if (part.name !== 'files' && part.name !== 'file') continue
    if (!part.data || part.data.length === 0) continue

    const filename = part.filename || 'unknown.md'
    const content = part.data.toString('utf-8')
    let parsedTitle = filename.replace(/\.(md|markdown)$/, '')

    // Validate it's a markdown file
    if (!filename.endsWith('.md') && !filename.endsWith('.markdown')) {
      results.push({
        filename,
        title: '',
        status: 'error',
        message: '仅支持 .md 或 .markdown 文件',
      })
      continue
    }

    try {
      // Parse frontmatter if exists (simple YAML-like parsing)
      let title = parsedTitle
      let bodyContent = content
      let frontmatter: Record<string, string> = {}

      // Check for frontmatter between --- markers
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
      if (frontmatterMatch) {
        const yamlContent = frontmatterMatch[1]
        bodyContent = frontmatterMatch[2]

        // Simple YAML parsing for title
        const titleMatch = yamlContent.match(/title:\s*["']?(.+?)["']?\s*$/m)
        if (titleMatch) {
          title = titleMatch[1].trim()
        }

        // Parse other fields
        const slugMatch = yamlContent.match(/slug:\s*["']?(.+?)["']?\s*$/m)
        const excerptMatch = yamlContent.match(/excerpt:\s*["']?(.+?)["']?\s*$/m)
        const statusMatch = yamlContent.match(/status:\s*["']?(.+?)["']?\s*$/m)

        if (slugMatch) frontmatter.slug = slugMatch[1].trim()
        if (excerptMatch) frontmatter.excerpt = excerptMatch[1].trim()
        if (statusMatch) frontmatter.status = statusMatch[1].trim()
      } else {
        // Try to extract title from first H1 heading
        const h1Match = content.match(/^#\s+(.+)$/m)
        if (h1Match) {
          title = h1Match[1].trim()
          // Remove the H1 line from content
          bodyContent = content.replace(/^#\s+.+\n+/, '')
        }
      }

      // Generate slug from title
      const slug = frontmatter.slug || title
        .toLowerCase()
        .replace(/[^\w一-龥]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Generate excerpt from content
      const excerpt = frontmatter.excerpt || bodyContent
        .replace(/[#*`\[\]()]/g, '')
        .substring(0, 200)
        .trim()

      // Determine status
      let status: 'draft' | 'published' = 'draft'
      if (frontmatter.status === 'published') status = 'published'

      // Create the article
      const [post] = await db.insert(posts).values({
        title,
        slug: slug || `${Date.now()}`,
        content: bodyContent,
        excerpt,
        status,
        authorId: user.id,
      }).returning()

      results.push({
        filename,
        title,
        status: 'success',
      })
      parsedTitle = title
    }
    catch (e: unknown) {
      results.push({
        filename,
        title: parsedTitle,
        status: 'error',
        message: e instanceof Error ? e.message : '导入失败',
      })
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  return successResponse({
    results,
    successCount,
    errorCount,
    message: `成功导入 ${successCount} 篇，失败 ${errorCount} 篇`,
  })
})
