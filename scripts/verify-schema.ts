/**
 * Schema Verification Script
 *
 * 验证正式 Schema 可以被正确加载和使用
 * 在 CI/CD 中运行，确保 Schema 没有问题
 *
 * 运行方式：npx tsx scripts/verify-schema.ts
 */

import * as schema from '@my-blog/database/schema'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const requiredTables = ['users', 'posts', 'tags', 'postTags', 'categories', 'media']

const requiredFields: Record<string, string[]> = {
  users: [
    'id',
    'username',
    'email',
    'passwordHash',
    'avatar',
    'bio',
    'website',
    'lastLoginAt',
    'lastLoginIp',
  ],
  posts: [
    'id',
    'title',
    'slug',
    'content',
    'status',
    'authorId',
    'categoryId',
    'excerpt',
    'coverImage',
  ],
  tags: ['id', 'name', 'slug', 'color'],
  postTags: ['postId', 'tagId', 'createdAt'],
  categories: ['id', 'name', 'slug', 'parentId'],
  media: ['id', 'filename', 'mimeType', 'size', 'url'],
}

let exitCode = 0
const errors: string[] = []
const warnings: string[] = []

console.log('🔍 Verifying database schema...\n')

// Check tables exist
console.log('📋 Checking table exports...')
for (const table of requiredTables) {
  if (!(table in schema)) {
    const error = `❌ Missing table: ${table}`
    errors.push(error)
    console.error(error)
    exitCode = 1
  } else {
    console.log(`✅ Table: ${table}`)
  }
}

console.log()

// Check fields exist
console.log('📋 Checking table fields...')
for (const [table, fields] of Object.entries(requiredFields)) {
  const tableSchema = schema[table as keyof typeof schema]
  if (!tableSchema) {
    continue // Already reported above
  }

  for (const field of fields) {
    // Try camelCase first (Drizzle ORM default)
    const camelCaseField = field.charAt(0).toLowerCase() + field.slice(1)
    // Then try snake_case (SQLite column names)
    const snakeCaseField = field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

    const hasField = camelCaseField in tableSchema || snakeCaseField in tableSchema

    if (!hasField) {
      const error = `❌ Missing field: ${table}.${field} (tried: ${camelCaseField}, ${snakeCaseField})`
      errors.push(error)
      console.error(error)
      exitCode = 1
    } else {
      console.log(`✅ Field: ${table}.${field}`)
    }
  }
}

console.log()

// Check for test file inconsistencies
console.log('🔍 Checking test file consistency...')

const dbTestPath = path.join(__dirname, '../apps/site/tests/db.ts')
const postServiceTestPath = path.join(
  __dirname,
  '../apps/site/tests/server/services/post.service.test.ts'
)

// Check db.ts for manual CREATE TABLE
if (fs.existsSync(dbTestPath)) {
  const dbContent = fs.readFileSync(dbTestPath, 'utf-8')

  // Check for wrong table name
  if (dbContent.includes('posts_tags')) {
    const warning = `⚠️  ${path.relative(__dirname, dbTestPath)} uses wrong table name 'posts_tags' (should be 'post_tags')`
    warnings.push(warning)
    console.warn(warning)
  }

  // Check for missing createdAt in post_tags
  if (dbContent.includes('CREATE TABLE post_tags') && !dbContent.includes('created_at')) {
    const error = `❌ ${path.relative(__dirname, dbTestPath)}: post_tags table missing created_at field`
    errors.push(error)
    console.error(error)
    exitCode = 1
  }
}

// Check post.service.test.ts for manual CREATE TABLE
if (fs.existsSync(postServiceTestPath)) {
  const testContent = fs.readFileSync(postServiceTestPath, 'utf-8')

  // Check for wrong table name
  if (testContent.includes('posts_tags')) {
    const warning = `⚠️  ${path.relative(__dirname, postServiceTestPath)} uses wrong table name 'posts_tags' (should be 'post_tags')`
    warnings.push(warning)
    console.warn(warning)
  }
}

console.log()

// Summary
console.log('='.repeat(60))
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Schema verification passed!')
  console.log('   All tables and fields are correctly defined.')
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s) found - Schema verification FAILED!`)
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} warning(s) found - Review recommended!`)
  }

  if (errors.length > 0) {
    console.log('\n📝 Errors summary:')
    errors.forEach((err) => console.log(`   ${err}`))
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings summary:')
    warnings.forEach((warn) => console.log(`   ${warn}`))
  }
}

console.log()
process.exit(exitCode)
