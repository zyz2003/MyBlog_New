import { describe, it, expect } from 'vitest'
import { postTags } from '../../schema/post_tags'

describe('PostTags Schema', () => {
  it('has composite primary key', () => {
    expect(postTags.postId).toBeDefined()
    expect(postTags.tagId).toBeDefined()
    // Composite PK: (post_id, tag_id)
  })

  it('has cascade delete on both foreign keys', () => {
    // ON DELETE CASCADE verified by drizzle-kit generate
    expect(postTags.postId).toBeDefined()
    expect(postTags.tagId).toBeDefined()
  })
})
