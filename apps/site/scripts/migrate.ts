/**
 * 数据库迁移脚本
 * 运行此脚本初始化数据库
 *
 * Usage: pnpm db:migrate
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { mkdirSync, existsSync } from 'fs';

const dbPath = './data/blog.db';

// 确保数据目录存在
const dir = dbPath.substring(0, dbPath.lastIndexOf('/'));
if (dir && !existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

console.log('Connecting to database:', dbPath);

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

console.log('Running database migrations...');

// 运行迁移
sqlite.exec(`
  -- 用户表
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    role TEXT DEFAULT 'subscriber' NOT NULL CHECK (role IN ('admin', 'editor', 'author', 'subscriber')),
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'banned')),
    last_login_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  -- 文章表
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    content_format TEXT DEFAULT 'markdown' NOT NULL CHECK (content_format IN ('markdown', 'html', 'rich-text')),
    cover_image TEXT,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published_at INTEGER,
    scheduled_at INTEGER,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_top INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    allow_comments INTEGER DEFAULT 1,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  -- 分类表
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  -- 标签表
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    post_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  -- 文章 - 分类关联表
  CREATE TABLE IF NOT EXISTS post_categories (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (post_id, category_id)
  );

  -- 文章 - 标签关联表
  CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (post_id, tag_id)
  );

  -- 索引
  CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
  CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
  CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
`);

console.log('✓ Database tables created successfully!');

// 创建默认管理员用户
console.log('Creating default admin user...');

const existingAdmin = sqlite.prepare('SELECT * FROM users WHERE role = ?').get('admin');

if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const adminId = nanoid();

  sqlite.prepare(`
    INSERT INTO users (id, username, email, password, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))
  `).run(adminId, 'admin', 'admin@example.com', hashedPassword, 'admin', 'active');

  console.log('✓ Default admin user created!');
  console.log('  Username: admin');
  console.log('  Password: admin123');
  console.log('  (请首次登录后修改密码)');
} else {
  console.log('✓ Admin user already exists');
}

// 创建迁移记录表
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id TEXT PRIMARY KEY,
    executed_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

// 记录迁移
const existingMigration = sqlite.prepare('SELECT * FROM _migrations WHERE id = ?').get('0001_init');
if (!existingMigration) {
  sqlite.prepare('INSERT INTO _migrations (id) VALUES (?)').run('0001_init');
  console.log('✓ Migration 0001_init recorded');
}

sqlite.close();

console.log('\n✅ Database initialization complete!');
console.log('\nNext steps:');
console.log('  1. Run "pnpm dev" to start the development server');
console.log('  2. Login with admin/admin123');
console.log('  3. Change the default password!');
