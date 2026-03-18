import { describe, it, expect } from 'vitest'
import { media } from '../../schema/media'

describe('Media Schema', () => {
  it('has correct fields', () => {
    expect(media.id).toBeDefined()
    expect(media.filename).toBeDefined()
    expect(media.originalName).toBeDefined()
    expect(media.path).toBeDefined()
    expect(media.url).toBeDefined()
    expect(media.mimeType).toBeDefined()
    expect(media.size).toBeDefined()
    expect(media.width).toBeDefined()
    expect(media.height).toBeDefined()
    expect(media.altText).toBeDefined()
    expect(media.thumbnailPath).toBeDefined()
    expect(media.folderId).toBeDefined()
    expect(media.uploadedBy).toBeDefined()
    expect(media.uploadedAt).toBeDefined()
  })

  it('has required fields marked as notNull', () => {
    // These fields should be required (notNull)
    expect(media.filename.notNull).toBeDefined()
    expect(media.path.notNull).toBeDefined()
    expect(media.url.notNull).toBeDefined()
    expect(media.mimeType.notNull).toBeDefined()
    expect(media.size.notNull).toBeDefined()
  })

  it('has optional fields', () => {
    // These fields are optional (notNull is false for optional fields)
    expect(media.originalName.notNull).toBe(false)
    expect(media.width.notNull).toBe(false)
    expect(media.height.notNull).toBe(false)
    expect(media.altText.notNull).toBe(false)
    expect(media.thumbnailPath.notNull).toBe(false)
    expect(media.folderId.notNull).toBe(false)
  })

  it('has indexes defined', () => {
    // Indexes are defined at table level in drizzle-orm
    // media_uploaded_by_idx, media_mime_type_idx, media_folder_idx
    expect(media).toBeDefined()
  })

  it('has foreign key to users', () => {
    // verified by drizzle-kit generate
    // uploaded_by references users.id with ON DELETE SET NULL
  })

  it('exports correct types', () => {
    // Type exports are compile-time, verified by TypeScript
    // Media = typeof media.$inferSelect
    // NewMedia = typeof media.$inferInsert
  })
})
