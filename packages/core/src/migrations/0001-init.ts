/**
 * 数据库迁移脚本
 */

export const migrations = [
  {
    id: '0001_init',
    name: '初始化核心表',
    sql: `
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
    `
  }
];
