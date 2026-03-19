import { afterAll, beforeAll, beforeEach } from 'vitest'
import { resetTestDatabase } from './db'

// Global test setup - runs once before all tests
beforeAll(() => {
  console.log('[Test] Global setup - initializing test environment')
})

// Global test teardown - runs once after all tests
afterAll(async () => {
  console.log('[Test] Global teardown - cleaning up test environment')
  // Reset database after all tests complete
  await resetTestDatabase()
})

// Reset database between each test for isolation
beforeEach(async () => {
  // Reset database state before each test
  await resetTestDatabase()
})
