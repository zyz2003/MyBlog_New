import { db } from '../db'
import { users, categories, tags, posts, postTags } from '../schema'
import { generateId } from '../utils/id'
import { hashPassword } from '../utils/password'

export async function seed() {
  console.log('Starting seed...')

  // Create admin user per CONTEXT.md
  const adminId = generateId()
  const hashedPassword = await hashPassword('CHANGE_ME_FIRST') // Placeholder password

  await db.get().insert(users).values({
    id: adminId,
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: hashedPassword,
    role: 'admin',
    status: 'active',
    bio: 'Site Administrator',
  })
  console.log('Created admin user (username: admin, email: admin@example.com)')

  // Create 3 default categories per CONTEXT.md
  const techId = generateId()
  const lifeId = generateId()
  const essaysId = generateId()

  await db
    .get()
    .insert(categories)
    .values([
      {
        id: techId,
        name: '技术',
        slug: 'tech',
        description: '技术文章和教程',
      },
      {
        id: lifeId,
        name: '生活',
        slug: 'life',
        description: '生活随笔和感悟',
      },
      {
        id: essaysId,
        name: '随笔',
        slug: 'essays',
        description: '读书笔记和随笔',
      },
    ])
  console.log('Created 3 default categories (技术，生活，随笔)')

  // Create 5-8 sample tags per CONTEXT.md
  const jsId = generateId()
  const tsId = generateId()
  const vueId = generateId()
  const nuxtId = generateId()
  const nodeId = generateId()
  const lifeTagId = generateId()
  const essayTagId = generateId()

  await db
    .get()
    .insert(tags)
    .values([
      {
        id: jsId,
        name: 'JavaScript',
        slug: 'javascript',
        color: '#f7df1e',
        description: 'JavaScript 语言相关',
      },
      {
        id: tsId,
        name: 'TypeScript',
        slug: 'typescript',
        color: '#3178c6',
        description: 'TypeScript 语言相关',
      },
      { id: vueId, name: 'Vue', slug: 'vue', color: '#4fc08d', description: 'Vue.js 框架' },
      { id: nuxtId, name: 'Nuxt', slug: 'nuxt', color: '#00dc82', description: 'Nuxt.js 框架' },
      {
        id: nodeId,
        name: 'Node.js',
        slug: 'nodejs',
        color: '#339933',
        description: 'Node.js 运行时',
      },
      {
        id: lifeTagId,
        name: '生活感悟',
        slug: 'life-reflections',
        color: '#ff6b6b',
        description: '生活相关的感悟和思考',
      },
      {
        id: essayTagId,
        name: '读书笔记',
        slug: 'reading-notes',
        color: '#4ecdc4',
        description: '书籍阅读笔记和心得',
      },
    ])
  console.log('Created 7 sample tags')

  // Create 3-5 sample posts per CONTEXT.md
  const helloWorldId = generateId()
  const nuxtTestId = generateId()
  const lifePostId = generateId()

  await db
    .get()
    .insert(posts)
    .values([
      {
        id: helloWorldId,
        title: 'Hello World - 博客开篇',
        slug: 'hello-world',
        content: '这是我的第一篇博客文章...',
        excerpt: '博客系统正式上线',
        coverImage: '/images/hello-world.jpg',
        seoTitle: 'Hello World - 博客开篇',
        seoDescription: '个人博客系统正式上线',
        status: 'published',
        authorId: adminId,
        categoryId: techId,
        viewCount: 0,
        likeCount: 0,
      },
      {
        id: nuxtTestId,
        title: 'Nuxt 3 入门教程',
        slug: 'nuxt-3-getting-started',
        content: 'Nuxt 3 是基于 Vue 3 的全栈框架...',
        excerpt: '学习 Nuxt 3 的基础知识',
        coverImage: '/images/nuxt3.jpg',
        seoTitle: 'Nuxt 3 入门教程',
        seoDescription: '从零开始学习 Nuxt 3',
        status: 'published',
        authorId: adminId,
        categoryId: techId,
        viewCount: 0,
        likeCount: 0,
      },
      {
        id: lifePostId,
        title: '2026 年的第一篇随笔',
        slug: 'first-essay-2026',
        content: '新的一年，新的开始...',
        excerpt: '2026 年的生活感悟',
        status: 'published',
        authorId: adminId,
        categoryId: lifeId,
        viewCount: 0,
        likeCount: 0,
      },
    ])
  console.log('Created 3 sample posts')

  // Associate posts with tags
  await db
    .get()
    .insert(postTags)
    .values([
      { postId: helloWorldId, tagId: nuxtId },
      { postId: nuxtTestId, tagId: jsId },
      { postId: nuxtTestId, tagId: tsId },
      { postId: nuxtTestId, tagId: vueId },
      { postId: nuxtTestId, tagId: nuxtId },
      { postId: lifePostId, tagId: lifeTagId },
    ])
  console.log('Associated posts with tags')

  console.log('Seed completed successfully!')
  console.log('')
  console.log('=== Admin Account ===')
  console.log('Username: admin')
  console.log('Email: admin@example.com')
  console.log('Password: CHANGE_ME_FIRST (please change on first login!)')
  console.log('')
}

// Run seed if executed directly
// @ts-expect-error - vitest runtime check
if (import.meta.vitest === undefined) {
  seed().catch(console.error)
}
