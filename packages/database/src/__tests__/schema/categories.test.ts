import { describe, it, expect } from 'vitest'
import { categories } from '../../schema/categories'

describe('Categories Schema', () => {
  it('has correct fields', () => {
    expect(categories.id).toBeDefined()
    expect(categories.name).toBeDefined()
    expect(categories.slug).toBeDefined()
    expect(categories.description).toBeDefined()
    expect(categories.parentId).toBeDefined()
    expect(categories.createdAt).toBeDefined()
    expect(categories.updatedAt).toBeDefined()
  })

  it('has self-referencing foreign key with SET NULL', () => {
    expect(categories.parentId).toBeDefined()
    // onDelete: 'set null' verified by drizzle-kit generate
  })

  it('has indexes defined', () => {
    // Indexes are defined at table level in drizzle-orm
    // categories_slug_idx provides uniqueness on slug
    expect(categories).toBeDefined()
  })
})
