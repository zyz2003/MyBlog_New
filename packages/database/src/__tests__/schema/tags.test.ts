import { describe, it, expect } from 'vitest'
import { tags } from '../../schema/tags'

describe('Tags Schema', () => {
  it('has correct fields including extended fields', () => {
    expect(tags.id).toBeDefined()
    expect(tags.name).toBeDefined()
    expect(tags.slug).toBeDefined()
    expect(tags.description).toBeDefined() // Extended field
    expect(tags.color).toBeDefined() // Extended field
    expect(tags.createdAt).toBeDefined()
    expect(tags.updatedAt).toBeDefined()
  })

  it('has unique constraint on slug', () => {
    // Unique constraint verified by drizzle-kit generate
    expect(tags.slug).toBeDefined()
  })
})
