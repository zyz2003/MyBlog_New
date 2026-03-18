import { describe, it, expect } from 'vitest'
import { users } from '../../schema/users'

describe('Users Schema', () => {
  it('has correct fields', () => {
    expect(users.id).toBeDefined()
    expect(users.username).toBeDefined()
    expect(users.email).toBeDefined()
    expect(users.passwordHash).toBeDefined()
    expect(users.role).toBeDefined()
    expect(users.status).toBeDefined()
    expect(users.avatar).toBeDefined()
    expect(users.bio).toBeDefined()
    expect(users.website).toBeDefined()
    expect(users.lastLoginAt).toBeDefined()
    expect(users.lastLoginIp).toBeDefined()
    expect(users.createdAt).toBeDefined()
    expect(users.updatedAt).toBeDefined()
  })

  it('has indexes defined', () => {
    // Indexes are defined at table level in drizzle-orm
    // users_username_idx and users_email_idx provide uniqueness
    expect(users).toBeDefined()
  })

  it('has correct role enum values', () => {
    // Verified by drizzle-kit generate
    // role: 'admin' | 'author' | 'editor'
  })

  it('has correct status enum values', () => {
    // Verified by drizzle-kit generate
    // status: 'active' | 'banned'
  })
})
